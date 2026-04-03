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

    // ========== GUARDRAILS: Block inappropriate/unprofessional inputs ==========
    const BLOCKED_CAREERS = ['thief', 'chor', 'beggar', 'bhikhari', 'hitman', 'smuggler', 'drug dealer', 'scammer', 'fraudster', 'pickpocket', 'prostitute', 'terrorist', 'gangster', 'mafia', 'serial killer', 'dacoit', 'extortionist', 'blackmailer', 'pirate', 'kidnapper'];
    
    const FUNNY_RESPONSES: Record<string, string> = {
      thief: "\ud83d\udea8 Sorry, AVSAR doesn't offer a B.Tech in Burglary! But Ethical Hacking pays \u20b915-50 LPA and you get PAID to break into systems. Much better benefits \u2014 no jail time! Try 'Cybersecurity Expert' instead. \ud83d\udd10",
      chor: "\ud83d\udea8 \u092e\u093e\u092b\u093c \u0915\u0930\u094b \u092d\u093e\u0908, '\u092a\u094d\u0930\u094b\u092b\u0947\u0936\u0928\u0932 \u091a\u094b\u0930' \u0915\u093e \u0915\u094b\u0908 \u0915\u094b\u0930\u094d\u0938 \u0928\u0939\u0940\u0902 \u0939\u0948! Ethical Hacking \u092e\u0947\u0902 \u20b915-50 LPA \u092e\u093f\u0932\u0924\u0947 \u0939\u0948\u0902\u0964 'Cybersecurity Expert' \u091f\u094d\u0930\u093e\u0908 \u0915\u0930\u094b! \ud83d\udd10",
      beggar: "\ud83d\ude4f AVSAR recommends careers with... you know, a salary! How about Social Work or NGO Management? Same energy, steady income! Try 'Social Worker' instead. \ud83d\udcbc",
      bhikhari: "\ud83d\ude4f \u092d\u093e\u0908, \u092d\u0940\u0916 \u092e\u093e\u0902\u0917\u0928\u0947 \u0915\u093e \u0930\u094b\u0921\u092e\u0948\u092a? \u0939\u092e\u093e\u0930\u0947 \u092a\u093e\u0938 \u0935\u094b \u0928\u0939\u0940\u0902 \u0939\u0948! Social Work \u092e\u0947\u0902 \u0938\u0930\u0915\u093e\u0930\u0940 \u0928\u094c\u0915\u0930\u0940 \u092e\u093f\u0932\u0924\u0940 \u0939\u0948! '\u0938\u093e\u092e\u093e\u091c\u093f\u0915 \u0915\u093e\u0930\u094d\u092f\u0915\u0930\u094d\u0924\u093e' \u091f\u094d\u0930\u093e\u0908 \u0915\u0930\u094b! \ud83d\udcbc",
      hitman: "\ud83c\udfaf John Wick is fictional! How about Defense Officer or Armed Forces? Same intensity, actual pension! Try 'Defense Officer'. \ud83c\udf96\ufe0f",
      smuggler: "\ud83d\udce6 Smuggling has a 100% chance of free government housing (jail)! Try Supply Chain Management \u2014 \u20b98-25 LPA and you go HOME after work! \ud83c\udfe0",
      'drug dealer': "\ud83d\udc8a Breaking Bad was a TV show, not a career guide! Pharmacy pays \u20b95-15 LPA legally. Try 'Pharmacist'! \ud83e\uddea",
      scammer: "\ud83d\udcde 'Hello, I am calling from Microsoft' is NOT a career! Try Cybersecurity Analyst \u2014 \u20b910-40 LPA to CATCH scammers. \ud83e\uddb8",
      gangster: "\ud83d\udd2b Gangs of Wasseypur was entertainment, not LinkedIn! Try 'Forensic Scientist' instead. \ud83d\udd2c",
      terrorist: "\u26d4 This is not something we can help with. Please use AVSAR for legitimate career guidance. If you're going through a tough time, reach out to iCall: 9152987821. \ud83d\udd4a\ufe0f",
    };
    
    const checkBlockedInput = (input: string): string | null => {
      const lower = input.toLowerCase().trim();
      for (const blocked of BLOCKED_CAREERS) {
        if (lower === blocked || lower.includes(blocked)) {
          return FUNNY_RESPONSES[blocked] || `\ud83d\ude05 "${input}" is not exactly what career counselors recommend! Try something like Engineering, Medicine, Law, or Business! \ud83d\ude80`;
        }
      }
      return null;
    };

    // Check for blocked input BEFORE calling AI
    const blockedResponse = checkBlockedInput(targetCareer);
    if (blockedResponse) {
      return new Response(JSON.stringify({ error: blockedResponse, isGuidance: true }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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
        model: "google/gemini-2.5-flash",
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
