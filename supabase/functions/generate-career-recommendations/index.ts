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

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse and validate input
    const requestData = await req.json();
    
    // Validate quizSessionId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!requestData.quizSessionId || !uuidRegex.test(requestData.quizSessionId)) {
      throw new Error('Invalid quizSessionId format');
    }
    
    // Validate responses array
    if (!Array.isArray(requestData.responses)) {
      throw new Error('responses must be an array');
    }
    if (requestData.responses.length === 0 || requestData.responses.length > 100) {
      throw new Error('responses must contain between 1 and 100 items');
    }
    
    // Validate each response structure
    for (const response of requestData.responses) {
      if (!response.category || typeof response.category !== 'string') {
        throw new Error('Each response must have a valid category');
      }
      if (typeof response.isCorrect !== 'boolean') {
        throw new Error('Each response must have an isCorrect boolean');
      }
      if (response.category.length > 100) {
        throw new Error('Category must be less than 100 characters');
      }
    }
    
    const { quizSessionId, responses } = requestData;

    // Analyze quiz responses to determine category strengths
    const categoryScores = responses.reduce((acc: any, response: any) => {
      const category = response.category?.toLowerCase() || 'general';
      if (!acc[category]) {
        acc[category] = { correct: 0, total: 0 };
      }
      acc[category].total++;
      if (response.isCorrect) {
        acc[category].correct++;
      }
      return acc;
    }, {});

    // Calculate percentages and create deterministic profile
    const profile = Object.entries(categoryScores)
      .map(([category, scores]: any) => ({
        category,
        score: Math.round((scores.correct / scores.total) * 100), // Round for consistency
        correct: scores.correct,
        total: scores.total
      }))
      .sort((a, b) => b.score - a.score); // Sort by score for consistency

    // Log for reproducibility verification
    console.log('Profile generated:', JSON.stringify(profile, null, 2));

    // Get user profile for context
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('class_level, study_area')
      .eq('id', user.id)
      .maybeSingle();

    const classLevel = userProfile?.class_level || 'UG';
    const studyArea = userProfile?.study_area || 'All';

    // Create AI prompt based on category scores with deterministic formatting
    const promptData = profile
      .map(p => `${p.category}: ${p.score}% (${p.correct}/${p.total})`)
      .join(', ');
    
    console.log('Generating recommendations for:', promptData);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI to generate career recommendations with structured output
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
            content: `You are a career counselor AI. Based on aptitude test scores, recommend exactly 5 suitable careers.

SCORING GUIDE:
- 80-100%: Exceptional strength
- 60-79%: Strong ability
- 40-59%: Moderate capability
- Below 40%: Area for development

CAREER MATCHING RULES:
- Technical + Logical high → Engineering, Software, IT
- Quantitative + Analytical high → Finance, Data Science, Research
- Creative + Verbal high → Design, Writing, Marketing
- Interpersonal + Verbal high → Management, HR, Teaching
- Match careers to demonstrated strengths, not wishful thinking

Confidence scores should reflect:
- 80-100: Perfect match (top 2 skills align strongly)
- 60-79: Good match (1-2 relevant strengths)
- 40-59: Possible match (some alignment)

Be honest and data-driven. Return structured JSON only.`
          },
          {
            role: 'user',
            content: `Student Profile - ${classLevel} Level, ${studyArea} Stream
Aptitude Scores: ${promptData}

Generate exactly 5 career recommendations ranked by suitability. Consider the complete profile, not just the top score.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_careers",
              description: "Return exactly 5 career recommendations with confidence scores based on aptitude analysis",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        career: { 
                          type: "string",
                          description: "Specific career title"
                        },
                        confidence: { 
                          type: "number",
                          minimum: 0,
                          maximum: 100,
                          description: "Match confidence 0-100"
                        },
                        reason: { 
                          type: "string",
                          description: "Brief explanation referencing specific aptitude scores"
                        }
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
    console.log('AI Response received');

    // Extract recommendations from tool call with validation
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in AI response:', JSON.stringify(aiData));
      throw new Error('No tool call in AI response');
    }

    let recommendations;
    try {
      const args = JSON.parse(toolCall.function.arguments);
      recommendations = args.recommendations;
      
      // Validate recommendations structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Recommendations is not an array');
      }
      
      if (recommendations.length !== 5) {
        console.warn(`Expected 5 recommendations, got ${recommendations.length}`);
      }
      
      // Validate each recommendation
      recommendations.forEach((rec, idx) => {
        if (!rec.career || typeof rec.confidence !== 'number' || !rec.reason) {
          throw new Error(`Recommendation ${idx + 1} missing required fields`);
        }
        if (rec.confidence < 0 || rec.confidence > 100) {
          throw new Error(`Recommendation ${idx + 1} has invalid confidence score: ${rec.confidence}`);
        }
      });
      
      console.log(`Validated ${recommendations.length} recommendations successfully`);
    } catch (e) {
      console.error('Failed to parse recommendations:', e);
      console.error('Tool call:', JSON.stringify(toolCall));
      throw new Error(`Invalid recommendations format: ${e instanceof Error ? e.message : 'Parse error'}`);
    }

    // Get or create career entries and save recommendations
    const savedRecommendations = [];
    
    for (const rec of recommendations) {
      try {
        // Check if career exists, create if not
        let { data: existingCareer } = await supabaseClient
          .from('careers')
          .select('id')
          .ilike('title', rec.career)
          .maybeSingle(); // Use maybeSingle to avoid errors on no match

        let careerId;
        if (!existingCareer) {
          const { data: newCareer, error: careerError } = await supabaseClient
            .from('careers')
            .insert({
              title: rec.career.trim(),
              description: rec.reason.trim(),
              category: profile[0]?.category || 'general'
            })
            .select('id')
            .maybeSingle();

          if (careerError) {
            console.error('Error creating career:', careerError);
            throw careerError;
          }
          
          if (!newCareer) {
            throw new Error(`Failed to create career: ${rec.career}`);
          }
          
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
            confidence_score: Math.round(rec.confidence) // Ensure integer
          })
          .select(`
            *,
            careers (*)
          `)
          .maybeSingle();

        if (recError) {
          console.error('Error saving recommendation:', recError);
          throw recError;
        }
        
        if (savedRec) {
          savedRecommendations.push(savedRec);
        }
      } catch (error) {
        console.error(`Error processing recommendation for ${rec.career}:`, error);
        // Continue with other recommendations even if one fails
      }
    }

    if (savedRecommendations.length === 0) {
      throw new Error('Failed to save any recommendations');
    }

    console.log(`Successfully saved ${savedRecommendations.length} recommendations`);

    // Update quiz session as completed
    const avgScore = profile.length > 0 
      ? Math.round(profile.reduce((sum, p) => sum + p.score, 0) / profile.length)
      : 0;
      
    const { error: updateError } = await supabaseClient
      .from('quiz_sessions')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString(),
        score: avgScore
      })
      .eq('id', quizSessionId);

    if (updateError) {
      console.error('Error updating quiz session:', updateError);
      // Don't throw - recommendations are already saved
    }

    console.log(`Quiz session ${quizSessionId} completed with score ${avgScore}`);

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
