-- Fix search_path security warning for calculate_distance function
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
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance between two geographic points in kilometers using Haversine formula';