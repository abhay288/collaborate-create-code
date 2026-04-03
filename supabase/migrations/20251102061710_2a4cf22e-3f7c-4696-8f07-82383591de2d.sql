-- Fix search path for get_filtered_quiz_questions function
DROP FUNCTION IF EXISTS get_filtered_quiz_questions(text, text, integer);

CREATE OR REPLACE FUNCTION get_filtered_quiz_questions(
  p_class_level text,
  p_study_area text,
  p_limit integer DEFAULT 20
)
RETURNS SETOF quiz_questions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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