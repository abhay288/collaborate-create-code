-- Add location preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_state TEXT,
ADD COLUMN IF NOT EXISTS preferred_district TEXT;

-- Add index for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_state ON public.profiles(preferred_state);

COMMENT ON COLUMN public.profiles.preferred_state IS 'User preferred state for college/job recommendations';
COMMENT ON COLUMN public.profiles.preferred_district IS 'User preferred district for college/job recommendations';