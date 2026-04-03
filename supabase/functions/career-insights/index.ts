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

    const body = await req.json();
    const action = body.action || body.type; // Unified action/type parsing
    console.log(`[CareerInsights] Action: ${action}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    // ========== GUARDRAILS: Block inappropriate/unprofessional inputs ==========
    const BLOCKED_CAREERS = ['thief', 'chor', 'beggar', 'bhikhari', 'hitman', 'smuggler', 'drug dealer', 'scammer', 'fraudster', 'pickpocket', 'prostitute', 'terrorist', 'gangster', 'mafia', 'serial killer', 'dacoit', 'extortionist', 'blackmailer', 'pirate', 'kidnapper'];
    
    const FUNNY_RESPONSES: Record<string, string> = {
      thief: "🚨 Sorry, AVSAR doesn't offer a B.Tech in Burglary! But hey, Ethical Hacking pays ₹15-50 LPA and you actually get PAID to break into systems. Much better benefits package — no jail time included! Try 'Cybersecurity Expert' instead. 🔐",
      chor: "🚨 माफ़ करो भाई, 'प्रोफेशनल चोर' का कोई कोर्स नहीं है! लेकिन Ethical Hacking में ₹15-50 LPA मिलते हैं और लोग तुम्हें हैक करने के लिए पैसे देते हैं। जेल की हवा vs AC ऑफिस — choice is yours! 🔐",
      beggar: "🙏 We respect hustle, but AVSAR recommends careers with... you know, a salary! How about Social Work or NGO Management? Same helping-people energy, but with a steady income, health insurance, and dignity! Try 'Social Worker' instead. 💼",
      bhikhari: "🙏 भाई, भीख मांगने का रोडमैप? हमारे पास वो नहीं है! लेकिन Social Work में सरकारी नौकरी मिलती है — PM-YUVA scheme से ट्रेनिंग भी फ्री! 'सामाजिक कार्यकर्ता' ट्राई करो! 💼",
      hitman: "🎯 John Wick is fictional, and his retirement plan is terrible! How about becoming a Defense Strategist or joining the Indian Armed Forces? Same intensity, actual pension, and your mom can actually tell people what you do! Try 'Defense Officer'. 🎖️",
      smuggler: "📦 Smuggling has a 100% chance of free government housing (jail)! Try Supply Chain Management instead — same logistics skills, ₹8-25 LPA salary, and you get to go HOME after work! 🏠",
      'drug dealer': "💊 Breaking Bad was a TV show, not a career guide! Pharmacy pays ₹5-15 LPA, is completely legal, and you still get to count pills. Try 'Pharmacist' — Walter White approved! 🧪",
      scammer: "📞 'Hello, I am calling from Microsoft' is NOT a career! Try Cybersecurity Analyst instead — companies pay ₹10-40 LPA to CATCH scammers. Be the hero, not the villain! 🦸",
      gangster: "🔫 Gangs of Wasseypur was entertainment, not a LinkedIn tutorial! How about Criminal Psychology or Forensic Science? Same fascination with crime, but you're on the RIGHT side! Try 'Forensic Scientist'. 🔬",
      terrorist: "⛔ This is not something we can help with. Please use AVSAR for legitimate career guidance. If you're going through a tough time, reach out to iCall: 9152987821. We're here to help you build a positive future. 🕊️",
    };
    
    const checkBlockedInput = (input: string): string | null => {
      const lower = input.toLowerCase().trim();
      for (const blocked of BLOCKED_CAREERS) {
        if (lower === blocked || lower.includes(blocked)) {
          return FUNNY_RESPONSES[blocked] || `😅 "${input}" is not exactly what career counselors recommend! How about we explore some careers that won't land you in the news (for the wrong reasons)? Try something like Engineering, Medicine, Law, or Business! 🚀`;
        }
      }
      return null;
    };

    const callAI = async (messages: any[], tools?: any[], toolChoice?: any, temperature = 0.7, maxTokens = 1200) => {
      const payload: any = { 
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: CAREER_TOOL_SYSTEM_PROMPT(body.language || 'en') },
          ...messages
        ], 
        temperature, 
        max_tokens: maxTokens 
      };
      
      if (tools) { payload.tools = tools; payload.tool_choice = toolChoice; }
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[CareerInsights] AI gateway error ${response.status}:`, errorBody);
        if (response.status === 429) throw new Error("Rate limit exceeded");
        if (response.status === 402) throw new Error("Payment required");
        throw new Error(`AI gateway ${response.status}: ${errorBody}`);
      }
      return response.json();
    };

    // ========== CAREER RISK ==========
    if (action === "career_risk") {
      const { careers } = body;
      // Check for blocked inputs
      for (const c of (careers || [])) {
        const funnyResponse = checkBlockedInput(c);
        if (funnyResponse) {
          return new Response(JSON.stringify({ error: funnyResponse, isGuidance: true }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      const data = await callAI(
        [{ role: "user", content: `Analyze automation and future risk for these careers: ${(careers || []).join(', ')}. For each: automation_risk_percent (0-100), industry_growth_percent (-10 to 30), future_demand_index (1-10), risk_level (low/medium/high), brief reasoning. Indian job market.` }],
        [{ type: "function", function: { name: "return_risk_analysis", parameters: { type: "object", properties: { careers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, automation_risk_percent: { type: "number" }, industry_growth_percent: { type: "number" }, future_demand_index: { type: "number" }, risk_level: { type: "string" }, reasoning: { type: "string" } }, required: ["name","automation_risk_percent","industry_growth_percent","future_demand_index","risk_level","reasoning"] } } }, required: ["careers"] } } }],
        { type: "function", function: { name: "return_risk_analysis" } }
      );
      const result = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== COMPARE CAREERS ==========
    if (action === "compare_careers") {
      const { career1, career2 } = body;
      // Check for blocked inputs
      for (const c of [career1, career2]) {
        const funnyResponse = checkBlockedInput(c);
        if (funnyResponse) {
          return new Response(JSON.stringify({ error: funnyResponse, isGuidance: true }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      const data = await callAI(
        [{ role: "user", content: `Compare "${career1}" vs "${career2}" for Indian student. For each: avg_salary_range (INR LPA), study_cost_estimate (INR), growth_rating (1-10), competition_level, time_to_establish (years), key_skills (5), top_exams, pros (3), cons (3), verdict.` }],
        [{ type: "function", function: { name: "return_comparison", parameters: { type: "object", properties: { career1: { type: "object", properties: { name:{type:"string"}, avg_salary_range:{type:"string"}, study_cost_estimate:{type:"string"}, growth_rating:{type:"number"}, competition_level:{type:"string"}, time_to_establish:{type:"number"}, key_skills:{type:"array",items:{type:"string"}}, top_exams:{type:"array",items:{type:"string"}}, pros:{type:"array",items:{type:"string"}}, cons:{type:"array",items:{type:"string"}} } }, career2: { type: "object", properties: { name:{type:"string"}, avg_salary_range:{type:"string"}, study_cost_estimate:{type:"string"}, growth_rating:{type:"number"}, competition_level:{type:"string"}, time_to_establish:{type:"number"}, key_skills:{type:"array",items:{type:"string"}}, top_exams:{type:"array",items:{type:"string"}}, pros:{type:"array",items:{type:"string"}}, cons:{type:"array",items:{type:"string"}} } }, verdict: { type: "string" } }, required: ["career1","career2","verdict"] } } }],
        { type: "function", function: { name: "return_comparison" } }
      );
      const result = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "career_twin") {
      const prompt = `Analyze this Indian student's profile and generate their Career Twin — a concise, structured career persona.

