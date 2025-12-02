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
    console.log('[RecommendationEngine] Starting recommendation generation...');
    
    // Create service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to get user from auth header
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (!userError && user) {
        userId = user.id;
        console.log('[RecommendationEngine] Authenticated user:', userId);
      } else {
        console.log('[RecommendationEngine] Auth header present but getUser failed:', userError?.message);
      }
    }

    // Parse and validate input
    const requestData = await req.json();
    console.log('[RecommendationEngine] Request data:', JSON.stringify(requestData, null, 2));
    
    // Allow userId from request body as fallback
    if (!userId && requestData.userId) {
      userId = requestData.userId;
      console.log('[RecommendationEngine] Using userId from request body:', userId);
    }
    
    if (!userId) {
      throw new Error('Unauthorized: No valid user found');
    }
    
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
    
    // Validate each response structure (matches frontend format)
    for (const response of requestData.responses) {
      if (!response.category || typeof response.category !== 'string') {
        throw new Error('Each response must have a valid category');
      }
      if (typeof response.points_earned !== 'number') {
        throw new Error('Each response must have points_earned');
      }
      if (response.category.length > 100) {
        throw new Error('Category must be less than 100 characters');
      }
    }
    
    const { quizSessionId, responses } = requestData;
    console.log('[RecommendationEngine] Processing quiz session:', quizSessionId);
    console.log('[RecommendationEngine] Responses count:', responses.length);

    // Analyze quiz responses to determine category strengths using points
    const categoryScores = responses.reduce((acc: any, response: any) => {
      const category = response.category?.toLowerCase() || 'general';
      if (!acc[category]) {
        acc[category] = { points: 0, total: 0, maxPoints: 0 };
      }
      acc[category].total++;
      acc[category].points += response.points_earned || 0;
      acc[category].maxPoints += 5; // Max points per question
      return acc;
    }, {});

    // Calculate percentages based on points earned
    const profile = Object.entries(categoryScores)
      .map(([category, scores]: any) => ({
        category,
        score: Math.round((scores.points / scores.maxPoints) * 100),
        points: scores.points,
        maxPoints: scores.maxPoints,
        total: scores.total
      }))
      .sort((a, b) => b.score - a.score);

    console.log('[RecommendationEngine] Aptitude profile:', JSON.stringify(profile, null, 2));

    // Get user profile for context
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('class_level, study_area, preferred_state, preferred_district, interests')
      .eq('id', userId)
      .maybeSingle();

    console.log('[RecommendationEngine] User profile:', userProfile);

    const classLevel = userProfile?.class_level || 'UG';
    const studyArea = userProfile?.study_area || 'All';
    const userState = userProfile?.preferred_state || null;
    const userDistrict = userProfile?.preferred_district || null;
    const interests = userProfile?.interests || [];

    // Create AI prompt based on category scores with deterministic formatting
    const promptData = profile
      .map(p => `${p.category}: ${p.score}% (${p.points}/${p.maxPoints} pts)`)
      .join(', ');
    
    console.log('[RecommendationEngine] Generating recommendations for:', promptData);
    
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
            content: `You are a career counselor AI specializing in Indian education system. Based on aptitude test scores, recommend suitable courses and careers.

SCORING GUIDE:
- 80-100%: Exceptional strength
- 60-79%: Strong ability
- 40-59%: Moderate capability
- Below 40%: Area for development

CAREER MATCHING RULES FOR INDIAN STUDENTS:
- Technical + Logical high → B.Tech/B.E. in CSE, IT, ECE, Mechanical
- Quantitative + Analytical high → B.Com, CA, BBA, Economics
- Creative + Verbal high → Design (BDes), Mass Communication, Journalism
- Interpersonal + Verbal high → Management, HR, Teaching, Law
- Science stream + high technical → Engineering, Medical, Research
- Commerce stream + high quantitative → CA, CFA, MBA

Be specific to Indian education context. Return structured JSON only.`
          },
          {
            role: 'user',
            content: `Student Profile:
- Education Level: ${classLevel}
- Stream: ${studyArea}
- Location: ${userState || 'India'}${userDistrict ? ', ' + userDistrict : ''}
${interests.length > 0 ? `- Interests: ${interests.join(', ')}` : ''}

Aptitude Scores: ${promptData}

Generate exactly 5 career/course recommendations ranked by suitability. Include specific courses like B.Tech CSE, MBBS, B.Com, etc. for Indian context.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_careers",
              description: "Return exactly 5 career/course recommendations with confidence scores based on aptitude analysis",
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
                          description: "Specific course/career title (e.g., B.Tech CSE, MBBS, CA)"
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
                        },
                        branch: {
                          type: "string",
                          description: "Specific branch/specialization if applicable (e.g., Artificial Intelligence, Finance)"
                        }
                      },
                      required: ["career", "confidence", "reason"],
                      additionalProperties: false
                    }
                  },
                  guidance: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 important guidance points for the student"
                  }
                },
                required: ["recommendations", "guidance"],
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
      console.error('[RecommendationEngine] AI API Error:', aiResponse.status, errorText);
      throw new Error('Failed to generate recommendations');
    }

    const aiData = await aiResponse.json();
    console.log('[RecommendationEngine] AI Response received');

    // Extract recommendations from tool call with validation
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('[RecommendationEngine] No tool call in AI response:', JSON.stringify(aiData));
      throw new Error('No tool call in AI response');
    }

    let recommendations;
    let guidance: string[] = [];
    try {
      const args = JSON.parse(toolCall.function.arguments);
      recommendations = args.recommendations;
      guidance = args.guidance || [];
      
      // Validate recommendations structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Recommendations is not an array');
      }
      
      if (recommendations.length !== 5) {
        console.warn(`[RecommendationEngine] Expected 5 recommendations, got ${recommendations.length}`);
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
      
      console.log(`[RecommendationEngine] Validated ${recommendations.length} recommendations successfully`);
    } catch (e) {
      console.error('[RecommendationEngine] Failed to parse recommendations:', e);
      console.error('[RecommendationEngine] Tool call:', JSON.stringify(toolCall));
      throw new Error(`Invalid recommendations format: ${e instanceof Error ? e.message : 'Parse error'}`);
    }

    // Fetch relevant colleges based on user's state and recommended courses
    let collegeRecommendations: any[] = [];
    const topCourse = recommendations[0]?.career || '';
    
    // Determine course keywords for college search
    const courseKeywords = topCourse.toLowerCase();
    let courseFilter: string[] = [];
    
    if (courseKeywords.includes('b.tech') || courseKeywords.includes('engineering')) {
      courseFilter = ['B.Tech', 'B.E.', 'Engineering'];
    } else if (courseKeywords.includes('mbbs') || courseKeywords.includes('medical')) {
      courseFilter = ['MBBS', 'Medical', 'BDS'];
    } else if (courseKeywords.includes('b.com') || courseKeywords.includes('commerce')) {
      courseFilter = ['B.Com', 'Commerce', 'BBA'];
    } else if (courseKeywords.includes('b.sc') || courseKeywords.includes('science')) {
      courseFilter = ['B.Sc', 'Science'];
    } else if (courseKeywords.includes('b.a') || courseKeywords.includes('arts')) {
      courseFilter = ['B.A', 'Arts', 'Humanities'];
    }

    // Query colleges - prioritize user's state
    let collegeQuery = supabaseAdmin
      .from('colleges')
      .select('id, college_name, state, district, rating, courses_offered, fees, website, naac_grade')
      .eq('is_active', true)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(10);
    
    if (userState) {
      collegeQuery = collegeQuery.eq('state', userState);
    }
    
    const { data: colleges, error: collegeError } = await collegeQuery;
    
    if (!collegeError && colleges && colleges.length > 0) {
      collegeRecommendations = colleges.map(c => ({
        id: c.id,
        name: c.college_name || 'Unknown College',
        state: c.state || 'Unknown',
        district: c.district || null,
        rating: c.rating || 0,
        courses: c.courses_offered || [],
        fees: c.fees || null,
        website: c.website || null,
        naac_grade: c.naac_grade || null
      }));
      console.log(`[RecommendationEngine] Found ${collegeRecommendations.length} colleges in ${userState || 'India'}`);
    } else {
      // Fallback to top colleges from any state
      const { data: fallbackColleges } = await supabaseAdmin
        .from('colleges')
        .select('id, college_name, state, district, rating, courses_offered, fees, website, naac_grade')
        .eq('is_active', true)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(10);
      
      if (fallbackColleges) {
        collegeRecommendations = fallbackColleges.map(c => ({
          id: c.id,
          name: c.college_name || 'Unknown College',
          state: c.state || 'Unknown',
          district: c.district || null,
          rating: c.rating || 0,
          courses: c.courses_offered || [],
          fees: c.fees || null,
          website: c.website || null,
          naac_grade: c.naac_grade || null
        }));
        console.log(`[RecommendationEngine] Using ${collegeRecommendations.length} top colleges (fallback)`);
      }
    }

    // Get or create career entries and save recommendations
    const savedRecommendations = [];
    
    for (const rec of recommendations) {
      try {
        // Check if career exists, create if not
        let { data: existingCareer } = await supabaseAdmin
          .from('careers')
          .select('id')
          .ilike('title', rec.career)
          .maybeSingle();

        let careerId;
        if (!existingCareer) {
          const { data: newCareer, error: careerError } = await supabaseAdmin
            .from('careers')
            .insert({
              title: rec.career.trim(),
              description: rec.reason.trim(),
              category: profile[0]?.category || 'general'
            })
            .select('id')
            .maybeSingle();

          if (careerError) {
            console.error('[RecommendationEngine] Error creating career:', careerError);
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
        const { data: savedRec, error: recError } = await supabaseAdmin
          .from('career_recommendations')
          .insert({
            user_id: userId,
            quiz_session_id: quizSessionId,
            career_id: careerId,
            confidence_score: Math.round(rec.confidence)
          })
          .select(`
            *,
            careers (*)
          `)
          .maybeSingle();

        if (recError) {
          console.error('[RecommendationEngine] Error saving recommendation:', recError);
          throw recError;
        }
        
        if (savedRec) {
          // Add branch info to the saved recommendation
          savedRecommendations.push({
            ...savedRec,
            branch: rec.branch || null
          });
        }
      } catch (error) {
        console.error(`[RecommendationEngine] Error processing recommendation for ${rec.career}:`, error);
        // Continue with other recommendations even if one fails
      }
    }

    if (savedRecommendations.length === 0) {
      throw new Error('Failed to save any recommendations');
    }

    console.log(`[RecommendationEngine] Successfully saved ${savedRecommendations.length} recommendations`);

    // Calculate scores for response
    const scores: Record<string, number> = {};
    profile.forEach(p => {
      scores[p.category] = p.score;
    });

    // Update quiz session as completed
    const avgScore = profile.length > 0 
      ? Math.round(profile.reduce((sum, p) => sum + p.score, 0) / profile.length)
      : 0;
      
    const { error: updateError } = await supabaseAdmin
      .from('quiz_sessions')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString(),
        score: avgScore,
        category_scores: scores
      })
      .eq('id', quizSessionId);

    if (updateError) {
      console.error('[RecommendationEngine] Error updating quiz session:', updateError);
    }

    console.log(`[RecommendationEngine] Quiz session ${quizSessionId} completed with score ${avgScore}`);

    // Prepare final response with all data
    const response = {
      success: true,
      scores,
      recommendations: savedRecommendations,
      colleges: collegeRecommendations,
      guidance,
      profile: {
        class_level: classLevel,
        study_area: studyArea,
        state: userState,
        district: userDistrict
      }
    };

    console.log('[RecommendationEngine] Final response prepared successfully');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[RecommendationEngine] Error:', error);
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
