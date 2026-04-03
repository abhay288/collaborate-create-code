-- Add new profile columns for enhanced onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS primary_target text,
ADD COLUMN IF NOT EXISTS current_study_level text,
ADD COLUMN IF NOT EXISTS current_course text,
ADD COLUMN IF NOT EXISTS target_course_interest text[],
ADD COLUMN IF NOT EXISTS target_admission_year integer,
ADD COLUMN IF NOT EXISTS preferences text[],
ADD COLUMN IF NOT EXISTS logical_score numeric,
ADD COLUMN IF NOT EXISTS numerical_score numeric,
ADD COLUMN IF NOT EXISTS technical_score numeric,
ADD COLUMN IF NOT EXISTS creative_score numeric,
ADD COLUMN IF NOT EXISTS verbal_score numeric,
ADD COLUMN IF NOT EXISTS overall_score numeric;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.primary_target IS 'User primary target: School Education, Government Colleges, Private Colleges';
COMMENT ON COLUMN public.profiles.current_study_level IS 'Current education level like Class 10th, UG 1st year, etc.';
COMMENT ON COLUMN public.profiles.current_course IS 'Current course or stream the user is studying';
COMMENT ON COLUMN public.profiles.target_course_interest IS 'Array of course interests for college admission';
COMMENT ON COLUMN public.profiles.target_admission_year IS 'Target year for college admission';
COMMENT ON COLUMN public.profiles.preferences IS 'Array of preferences like admission counselling, online degree, etc.';