Student Profile:
- Education: ${profile?.current_study_level || "Unknown"} | ${profile?.current_course || "Unknown"}
- Interests: ${(profile?.interests || []).join(", ") || "Not specified"}
- Target: ${profile?.primary_target || "Not specified"}
- Scores: Overall ${profile?.overall_score || "N/A"}%, Logical ${profile?.logical_score || "N/A"}%, Verbal ${profile?.verbal_score || "N/A"}%, Creative ${profile?.creative_score || "N/A"}%, Technical ${profile?.technical_score || "N/A"}%

STRICT OUTPUT FORMAT (use this exact structure, keep each point to 1-2 lines max):

🎭 **Career Archetype**: [Creative title, e.g., "The Strategic Architect"]
> [One-line description of their persona]

---

🏆 **Top 3 Career Matches** (sorted by match %):
| Rank | Career | Match | Avg Salary (LPA) |
|------|--------|-------|-------------------|
| 1 | [Career] | [X]% | ₹X-X |
| 2 | [Career] | [X]% | ₹X-X |
| 3 | [Career] | [X]% | ₹X-X |

---

💪 **Key Strengths** (top 3):
- [Strength 1]: [one-line why]
- [Strength 2]: [one-line why]
- [Strength 3]: [one-line why]

---

🌟 **Famous Career Twin**: [Real person name] — [one-line why they match]

