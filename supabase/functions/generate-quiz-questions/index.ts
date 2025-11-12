import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classLevel, studyArea } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Define system prompt for question generation with profile awareness
    const systemPrompt = `You are an expert aptitude test creator. Generate high-quality, diverse aptitude questions tailored specifically for ${classLevel} level students in ${studyArea} stream.

CRITICAL: Questions must be:
1. Age-appropriate for ${classLevel} students
2. Relevant to ${studyArea} academic background
3. Balanced across all 7 categories
4. Progressive in difficulty (mix of easy, medium, hard)

Categories to cover (aim for 2-3 questions per category):
- logical: Pattern recognition, deductive reasoning
- analytical: Problem decomposition, critical thinking
- creative: Innovation, out-of-box thinking
- technical: Technology aptitude, computational thinking
- quantitative: Mathematical reasoning, numerical ability
- verbal: Language comprehension, communication
- interpersonal: Emotional intelligence, teamwork scenarios

For each question:
- Make it scenario-based and practical
- Include exactly 4 options with differentiated point values (1-5)
- Higher points = more optimal/insightful answer
- Ensure questions test real aptitude, not memorized knowledge
- Avoid cultural or regional bias`;

    const userPrompt = `Generate exactly 20 diverse aptitude test questions for a ${classLevel} student studying ${studyArea}. 

REQUIREMENTS:
- Distribute questions across all 7 categories (2-3 per category)
- Vary difficulty levels within each category
- Make questions relevant to ${studyArea} context where applicable
- Use real-world scenarios students can relate to

Return ONLY a JSON array with this exact structure (no markdown, no extra text):
[
  {
    "question_text": "Question here",
    "category": "logical|analytical|creative|technical|quantitative|verbal|interpersonal",
    "options": [
      {"text": "Option 1", "points": 1},
      {"text": "Option 2", "points": 3},
      {"text": "Option 3", "points": 5},
      {"text": "Option 4", "points": 2}
    ],
    "target_class_levels": ["${classLevel}"],
    "target_study_areas": ["${studyArea}"]
  }
]

VALIDATION:
- Exactly 20 questions
- All 7 categories represented
- Each question has exactly 4 options
- Points range from 1-5
- No duplicate questions`;

    console.log(`Generating questions for: ${classLevel} - ${studyArea}`);

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
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add funds.');
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate questions');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON from response with validation
    let questions;
    try {
      // Remove markdown code blocks if present
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
      
      console.log(`Validated ${questions.length} questions successfully`);
    } catch (e) {
      console.error('Failed to parse/validate AI response:', e);
      console.error('AI Content:', content);
      throw new Error(`Invalid AI response format: ${e instanceof Error ? e.message : 'Parse error'}`);
    }

    // Validate and insert questions into database
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions to insert');
    }

    const questionsToInsert = questions.map((q: any, index: number) => {
      try {
        return {
          question_text: q.question_text?.trim() || `Question ${index + 1}`,
          category: q.category?.toLowerCase() || 'general',
          options: q.options || [],
          target_class_levels: Array.isArray(q.target_class_levels) ? q.target_class_levels : [classLevel],
          target_study_areas: Array.isArray(q.target_study_areas) ? q.target_study_areas : [studyArea],
          points: 1
        };
      } catch (error) {
        console.error(`Error formatting question ${index + 1}:`, error);
        return null;
      }
    }).filter(q => q !== null); // Remove any null entries

    if (questionsToInsert.length === 0) {
      throw new Error('No valid questions after formatting');
    }

    console.log(`Inserting ${questionsToInsert.length} questions into database...`);

    const { data: insertedQuestions, error: insertError } = await supabaseClient
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting questions:', insertError);
      throw new Error(`Database insertion failed: ${insertError.message}`);
    }

    if (!insertedQuestions || insertedQuestions.length === 0) {
      throw new Error('No questions were inserted');
    }

    console.log(`Successfully generated and inserted ${insertedQuestions.length} questions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        questions: insertedQuestions,
        count: insertedQuestions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-quiz-questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});