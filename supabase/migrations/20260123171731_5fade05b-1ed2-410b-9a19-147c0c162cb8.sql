-- RPC helpers for scalable college filter dropdowns (avoid PostgREST row limits)

CREATE OR REPLACE FUNCTION public.get_distinct_college_states()
RETURNS TABLE(state text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT c.state
  FROM public.colleges c
  WHERE c.is_active = true
    AND c.state IS NOT NULL
    AND btrim(c.state) <> ''
  ORDER BY c.state ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_distinct_college_districts(p_state text)
RETURNS TABLE(district text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT c.district
  FROM public.colleges c
  WHERE c.is_active = true
    AND c.district IS NOT NULL
    AND btrim(c.district) <> ''
    AND lower(btrim(c.state)) = lower(btrim(p_state))
  ORDER BY c.district ASC;
$$;

COMMENT ON FUNCTION public.get_distinct_college_states() IS 'Returns distinct active college states for dropdowns without client-side dedupe/row-limit issues.';
COMMENT ON FUNCTION public.get_distinct_college_districts(text) IS 'Returns distinct active college districts for a given state (case-insensitive), for dependent dropdowns.';