---

📋 **90-Day Action Plan**:
1. **Month 1**: [specific action]
2. **Month 2**: [specific action]
3. **Month 3**: [specific action]

---

⚡ **Market Reality**: [2-3 lines on demand, competition, and salary outlook in India]

RULES: Be concise. No filler. No motivational quotes. Indian context only. Use rupees (₹) for salaries.`;
      
      const data = await callAI([{ role: "user", content: prompt }], undefined, undefined, 0.7, 800);
      const result = data.choices?.[0]?.message?.content || "Could not generate Career Twin.";
      return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== PROFILE STRENGTH ==========
    if (action === "profile_strength") {
      const { data: quizSession } = await supabase.from("quiz_sessions").select("score, category_scores").eq("user_id", user.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).single();
      const { count: interviewCount } = await supabase.from("mock_interviews").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");
      const { count: favoriteCount } = await supabase.from("user_favorites").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      const profileFields = ['full_name','primary_target','current_study_level','current_course','target_course_interest','target_admission_year','preferred_state','interests'];
      const completedFields = profileFields.filter(f => { const v = profile?.[f]; return Array.isArray(v) ? v.length > 0 : !!v; }).length;
      const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
      const hasQuiz = !!quizSession; const hasInterviews = (interviewCount||0) > 0; const hasFavorites = (favoriteCount||0) > 0;
      const completenessScore = profileCompletion;
      const engagementScore = Math.min(100, (hasQuiz?30:0)+(hasInterviews?30:0)+(hasFavorites?20:0)+((interviewCount||0)>2?20:(interviewCount||0)*7));
      const aptitudeScore = quizSession?.score || 0;
      const overallScore = Math.round(completenessScore*0.3+engagementScore*0.3+aptitudeScore*0.4);
      const suggestions: string[] = [];
      if (profileCompletion < 80) suggestions.push("Complete your profile for better recommendations");
      if (!hasQuiz) suggestions.push("Take the aptitude quiz to unlock career insights");
      if (!hasInterviews) suggestions.push("Try a mock interview to build confidence");
      if (!hasFavorites) suggestions.push("Save colleges & scholarships to track opportunities");
      if (aptitudeScore < 60 && hasQuiz) suggestions.push("Retake the quiz after studying to improve your score");
      return new Response(JSON.stringify({ overall_score: overallScore, completeness_score: completenessScore, engagement_score: engagementScore, aptitude_score: aptitudeScore, quizzes_taken: hasQuiz?1:0, interviews_done: interviewCount||0, favorites_saved: favoriteCount||0, suggestions, level: overallScore>=80?"Expert":overallScore>=60?"Advanced":overallScore>=40?"Intermediate":"Beginner", xp_points: (hasQuiz?100:0)+((interviewCount||0)*50)+((favoriteCount||0)*10)+(profileCompletion>80?50:0) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== VOICE CONFIDENCE (legacy profile-based) ==========
    if (action === "voice_confidence") {
      const { role } = body;
      const { data: quizSession } = await supabase.from("quiz_sessions").select("score, category_scores").eq("user_id", user.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).single();
      const { count: interviewCount } = await supabase.from("mock_interviews").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");
      const prompt = `Expert interview coach for Indian job market. Analyze candidate for "${role||"General"}". Profile: Education: ${profile?.current_study_level||"Unknown"}, ${profile?.current_course||"Unknown"}, Interests: ${(profile?.interests||[]).join(", ")||"Not specified"}, Aptitude Score: ${quizSession?.score||"Not taken"}, Mock Interviews: ${interviewCount||0}, Verbal: ${profile?.verbal_score||"N/A"}, Logical: ${profile?.logical_score||"N/A"}. Provide confidence analysis in markdown.`;
      const data = await callAI([{ role: "user", content: prompt }]);
      return new Response(JSON.stringify({ analysis: data.choices?.[0]?.message?.content || "Analysis unavailable." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== VOICE ANALYSIS (with transcript) ==========
    if (action === "voice_analysis") {
      const { role, transcript, wpm, duration, wordCount, fillerCount } = body;
      const prompt = `You are an AI Interview Confidence Evaluator. Analyze:
