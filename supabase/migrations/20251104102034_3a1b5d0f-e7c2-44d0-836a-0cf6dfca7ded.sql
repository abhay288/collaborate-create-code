-- Add missing fields to colleges table for complete Indian college information

-- Add college_type field (Government/Private/Aided/Deemed/Autonomous)
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS college_type text;

-- Add NAAC grade field
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS naac_grade text;

-- Add eligibility criteria field
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS eligibility_criteria text;

-- Add affiliation field (e.g., affiliated university)
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS affiliation text;

-- Add establishment year
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS established_year integer;

-- Create index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_rating ON colleges(rating DESC);

-- Create GIN index for course search
CREATE INDEX IF NOT EXISTS idx_colleges_courses_gin ON colleges USING GIN(courses_offered);