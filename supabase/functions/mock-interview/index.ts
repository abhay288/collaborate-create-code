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

    const { action, role, difficulty, interviewId, questionId, answer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const language = profile?.preferred_language || 'en';

    if (action === "generate_questions") {
      // Generate interview questions
      const prompt = `Generate exactly ${difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 5} interview questions for a ${role} position at ${difficulty} difficulty level.
      
${profile ? `Candidate background: ${profile.current_study_level || ''} student, interests: ${profile.interests?.join(', ') || 'general'}` : ''}

Return a JSON array of objects with: question_text, category (technical/behavioral/situational/aptitude), question_number (starting from 1).
Focus on realistic interview questions that would be asked in India.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `${CAREER_TOOL_SYSTEM_PROMPT(language)}\n\nYou are an expert interview coach. Return only valid JSON arrays. Ensure questions are valid and career-related.\n\n**STRICT LANGUAGE COMPLIANCE**: Your questions MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.` },
            { role: "user", content: prompt }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_questions",
              description: "Return interview questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question_text: { type: "string" },
                        category: { type: "string" },
                        question_number: { type: "number" }
                      },
                      required: ["question_text", "category", "question_number"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_questions" } }
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI error:", response.status, t);
        throw new Error("AI service error");
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      const questions = JSON.parse(toolCall?.function?.arguments || "{}").questions || [];

      // Create interview record
      const { data: interview, error: intErr } = await supabase
        .from("mock_interviews")
        .insert({ user_id: user.id, role, difficulty, status: "in_progress" })
        .select()
        .single();

      if (intErr) throw intErr;

      // Insert questions
      const questionRows = questions.map((q: any) => ({
        interview_id: interview.id,
        question_text: q.question_text,
        question_number: q.question_number,
        category: q.category,
      }));

      const { data: savedQuestions, error: qErr } = await supabase
        .from("mock_interview_questions")
        .insert(questionRows)
        .select();

      if (qErr) throw qErr;

      return new Response(JSON.stringify({ interview, questions: savedQuestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "evaluate_answer") {
      // Get the question
      const { data: question } = await supabase
        .from("mock_interview_questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (!question) throw new Error("Question not found");

      const evalPrompt = `Evaluate this interview answer.

Role: ${role}
Question: ${question.question_text}
Category: ${question.category}
Answer: ${answer}

Score 0-100 based on: technical accuracy (40%), clarity & structure (30%), relevance (20%), communication (10%).
Give specific, actionable feedback in 2-3 sentences.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `${CAREER_TOOL_SYSTEM_PROMPT(language)}\n\nYou are an expert interview evaluator for Indian job market. Apply classification rules: if the answer is offensive or irrelevant, provide appropriate redirected feedback.\n\n**STRICT LANGUAGE COMPLIANCE**: Your feedback MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.` },
            { role: "user", content: evalPrompt }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_evaluation",
              description: "Return evaluation score and feedback",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Score 0-100" },
                  feedback: { type: "string", description: "Specific feedback" }
                },
                required: ["score", "feedback"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_evaluation" } }
        }),
      });

      if (!response.ok) throw new Error("AI evaluation error");

      const evalData = await response.json();
      const evalResult = JSON.parse(evalData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");

      // Update question with answer and score
      await supabase
        .from("mock_interview_questions")
        .update({ user_answer: answer, ai_score: evalResult.score, ai_feedback: evalResult.feedback })
        .eq("id", questionId);

      return new Response(JSON.stringify(evalResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "complete_interview") {
      // Get all questions for this interview
      const { data: questions } = await supabase
        .from("mock_interview_questions")
        .select("*")
        .eq("interview_id", interviewId)
        .order("question_number");

      const answered = questions?.filter((q: any) => q.ai_score != null) || [];
      const avgScore = answered.length > 0
        ? Math.round(answered.reduce((sum: number, q: any) => sum + (q.ai_score || 0), 0) / answered.length)
        : 0;

      // Generate summary
      const summaryPrompt = `Summarize this mock interview performance:
Role: ${role}
Questions and scores: ${answered.map((q: any) => `Q: ${q.question_text} | Score: ${q.ai_score}/100`).join('\n')}
Overall average: ${avgScore}/100

Provide: 3 strengths, 3 areas for improvement, and a 2-sentence summary.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `${CAREER_TOOL_SYSTEM_PROMPT(language)}\n\nYou are an expert career mentor. Provide a summary that is motivational 🚀 and future-focused.\n\n**STRICT LANGUAGE COMPLIANCE**: Your summary (strengths, improvements, summary) MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.` },
            { role: "user", content: summaryPrompt }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_summary",
              description: "Return interview summary",
              parameters: {
                type: "object",
                properties: {
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  summary: { type: "string" }
                },
                required: ["strengths", "improvements", "summary"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_summary" } }
        }),
      });

      let strengths: string[] = [], improvements: string[] = [], summary = "";
      if (response.ok) {
        const sumData = await response.json();
        const parsed = JSON.parse(sumData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
        strengths = parsed.strengths || [];
        improvements = parsed.improvements || [];
        summary = parsed.summary || "";
      }

      await supabase
        .from("mock_interviews")
        .update({
          status: "completed",
          overall_score: avgScore,
          strengths,
          improvements,
          feedback_summary: summary,
          completed_at: new Date().toISOString()
        })
        .eq("id", interviewId);

      return new Response(JSON.stringify({ overall_score: avgScore, strengths, improvements, feedback_summary: summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mock-interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
