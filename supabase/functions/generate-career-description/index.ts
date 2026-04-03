import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { CAREER_TOOL_SYSTEM_PROMPT } from "../_shared/career-logic.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const validateInput = (data: any) => {
  if (!data.careerTitle || typeof data.careerTitle !== 'string') {
    throw new Error('careerTitle is required and must be a string');
  }
  if (data.careerTitle.length < 1 || data.careerTitle.length > 200) {
    throw new Error('careerTitle must be between 1 and 200 characters');
  }
  if (!data.category || typeof data.category !== 'string') {
    throw new Error('category is required and must be a string');
  }
  if (data.category.length < 1 || data.category.length > 100) {
    throw new Error('category must be between 1 and 100 characters');
  }
  
  // Sanitize inputs
  const sanitized = {
    careerTitle: data.careerTitle.trim().replace(/[^\w\s-]/g, ''),
    category: data.category.trim().replace(/[^\w\s-]/g, '')
  };
  
  return sanitized;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user profile for language preference
    const { data: profile } = await supabaseClient.from("profiles").select("preferred_language").eq("id", user.id).single();
    const language = profile?.preferred_language || 'en';

    // Parse and validate input
    const requestData = await req.json();
    const { careerTitle, category } = validateInput(requestData);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI to generate detailed career description
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `${CAREER_TOOL_SYSTEM_PROMPT(language)}

You are a career counselor. Provide comprehensive career information following the structured sections strictly:
🎯 Career Suggestions (Overview)
📌 Reasoning (Key Responsibilities)
🛠️ Required Skills
🪜 Step-by-Step Roadmap (Education requirements & progression)
🎓 Recommended Colleges (India-focused)
💰 Scholarships (Relevant to this career in India)

**STRICT LANGUAGE COMPLIANCE**: Your response MUST be entirely in ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
Tone: Friendly, supportive, and informative.`
          },
          {
            role: 'user',
            content: `Generate detailed information for the career: ${careerTitle}. Category: ${category}`
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      throw new Error('Failed to generate description');
    }

    const aiData = await aiResponse.json();
    const description = aiData.choices?.[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        description 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in generate-career-description:', error instanceof Error ? error.message : error);
    
    // Sanitize error for client
    let clientMessage = 'Failed to generate career description. Please try again.';
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'No authorization header') {
        clientMessage = 'Please log in to access this feature.';
      } else if (error.message.includes('Rate limit')) {
        clientMessage = 'Service is busy. Please try again later.';
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: clientMessage,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && (error.message === 'Unauthorized' || error.message.includes('authorization')) ? 401 : 500 
      }
    );
  }
});
