import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for structured responses
const ERROR_CODES = {
  MISSING_PROFILE_FIELD: 'ERR_MISSING_PROFILE_FIELD',
  INVALID_PROFILE_DATA: 'ERR_INVALID_PROFILE_DATA',
  AI_GENERATION_FAILED: 'ERR_AI_GENERATION_FAILED',
  NO_QUESTIONS_AVAILABLE: 'ERR_NO_QUESTIONS_AVAILABLE',
  DATABASE_ERROR: 'ERR_DATABASE_ERROR',
};

// Profile validation schema
interface UserProfile {
  userId: string;
  class_level: string;
  study_area: string;
  interests?: string[];
  location?: { state?: string; district?: string };
  past_scores?: { category: string; score: number }[];
}

// Map common study area variations to valid values
function mapStudyArea(studyArea: string): string {
  const mapping: Record<string, string> = {
    'other': 'All',
    'general': 'All',
    'undecided': 'All',
    'science': 'Science',
    'commerce': 'Commerce',
    'arts': 'Arts',
    'humanities': 'Arts',
    'business': 'Commerce'
  };
  
  const lowerArea = studyArea?.toLowerCase() || '';
  return mapping[lowerArea] || studyArea;
}

// Valid quiz_category enum values from database
const VALID_CATEGORIES = [
  'logical_reasoning',
  'analytical_skills', 
  'creativity',
  'technical_interests',
  'quantitative',
  'verbal',
  'interpersonal'
] as const;

// Map AI-generated category names to valid DB enum values
function mapCategoryToEnum(category: string): string {
  const categoryMapping: Record<string, string> = {
    // Direct matches
    'logical_reasoning': 'logical_reasoning',
    'analytical_skills': 'analytical_skills',
    'creativity': 'creativity',
    'technical_interests': 'technical_interests',
    'quantitative': 'quantitative',
    'verbal': 'verbal',
    'interpersonal': 'interpersonal',
    // Common AI variations
    'logical': 'logical_reasoning',
    'logic': 'logical_reasoning',
    'reasoning': 'logical_reasoning',
    'analytical': 'analytical_skills',
    'analysis': 'analytical_skills',
    'critical_thinking': 'analytical_skills',
    'creative': 'creativity',
    'innovation': 'creativity',
    'technical': 'technical_interests',
    'technology': 'technical_interests',
    'computational': 'technical_interests',
    'math': 'quantitative',
    'mathematical': 'quantitative',
    'numerical': 'quantitative',
    'language': 'verbal',
    'communication': 'verbal',
    'linguistic': 'verbal',
    'social': 'interpersonal',
    'emotional': 'interpersonal',
    'teamwork': 'interpersonal',
    'collaboration': 'interpersonal',
    // Fallbacks
    'general': 'logical_reasoning',
    'other': 'logical_reasoning',
  };
  
  const normalizedCategory = category?.toLowerCase()?.trim() || '';
  const mapped = categoryMapping[normalizedCategory];
  
  if (mapped) {
    return mapped;
  }
  
  // Try partial matching as last resort
  if (normalizedCategory.includes('logic') || normalizedCategory.includes('reason')) {
    return 'logical_reasoning';
  }
  if (normalizedCategory.includes('analy') || normalizedCategory.includes('critical')) {
    return 'analytical_skills';
  }
  if (normalizedCategory.includes('creat') || normalizedCategory.includes('innov')) {
    return 'creativity';
  }
  if (normalizedCategory.includes('tech') || normalizedCategory.includes('comput')) {
    return 'technical_interests';
  }
  if (normalizedCategory.includes('quant') || normalizedCategory.includes('math') || normalizedCategory.includes('numer')) {
    return 'quantitative';
  }
  if (normalizedCategory.includes('verbal') || normalizedCategory.includes('lang') || normalizedCategory.includes('commun')) {
    return 'verbal';
  }
  if (normalizedCategory.includes('inter') || normalizedCategory.includes('social') || normalizedCategory.includes('team')) {
    return 'interpersonal';
  }
  
  // Default fallback
  console.warn(`Unknown category "${category}", defaulting to logical_reasoning`);
  return 'logical_reasoning';
}

