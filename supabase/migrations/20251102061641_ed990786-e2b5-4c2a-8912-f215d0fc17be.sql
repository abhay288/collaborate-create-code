-- Add class level and study area to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS class_level text,
ADD COLUMN IF NOT EXISTS study_area text;

-- Add target filters and points to quiz questions
ALTER TABLE public.quiz_questions
ADD COLUMN IF NOT EXISTS target_class_levels text[] DEFAULT ARRAY['10th', '12th', 'UG', 'PG'],
ADD COLUMN IF NOT EXISTS target_study_areas text[] DEFAULT ARRAY['Science', 'Commerce', 'Arts', 'All'],
ADD COLUMN IF NOT EXISTS points integer DEFAULT 1;

-- Update quiz_responses to store points earned
ALTER TABLE public.quiz_responses
ADD COLUMN IF NOT EXISTS points_earned integer DEFAULT 0;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_quiz_questions_targets ON public.quiz_questions(target_class_levels, target_study_areas);

-- Create function to get filtered quiz questions
CREATE OR REPLACE FUNCTION get_filtered_quiz_questions(
  p_class_level text,
  p_study_area text,
  p_limit integer DEFAULT 20
)
RETURNS SETOF quiz_questions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM quiz_questions
  WHERE (
    p_class_level = ANY(target_class_levels) OR 
    'All' = ANY(target_class_levels)
  )
  AND (
    p_study_area = ANY(target_study_areas) OR 
    'All' = ANY(target_study_areas)
  )
  ORDER BY random()
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION get_filtered_quiz_questions IS 'Fetches quiz questions filtered by class level and study area';