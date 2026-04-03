import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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

    const { careerId, careerTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    // Fetch career data if careerId provided
    let career: any = null;
    if (careerId) {
      const { data } = await supabase.from("careers").select("*").eq("id", careerId).single();
      career = data;
    }

    // Fetch quiz scores
    const { data: latestSession } = await supabase
      .from("quiz_sessions")
      .select("category_scores, score")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    const prompt = `Analyze the skill gap for this student targeting "${careerTitle || career?.title}" career.

Student Profile:
- Education: ${profile?.current_study_level || "Not specified"}
- Course: ${profile?.current_course || "Not specified"}
- Interests: ${profile?.interests?.join(", ") || "Not specified"}
- Aptitude Score: ${latestSession?.score || "Not taken"}%
- Category Scores: ${JSON.stringify(latestSession?.category_scores || {})}

Career: ${careerTitle || career?.title}
${career?.skills_required ? `Known Required Skills: ${career.skills_required.join(", ")}` : ""}
${career?.requirements ? `Requirements: ${career.requirements}` : ""}

Based on the student's profile and the career requirements, identify what skills they likely have and what they're missing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a career skills analyst for Indian students." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_skill_gap",
            description: "Return skill gap analysis",
            parameters: {
              type: "object",
              properties: {
                required_skills: { type: "array", items: { type: "string" } },
                user_skills: { type: "array", items: { type: "string" }, description: "Skills the student likely has" },
                missing_skills: { type: "array", items: { type: "string" }, description: "Skills the student needs to acquire" },
                match_percentage: { type: "number", description: "0-100 skill match score" },
                recommendations: { type: "array", items: { type: "string" }, description: "3-5 actionable recommendations to close the gap" },
              },
              required: ["required_skills", "user_skills", "missing_skills", "match_percentage", "recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_skill_gap" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis generated");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Cache in DB
    await supabase.from("skill_gap_analyses").upsert({
      user_id: user.id,
      career_id: careerId || null,
      career_title: careerTitle || career?.title,
      required_skills: analysis.required_skills,
      user_skills: analysis.user_skills,
      missing_skills: analysis.missing_skills,
      match_percentage: analysis.match_percentage,
    }, { onConflict: "user_id,career_id" }).select();

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skill-gap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
