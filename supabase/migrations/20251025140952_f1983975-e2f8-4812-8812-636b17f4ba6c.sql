-- Add district column to colleges table for Uttar Pradesh organization
ALTER TABLE public.colleges 
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS state text DEFAULT 'Uttar Pradesh';

-- Create index for better query performance on district
CREATE INDEX IF NOT EXISTS idx_colleges_district ON public.colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);

-- Add verified flag to scholarships for trusted sources
ALTER TABLE public.scholarships 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Create index for verified scholarships
CREATE INDEX IF NOT EXISTS idx_scholarships_verified ON public.scholarships(verified);