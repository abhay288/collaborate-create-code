import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ATS scoring weights (informative for the prompt)
const SCORING_CATEGORIES = {
  KEYWORDS: { weight: 0.40, name: "Industry Keywords" },
  STRUCTURE: { weight: 0.30, name: "Resume Structure" },
  COMPLETENESS: { weight: 0.30, name: "Section Completeness" }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    const body = await req.json();
    const { fileContent, fileName, fileType, targetRole = "General Professional" } = body;

    if (!fileContent || !fileName) {
      return new Response(
        JSON.stringify({ error: 'File content and name are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[analyze-resume] Processing resume: ${fileName} for role: ${targetRole} (User: ${userId})`);

    // Extract text from base64 content
    // In production, you would use a proper PDF/DOCX parser
    // For now, we'll use AI to analyze the content
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a Senior ATS (Applicant Tracking System) Strategist. 
Analyze the provided resume text specifically for the target role: "${targetRole}".

SCORING CRITERIA (Strict 0-100 scale):
1. **Industry Keywords (40%)**: Match technical skills, tools, and terminology specifically relevant to a "${targetRole}". Check for both exact and contextual matches.
2. **Resume Structure (30%)**: Check for ATS-killing formatting (tables, columns, headers/footers, non-standard fonts) and parseability of dates/headings.
3. **Section Completeness (30%)**: Verify existence and quality of: Contact info, Professional Summary, Work Experience, Education, and Skills.

STRICT PENALTIES:
- Missing 'Work Experience' or 'Education' section: -15 points from total score EACH.
- Missing 'Contact Info': -10 points.
- Bullet points without quantified impact (numbers/%): -10 points.
- Use of tables or multi-column layout: -15 points.

OUTPUT REQUIREMENTS:
- Provide high-quality, actionable suggestions.
- Ensure "Missing Keywords" are actually relevant to a "${targetRole}".
- Return the analysis in valid JSON format.

{
  "score": <0-100 overall weighted score>,
  "sections": [
    {
      "name": "Industry Keywords",
      "score": <0-100>,
      "status": "good|warning|critical",
      "feedback": ["Missing these specific skills for ${targetRole}: X, Y, Z", "Contextual keyword usage is strong"]
    },
    {
      "name": "Resume Structure",
      "score": <0-100>,
      "status": "good|warning|critical",
      "feedback": ["Found multi-column layout which confuses old ATS", "Date formatting is consistent"]
    },
    {
      "name": "Section Completeness",
      "score": <0-100>,
      "status": "good|warning|critical",
      "feedback": ["Missing Education section", "Professional summary is impactful"]
    }
  ],
  "suggestions": ["Add X years of experience with Y tool to match market demands for ${targetRole}.", "Quantify your achievements in your current role."],
  "keywords": {
    "found": ["k1", "k2"],
    "missing": ["specific_role_keyword1", "specific_role_keyword2"]
  },
  "formatting": {
    "issues": ["Issue 1", "Issue 2"],
    "good": ["Aspect 1"]
  }
}`;

    const userPrompt = `Analyze this resume file (${fileName}, type: ${fileType}) for ATS compatibility. Be specific and actionable in your feedback. Score realistically - most resumes are NOT perfect:

${fileContent.substring(0, 15000)}

Provide a comprehensive, honest ATS analysis.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No analysis content received');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const analysis = JSON.parse(jsonString);

    // Save analysis to database
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await serviceClient.from('user_activity').insert({
      user_id: userId,
      activity_type: 'resume_analysis',
      activity_data: {
        fileName,
        score: analysis.score,
        analyzed_at: new Date().toISOString()
      }
    });

    console.log(`[analyze-resume] Analysis complete. Score: ${analysis.score}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-resume:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Something went wrong. Please try again later.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
