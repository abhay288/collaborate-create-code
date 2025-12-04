-- Add is_onboarding_complete flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarding_complete boolean DEFAULT false;

-- Update existing profiles that have completed onboarding
UPDATE public.profiles 
SET is_onboarding_complete = true 
WHERE (class_level IS NOT NULL AND study_area IS NOT NULL) 
   OR (current_study_level IS NOT NULL AND current_course IS NOT NULL);