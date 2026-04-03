import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { CAREER_TOOL_SYSTEM_PROMPT } from "../_shared/career-logic.ts";

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

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch user profile for personalization
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

    const profileContext = profile ? `
Student Profile:
- Name: ${profile.full_name || "Unknown"}
- Language: ${language === 'hi' ? 'Hindi' : 'English'}
- Education Level: ${profile.current_study_level || profile.education_level || "Not specified"}
- Current Course: ${profile.current_course || "Not specified"}
- Interests: ${profile.interests?.join(", ") || "Not specified"}
- State: ${profile.preferred_state || "Not specified"}
- District: ${profile.preferred_district || "Not specified"}
- Target: ${profile.primary_target || "Not specified"}
${latestSession ? `- Aptitude Score: ${latestSession.score}%` : ""}
${latestSession?.category_scores ? `- Category Scores: ${JSON.stringify(latestSession.category_scores)}` : ""}
` : "";

    // Detect conversation patterns to avoid repetition
    const recentUserMessages = messages
      .filter((m: any) => m.role === "user")
      .slice(-5)
      .map((m: any) => m.content);
    
    const hasSimilarQuestions = recentUserMessages.length >= 2 && 
      recentUserMessages.some((msg: string, i: number) => 
        i > 0 && recentUserMessages.slice(0, i).some((prev: string) => {
          const similarity = prev.toLowerCase().split(' ').filter((w: string) => 
            msg.toLowerCase().includes(w) && w.length > 3
          ).length;
          return similarity >= 3;
        })
      );
    
    const antiRepetitionRule = hasSimilarQuestions 
      ? `\n\nCRITICAL: The student is asking similar questions. You MUST provide a DIFFERENT perspective, deeper detail, or new information. Do NOT repeat your previous answers. Expand with specific examples, alternative options, or actionable steps you haven't mentioned before.`
      : "";

    const systemPrompt = `${CAREER_TOOL_SYSTEM_PROMPT(language)}

You are AVSAR AI Mentor — a Senior Career Strategist for Indian students.

${profileContext}

CONVERSATION & REALISM RULES:
- Provide high-accuracy advice on degrees (B.Tech, MBBS, B.Com, LLB), exams (JEE, NEET, CUET, CAT, GATE), and recruitment.
- If the student is from ${profile?.preferred_state || "a certain state"}, mention state-specific benefits or colleges where applicable.
- Avoid generic encouragement; provide a specific "Market Reality Check" for any career mentioned.
- Format: Plain text, bullet points with dashes (-), no markdown bold/headers.
- Emojis: Use sparingly (🚀, 🎯, 🪜).
- End with a targeted coaching question or a specific next step.
- **STRICT LANGUAGE COMPLIANCE**: Your response MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

${antiRepetitionRule}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