// Deterministic seeding for debugging
function seedRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seed?: number): T[] {
  if (!seed) {
    // Random shuffle if no seed
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Deterministic shuffle with seed
  const shuffled = [...array];
  const random = seedRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Validate profile fields
function validateProfile(profile: any): { valid: boolean; error?: { code: string; message: string; field?: string } } {
  if (!profile) {
    return { valid: false, error: { code: ERROR_CODES.MISSING_PROFILE_FIELD, message: 'Profile data is required', field: 'profile' } };
  }

  if (!profile.userId || typeof profile.userId !== 'string') {
    return { valid: false, error: { code: ERROR_CODES.MISSING_PROFILE_FIELD, message: 'User ID is required', field: 'userId' } };
  }

  if (!profile.class_level || typeof profile.class_level !== 'string') {
    return { valid: false, error: { code: ERROR_CODES.MISSING_PROFILE_FIELD, message: 'Class level is required', field: 'class_level' } };
  }

  if (!profile.study_area || typeof profile.study_area !== 'string') {
    return { valid: false, error: { code: ERROR_CODES.MISSING_PROFILE_FIELD, message: 'Study area is required', field: 'study_area' } };
  }

  const validClassLevels = ['10th', '12th', 'UG', 'PG', 'Diploma'];
  if (!validClassLevels.includes(profile.class_level)) {
    return { valid: false, error: { code: ERROR_CODES.INVALID_PROFILE_DATA, message: `Invalid class level. Must be one of: ${validClassLevels.join(', ')}`, field: 'class_level' } };
  }

  // Map study area to valid value before validation
  profile.study_area = mapStudyArea(profile.study_area);
  
  const validStudyAreas = ['Science', 'Commerce', 'Arts', 'All'];
  if (!validStudyAreas.includes(profile.study_area)) {
    return { valid: false, error: { code: ERROR_CODES.INVALID_PROFILE_DATA, message: `Invalid study area '${profile.study_area}'. Supported: ${validStudyAreas.join(', ')}. Tip: Use 'All' for undecided/other streams.`, field: 'study_area' } };
  }

  return { valid: true };
}

// Get questions from verified question bank as fallback
async function getQuestionBankFallback(supabaseClient: any, profile: UserProfile, limit: number = 20): Promise<any[]> {
  console.log('Attempting to fetch from question bank fallback...');
  
  const { data, error } = await supabaseClient
    .rpc('get_filtered_quiz_questions', {
      p_class_level: profile.class_level,
      p_study_area: profile.study_area,
      p_limit: limit
    });

  if (error) {
    console.error('Question bank fallback error:', error);
    throw new Error('Question bank unavailable');
  }

  if (!data || data.length === 0) {
    console.error('No questions in fallback bank');
    throw new Error('No questions available in question bank');
  }

  console.log(`Retrieved ${data.length} questions from fallback bank`);
  return data;
}

serve(async (req) => {
  const logger = createLogger('generate-quiz-questions', req);
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    logger.logRequest('POST', '/generate-quiz-questions', body);
    
    const profile: UserProfile = body.profile || { 
      userId: body.userId, 
      class_level: body.classLevel, 
      study_area: body.studyArea,
      interests: body.interests,
      location: body.location,
      past_scores: body.past_scores
    };
    const seed = body.seed; // Optional deterministic seed for debugging
    
    logger.info('Processing quiz generation request', { 
      userId: profile.userId,
      class_level: profile.class_level,
      study_area: profile.study_area,
      has_seed: !!seed
    });
    
    // Validate profile
    const validation = validateProfile(profile);
    if (!validation.valid) {
      logger.error('Profile validation failed', validation.error, { profile });
      return new Response(
        JSON.stringify({ 
          error: validation.error!.message,
          code: validation.error!.code,
          field: validation.error!.field
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    console.log('Validated profile:', { userId: profile.userId, class_level: profile.class_level, study_area: profile.study_area });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role to bypass RLS for insertions
    );

    // Build enhanced profile context
    const interestsContext = profile.interests && profile.interests.length > 0 
      ? `Student interests: ${profile.interests.join(', ')}` 
      : '';
    
    const locationContext = profile.location?.state 
      ? `Location: ${profile.location.state}${profile.location.district ? ', ' + profile.location.district : ''}` 
      : '';
    
    const pastScoresContext = profile.past_scores && profile.past_scores.length > 0
      ? `Past performance: ${profile.past_scores.map(s => `${s.category}: ${s.score}%`).join(', ')}`
      : '';

    // Define system prompt for question generation with full profile awareness
    const systemPrompt = `You are an expert aptitude test creator. Generate high-quality, diverse aptitude questions tailored specifically for this student profile:
- Education Level: ${profile.class_level}
- Study Area: ${profile.study_area}
${interestsContext}
${locationContext}
${pastScoresContext}

CRITICAL REQUIREMENTS:
1. Age-appropriate for ${profile.class_level} students
2. Relevant to ${profile.study_area} academic background
3. Balanced across all 7 categories
4. Progressive difficulty (easy → medium → hard)
${profile.interests ? `5. Incorporate student interests where relevant: ${profile.interests.join(', ')}` : ''}

Categories (MUST use these exact category names):
- logical_reasoning: Pattern recognition, deductive reasoning
- analytical_skills: Problem decomposition, critical thinking
- creativity: Innovation, out-of-box thinking
- technical_interests: Technology aptitude, computational thinking
- quantitative: Mathematical reasoning, numerical ability
- verbal: Language comprehension, communication
- interpersonal: Emotional intelligence, teamwork scenarios

Question Guidelines:
- Scenario-based and practical
- Exactly 4 options with differentiated point values (1-5)
- Higher points = more optimal/insightful answer
- Test real aptitude, not memorized knowledge
- No cultural or regional bias`;

    const userPrompt = `Generate exactly 20 diverse aptitude test questions for this student profile:
- Level: ${profile.class_level}
- Stream: ${profile.study_area}
${interestsContext}
${pastScoresContext}

REQUIREMENTS:
- Distribute questions across all 7 categories (2-3 per category)
- Vary difficulty levels within each category
- Make questions relevant to ${profile.study_area} context where applicable
- Use real-world scenarios students can relate to
${profile.interests ? `- Incorporate interests where natural: ${profile.interests.join(', ')}` : ''}

Return ONLY a JSON array with this exact structure (no markdown, no extra text):
[
  {
    "question_text": "Question here",
    "category": "logical_reasoning|analytical_skills|creativity|technical_interests|quantitative|verbal|interpersonal",
    "options": [
      {"text": "Option 1", "points": 1},
      {"text": "Option 2", "points": 3},
      {"text": "Option 3", "points": 5},
      {"text": "Option 4", "points": 2}
    ],
    "target_class_levels": ["${profile.class_level}"],
    "target_study_areas": ["${profile.study_area}"]
  }
]

VALIDATION:
- Exactly 20 questions
- All 7 categories represented
- Each question has exactly 4 options
- Points range from 1-5
- No duplicate questions`;

    console.log(`Generating questions for profile: ${profile.class_level} - ${profile.study_area}${seed ? ` (seed: ${seed})` : ''}`);

    let questions;
    
    // Try AI generation first
    try {
      console.log('Calling Lovable AI to generate questions...');

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
          temperature: seed ? 0.3 : 0.8, // Lower temperature for deterministic results
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (aiResponse.status === 402) {
          throw new Error('AI credits exhausted');
        }
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        throw new Error('AI generation failed');
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content generated');
      }

      // Parse JSON from response with validation
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      questions = JSON.parse(jsonString);
      
      // Validate response structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      if (questions.length !== 20) {
        console.warn(`Expected 20 questions, got ${questions.length}`);
      }
      
      // Validate each question structure
      questions.forEach((q, index) => {
        if (!q.question_text || !q.category || !q.options) {
          throw new Error(`Question ${index + 1} missing required fields`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        // Validate points in options
        q.options.forEach((opt: any, optIdx: number) => {
          if (!opt.text || typeof opt.points !== 'number' || opt.points < 1 || opt.points > 5) {
            throw new Error(`Question ${index + 1}, Option ${optIdx + 1} has invalid points`);
          }
        });
      });
      
      logger.info(`AI generated ${questions.length} questions successfully`);
      
    } catch (aiError) {
      logger.error('AI generation failed', aiError, { profile });
      logger.info('Falling back to verified question bank...');
      
      // FALLBACK: Use verified question bank
      try {
        questions = await getQuestionBankFallback(supabaseClient, profile);
        logger.info('Successfully retrieved questions from fallback bank', { count: questions.length });
      } catch (fallbackError) {
        logger.error('Fallback also failed', fallbackError);
        
        const duration = Date.now() - startTime;
        logger.logResponse(500, { error: 'No questions available' }, duration);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate or retrieve questions',
            code: ERROR_CODES.NO_QUESTIONS_AVAILABLE,
            details: {
              ai_error: aiError instanceof Error ? aiError.message : 'AI generation failed',
              fallback_error: fallbackError instanceof Error ? fallbackError.message : 'Question bank unavailable'
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    }

    // Shuffle questions if seed provided (deterministic) or randomly
    const shuffledQuestions = shuffleWithSeed(questions, seed);
    
    // If questions came from fallback, they already exist in DB, just return them
    const questionsAlreadyInDb = shuffledQuestions[0]?.id !== undefined;
    
    if (questionsAlreadyInDb) {
      console.log(`Returning ${shuffledQuestions.length} questions from database (fallback)`);
      return new Response(
        JSON.stringify({ 
          success: true,
          questions: shuffledQuestions,
          count: shuffledQuestions.length,
          source: 'fallback_bank',
          deterministic: seed !== undefined
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Validate and insert AI-generated questions into database
    if (!Array.isArray(shuffledQuestions) || shuffledQuestions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid questions to insert',
          code: ERROR_CODES.NO_QUESTIONS_AVAILABLE
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const questionsToInsert = shuffledQuestions.map((q: any, index: number) => {
      try {
        // Map AI category to valid DB enum value
        const mappedCategory = mapCategoryToEnum(q.category);
        console.log(`Question ${index + 1}: "${q.category}" -> "${mappedCategory}"`);
        
        return {
          question_text: q.question_text?.trim() || `Question ${index + 1}`,
          category: mappedCategory,
          options: q.options || [],
          target_class_levels: Array.isArray(q.target_class_levels) ? q.target_class_levels : [profile.class_level],
          target_study_areas: Array.isArray(q.target_study_areas) ? q.target_study_areas : [profile.study_area],
          points: 1
        };
      } catch (error) {
        console.error(`Error formatting question ${index + 1}:`, error);
        return null;
      }
    }).filter(q => q !== null);

    if (questionsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid questions after formatting',
          code: ERROR_CODES.INVALID_PROFILE_DATA
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log(`Inserting ${questionsToInsert.length} AI-generated questions into database...`);

    const { data: insertedQuestions, error: insertError } = await supabaseClient
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Database insertion failed',
          code: ERROR_CODES.DATABASE_ERROR,
          details: insertError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (!insertedQuestions || insertedQuestions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No questions were inserted',
          code: ERROR_CODES.DATABASE_ERROR
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const duration = Date.now() - startTime;
    logger.info(`Successfully generated and inserted ${insertedQuestions.length} questions`);
    logger.logQuizGeneration(profile, { success: true, count: insertedQuestions.length });
    logger.logResponse(200, { success: true, count: insertedQuestions.length }, duration);

    return new Response(
      JSON.stringify({ 
        success: true,
        questions: insertedQuestions,
        count: insertedQuestions.length,
        source: 'ai_generated',
        deterministic: seed !== undefined,
        profile: {
          class_level: profile.class_level,
          study_area: profile.study_area,
          has_interests: !!profile.interests?.length,
          has_location: !!profile.location?.state,
          has_past_scores: !!profile.past_scores?.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Unexpected error in generate-quiz-questions', error);
    logger.logResponse(500, { error: 'Internal server error' }, duration);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: ERROR_CODES.AI_GENERATION_FAILED
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});