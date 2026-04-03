import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { CAREER_TOOL_SYSTEM_PROMPT } from "../_shared/career-logic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { targetCareer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const language = profile?.preferred_language || 'en';

    // Fetch latest quiz scores
    const { data: latestSession } = await supabase
      .from("quiz_sessions")
      .select("category_scores, score")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const currentYear = new Date().getFullYear();

    const prompt = `Generate a detailed year-wise career roadmap for an Indian student.

Student Profile:
- Education: ${profile?.current_study_level || profile?.education_level || "Not specified"}
- Current Course: ${profile?.current_course || "Not specified"}
- Interests: ${profile?.interests?.join(", ") || "Not specified"}
- Target Career: ${targetCareer}
- Aptitude Score: ${latestSession?.score || "Not taken"}%
- Category Scores: ${JSON.stringify(latestSession?.category_scores || {})}
- Current Year: ${currentYear}

Generate a 3-5 year roadmap starting from ${currentYear}.`;

    const systemPrompt = `${CAREER_TOOL_SYSTEM_PROMPT(language)}

You are an expert career strategist for Indian students. Create a realistic, year-by-year career roadmap for the student's target career: ${targetCareer}.

${profile ? `Student History: ${profile.education_level}, Course: ${profile.current_course}, Interests: ${profile.interests?.join(", ")}` : ""}

ROADMAP STRATEGY:
- Start from the current academic year (${currentYear}).
- Align with Indian sessions (July-June).
- Include specific entrance exams (e.g., JEE, NEET, CLAT, CUET, GATE, CAT, UPSC, Bank PO) where applicable to ${targetCareer}.
- Recommend 3-5 specific online courses (Coursera, Udemy, NPTEL, SWAYAM) and certifications.
- Mention real-world internships, projects, and networking steps (LinkedIn, hackathons, moot courts).
- **STRICT LANGUAGE COMPLIANCE**: All fields (titles, actions, skills, milestones, schemes, courses) MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

Return structured tool calls only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_roadmap",
            description: "Create a year-wise career roadmap",
            parameters: {
              type: "object",
              properties: {
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      year: { type: "number" },
                      title: { type: "string", description: "Short title like 'Foundation Building'" },
                      actions: { type: "array", items: { type: "string" }, description: "3-5 specific actions" },
                      skills: { type: "array", items: { type: "string" }, description: "Skills to acquire" },
                      milestones: { type: "array", items: { type: "string" }, description: "Key milestones" },
                      schemes: { type: "array", items: { type: "string" }, description: "Relevant Indian government schemes or scholarships" },
                      courses: { type: "array", items: { type: "string" }, description: "Suggested online courses or certifications" },
                    },
                    required: ["year", "title", "actions", "skills", "milestones", "schemes", "courses"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["steps"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_roadmap" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorBody = await response.text();
      console.error(`[Roadmap] AI gateway error ${response.status}:`, errorBody);
      throw new Error(`AI gateway error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    const textResponse = result.choices?.[0]?.message?.content;
    
    if (!toolCall) {
      if (textResponse) {
        return new Response(JSON.stringify({ error: textResponse, isGuidance: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      throw new Error("No roadmap generated");
    }

    const roadmapData = JSON.parse(toolCall.function.arguments);

    // Save to DB
    const { data: existing } = await supabase
      .from("career_roadmaps")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_career", targetCareer)
      .single();

    if (existing) {
      await supabase.from("career_roadmaps").update({
        roadmap_json: roadmapData.steps,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("career_roadmaps").insert({
        user_id: user.id,
        target_career: targetCareer,
        roadmap_json: roadmapData.steps,
      });
    }

    return new Response(JSON.stringify({ roadmap: roadmapData.steps, targetCareer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-career-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
