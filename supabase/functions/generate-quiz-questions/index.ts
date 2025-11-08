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

    // Define system prompt for question generation
    const systemPrompt = `You are an expert aptitude test creator. Generate high-quality, diverse aptitude questions tailored for ${classLevel} level students in ${studyArea} stream.

Categories to cover: logical, analytical, creative, technical, quantitative, verbal, interpersonal

For each question:
- Make it relevant to the student's level and stream
- Include 4 options with varying point values (1-5)
- Higher points = better answer quality
- Ensure questions test real aptitude, not just knowledge`;

    const userPrompt = `Generate 20 diverse aptitude test questions for a ${classLevel} student studying ${studyArea}. 

Return ONLY a JSON array with this exact structure:
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

Ensure variety across all 7 categories.`;

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

    // Parse JSON from response
    let questions;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Validate and insert questions into database
    const questionsToInsert = questions.map((q: any) => ({
      question_text: q.question_text,
      category: q.category,
      options: q.options,
      target_class_levels: q.target_class_levels || [classLevel],
      target_study_areas: q.target_study_areas || [studyArea],
      points: 1
    }));

    const { data: insertedQuestions, error: insertError } = await supabaseClient
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting questions:', insertError);
      throw insertError;
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