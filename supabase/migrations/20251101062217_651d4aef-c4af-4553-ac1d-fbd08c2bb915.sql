-- Phase 2: Update database structure for real-data models

-- 1. Update colleges table with missing fields
ALTER TABLE public.colleges 
ADD COLUMN IF NOT EXISTS contact_info text,
ADD COLUMN IF NOT EXISTS admission_link text;

-- Update colleges table comment
COMMENT ON TABLE public.colleges IS 'Stores verified college data from Careers360, Shiksha, and official websites';

-- 2. Update verified_scholarships (already has most fields, add any missing)
-- verified_scholarships already has: name, provider, eligibility_summary, amount, deadline, 
-- apply_url, youtube_tutorial fields, status, official_domain, required_documents
COMMENT ON TABLE public.verified_scholarships IS 'Stores verified scholarship data from NSP, Buddy4Study, UP Portal, and govt sources';

-- 3. Update verified_jobs (already comprehensive)
COMMENT ON TABLE public.verified_jobs IS 'Stores verified job postings from Naukri, LinkedIn, Indeed within last 7 days';

-- 4. Update careers table with additional fields
ALTER TABLE public.careers
ADD COLUMN IF NOT EXISTS skills_required text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS salary_range text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS job_type text CHECK (job_type IN ('Technical', 'Non-Technical', 'Both'));

COMMENT ON TABLE public.careers IS 'Stores general career path information and requirements';

-- 5. Add category_scores to quiz_sessions to store aptitude test results
ALTER TABLE public.quiz_sessions
ADD COLUMN IF NOT EXISTS category_scores jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.quiz_sessions.category_scores IS 'Stores aptitude scores by category: logical, verbal, quantitative, creative, technical, interpersonal';

-- 6. Create user_recommendations table to link quiz results with recommended opportunities
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_session_id uuid NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('college', 'scholarship', 'job', 'career')),
  item_id uuid NOT NULL,
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  match_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(quiz_session_id, recommendation_type, item_id)
);

COMMENT ON TABLE public.user_recommendations IS 'Links quiz sessions with recommended colleges, scholarships, jobs, and careers';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_quiz_session ON public.user_recommendations(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON public.user_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_courses ON public.colleges USING gin(courses_offered);
CREATE INDEX IF NOT EXISTS idx_verified_scholarships_status ON public.verified_scholarships(status);
CREATE INDEX IF NOT EXISTS idx_verified_scholarships_deadline ON public.verified_scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_verified_jobs_posting_date ON public.verified_jobs(posting_date);
CREATE INDEX IF NOT EXISTS idx_verified_jobs_location ON public.verified_jobs(location);

-- Enable RLS on user_recommendations
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.user_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
  ON public.user_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
  ON public.user_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all recommendations"
  ON public.user_recommendations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));