Transcript: "${transcript}"
Speech Metadata: Duration ${duration}s, Words ${wordCount}, WPM ${wpm}, Filler words detected: ${fillerCount}, Role: ${role}
Evaluate: confidence_score (0-100), fluency_score (0-100), clarity_score (0-100), speaking_speed (Slow/Ideal/Fast, ideal 130-160 WPM), filler_word_density (Low/Medium/High), energy_level (Low/Moderate/High), 3 strengths, 5 improvements, readiness_level (Beginner/Developing/Job Ready/Professional).`;

      const data = await callAI(
        [{ role: "user", content: prompt }],
        [{ type: "function", function: { name: "return_voice_analysis", parameters: { type: "object", properties: {
          confidence_score: { type: "number" }, fluency_score: { type: "number" }, clarity_score: { type: "number" },
          speaking_speed: { type: "string" }, filler_word_density: { type: "string" }, energy_level: { type: "string" },
          wpm: { type: "number" }, strengths: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } }, readiness_level: { type: "string" }
        }, required: ["confidence_score","fluency_score","clarity_score","speaking_speed","filler_word_density","energy_level","wpm","strengths","improvements","readiness_level"] } } }],
        { type: "function", function: { name: "return_voice_analysis" } }
      );
      const result = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ========== TYPING ANALYSIS ==========
    if (action === "typing_analysis") {
      const { text } = body;
      const targetRole = profile?.primary_target || "general professional";
      const prompt = `AI Communication Skills Evaluator. Analyze this writing sample:
"${text}"
User's target career: ${targetRole}
Evaluate: writing_clarity (0-100), professional_tone (0-100), grammar_accuracy (0-100), structure_quality (0-100), vocabulary_strength (Basic/Moderate/Strong), 3 strengths, 5 improvements, rewritten_version (improved text), readiness_score (0-100 placement readiness), career_impact (1 sentence about communication skill impact for their target career: ${targetRole}).`;

      const data = await callAI(
        [{ role: "user", content: prompt }],
        [{ type: "function", function: { name: "return_typing_analysis", parameters: { type: "object", properties: {
          writing_clarity: { type: "number" }, professional_tone: { type: "number" }, grammar_accuracy: { type: "number" },
          structure_quality: { type: "number" }, vocabulary_strength: { type: "string" },
          strengths: { type: "array", items: { type: "string" } }, improvements: { type: "array", items: { type: "string" } },
          rewritten_version: { type: "string" }, readiness_score: { type: "number" }, career_impact: { type: "string" }
        }, required: ["writing_clarity","professional_tone","grammar_accuracy","structure_quality","vocabulary_strength","strengths","improvements","rewritten_version","readiness_score","career_impact"] } } }],
        { type: "function", function: { name: "return_typing_analysis" } }
      );
      const result = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("career-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
