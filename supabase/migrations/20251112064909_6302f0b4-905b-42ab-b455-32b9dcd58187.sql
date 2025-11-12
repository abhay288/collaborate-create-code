-- Add latitude and longitude columns to colleges table for distance-based recommendations
-- Only add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'colleges' AND column_name = 'latitude') THEN
    ALTER TABLE colleges ADD COLUMN latitude numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'colleges' AND column_name = 'longitude') THEN
    ALTER TABLE colleges ADD COLUMN longitude numeric;
  END IF;
END $$;

-- Drop existing index if it exists and recreate
DROP INDEX IF EXISTS idx_colleges_location;
CREATE INDEX idx_colleges_location ON colleges(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
) RETURNS numeric AS $$
DECLARE
  earth_radius numeric := 6371; -- Earth's radius in kilometers
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  -- Handle NULL values
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Convert degrees to radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  -- Haversine formula
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance between two geographic points in kilometers using Haversine formula';