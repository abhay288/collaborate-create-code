-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_colleges_state_district ON public.colleges(state, district);
CREATE INDEX IF NOT EXISTS idx_verified_scholarships_status ON public.verified_scholarships(status);
CREATE INDEX IF NOT EXISTS idx_verified_scholarships_deadline ON public.verified_scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_verified_jobs_active ON public.verified_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_gov_jobs_active ON public.gov_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_gov_admissions_active ON public.gov_admissions(is_active);
CREATE INDEX IF NOT EXISTS idx_gov_admit_cards_active ON public.gov_admit_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_completed ON public.quiz_sessions(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user ON public.career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_type ON public.user_favorites(user_id, item_type);

-- Fix mutable search path for all functions
DO $$
DECLARE
    func_name TEXT;
BEGIN
    FOR func_name IN 
        SELECT routine_name FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I SET search_path = public, extensions', func_name);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter function %: %', func_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Create extensions schema if not exists and move extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Comment for security audit
COMMENT ON SCHEMA public IS 'Standard public schema with security hardening applied';
