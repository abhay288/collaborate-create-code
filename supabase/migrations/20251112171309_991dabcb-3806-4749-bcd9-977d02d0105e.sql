-- Phase 3: Validate data model & DB integrity for colleges table

-- Step 1: Add CHECK constraints to ensure data quality
-- Ensure college_name is not empty or just whitespace
ALTER TABLE public.colleges 
ADD CONSTRAINT college_name_not_empty 
CHECK (length(trim(college_name)) > 0);

-- Ensure state is not empty when provided
ALTER TABLE public.colleges 
ADD CONSTRAINT state_not_empty 
CHECK (state IS NULL OR length(trim(state)) > 0);

-- Ensure district is not empty when provided
ALTER TABLE public.colleges 
ADD CONSTRAINT district_not_empty 
CHECK (district IS NULL OR length(trim(district)) > 0);

-- Step 2: Set better defaults for nullable fields
ALTER TABLE public.colleges 
ALTER COLUMN state SET DEFAULT 'Unknown';

ALTER TABLE public.colleges 
ALTER COLUMN location SET DEFAULT '';

-- Step 3: Add an 'is_active' column for managing invalid records
ALTER TABLE public.colleges 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Step 4: Create index for active colleges to improve query performance
CREATE INDEX IF NOT EXISTS idx_colleges_active ON public.colleges(is_active) WHERE is_active = true;

-- Step 5: Update RLS policy to only show active colleges to users
DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
CREATE POLICY "Anyone can view active colleges" 
ON public.colleges 
FOR SELECT 
USING (is_active = true);

-- Admins can still see all colleges
CREATE POLICY "Admins can view all colleges" 
ON public.colleges 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 6: Data cleanup - identify and mark bad records
-- Mark colleges with NULL or empty/whitespace-only names as inactive
UPDATE public.colleges 
SET is_active = false 
WHERE college_name IS NULL 
   OR length(trim(college_name)) = 0 
   OR college_name = '';

-- Step 7: Try to fix colleges with 'Unknown College' name
-- If they have other valid data, keep them active but flag for review
UPDATE public.colleges 
SET college_name = 'College - ' || COALESCE(district, location, state, 'Unknown Location')
WHERE college_name = 'Unknown College' 
  AND is_active = true;

-- Step 8: Create a function to validate college data on insert/update
CREATE OR REPLACE FUNCTION public.validate_college_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace from text fields
  NEW.college_name := trim(NEW.college_name);
  
  -- Validate college_name is not empty
  IF length(NEW.college_name) = 0 THEN
    RAISE EXCEPTION 'College name cannot be empty';
  END IF;
  
  -- Trim and validate other text fields
  IF NEW.state IS NOT NULL THEN
    NEW.state := trim(NEW.state);
    IF length(NEW.state) = 0 THEN
      NEW.state := 'Unknown';
    END IF;
  END IF;
  
  IF NEW.district IS NOT NULL THEN
    NEW.district := trim(NEW.district);
    IF length(NEW.district) = 0 THEN
      NEW.district := NULL;
    END IF;
  END IF;
  
  IF NEW.location IS NOT NULL THEN
    NEW.location := trim(NEW.location);
  END IF;
  
  -- Ensure courses_offered is an array
  IF NEW.courses_offered IS NULL THEN
    NEW.courses_offered := ARRAY[]::text[];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to validate data before insert/update
DROP TRIGGER IF EXISTS trigger_validate_college_data ON public.colleges;
CREATE TRIGGER trigger_validate_college_data
BEFORE INSERT OR UPDATE ON public.colleges
FOR EACH ROW
EXECUTE FUNCTION public.validate_college_data();

-- Step 10: Generate report of data quality issues (stored as comments for logging)
-- Count of inactive colleges
DO $$
DECLARE
  inactive_count INTEGER;
  null_state_count INTEGER;
  null_district_count INTEGER;
  no_courses_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inactive_count FROM public.colleges WHERE is_active = false;
  SELECT COUNT(*) INTO null_state_count FROM public.colleges WHERE state IS NULL OR state = '';
  SELECT COUNT(*) INTO null_district_count FROM public.colleges WHERE district IS NULL OR district = '';
  SELECT COUNT(*) INTO no_courses_count FROM public.colleges WHERE courses_offered IS NULL OR array_length(courses_offered, 1) IS NULL;
  
  RAISE NOTICE 'Data Quality Report:';
  RAISE NOTICE '- Inactive colleges (bad data): %', inactive_count;
  RAISE NOTICE '- Colleges with NULL/empty state: %', null_state_count;
  RAISE NOTICE '- Colleges with NULL/empty district: %', null_district_count;
  RAISE NOTICE '- Colleges with no courses: %', no_courses_count;
END $$;