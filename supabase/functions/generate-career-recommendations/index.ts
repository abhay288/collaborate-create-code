import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quizSessionId, responses } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Analyze quiz responses to determine category strengths
    const categoryScores = responses.reduce((acc: any, response: any) => {
      if (!acc[response.category]) {
        acc[response.category] = { correct: 0, total: 0 };
      }
      acc[response.category].total++;
      if (response.isCorrect) {
        acc[response.category].correct++;
      }
      return acc;
    }, {});

    // Calculate percentages and create profile
    const profile = Object.entries(categoryScores).map(([category, scores]: any) => ({
      category,
      score: (scores.correct / scores.total) * 100
    }));

    // Create AI prompt based on category scores
    const promptData = profile.map(p => `${p.category}: ${p.score.toFixed(1)}%`).join(', ');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI to generate career recommendations
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
            content: 'You are a career counselor AI. Based on quiz scores in different categories, recommend 5 suitable careers with confidence scores. Return ONLY valid JSON matching this exact format: {"recommendations": [{"career": "Career Title", "confidence": 85, "reason": "Brief explanation"}]}. Do not include any markdown formatting or extra text.'
          },
          {
            role: 'user',
            content: `User scored: ${promptData}. Suggest 5 careers with confidence scores (0-100).`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_careers",
              description: "Return 5 career recommendations with confidence scores",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        career: { type: "string" },
                        confidence: { type: "number" },
                        reason: { type: "string" }
                      },
                      required: ["career", "confidence", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_careers" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error('Failed to generate recommendations');
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData));

    // Extract recommendations from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const recommendations = JSON.parse(toolCall.function.arguments).recommendations;

    // Get or create career entries and save recommendations
    const savedRecommendations = [];
    
    for (const rec of recommendations) {
      // Check if career exists, create if not
      let { data: existingCareer } = await supabaseClient
        .from('careers')
        .select('id')
        .ilike('title', rec.career)
        .single();

      let careerId;
      if (!existingCareer) {
        const { data: newCareer, error: careerError } = await supabaseClient
          .from('careers')
          .insert({
            title: rec.career,
            description: rec.reason,
            category: profile.reduce((max, p) => p.score > max.score ? p : max).category
          })
          .select('id')
          .single();

        if (careerError) throw careerError;
        careerId = newCareer.id;
      } else {
        careerId = existingCareer.id;
      }

      // Save recommendation
      const { data: savedRec, error: recError } = await supabaseClient
        .from('career_recommendations')
        .insert({
          user_id: user.id,
          quiz_session_id: quizSessionId,
          career_id: careerId,
          confidence_score: rec.confidence
        })
        .select(`
          *,
          careers (*)
        `)
        .single();

      if (recError) throw recError;
      savedRecommendations.push(savedRec);
    }

    // Update quiz session as completed
    await supabaseClient
      .from('quiz_sessions')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString(),
        score: Math.round(profile.reduce((sum, p) => sum + p.score, 0) / profile.length)
      })
      .eq('id', quizSessionId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: savedRecommendations,
        profile 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-career-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
