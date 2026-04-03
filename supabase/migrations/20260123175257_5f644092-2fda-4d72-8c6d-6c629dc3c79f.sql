-- ============================================
-- SECURITY HARDENING MIGRATION
-- ============================================

-- 1. Fix NGO Contact Information Exposure
-- Drop the open public policy and restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view active NGOs" ON public.ngos;

CREATE POLICY "Authenticated users can view active NGOs"
ON public.ngos
FOR SELECT
TO authenticated
USING (is_active = true);

-- Create a public view that excludes sensitive contact info
CREATE OR REPLACE VIEW public.ngos_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  mission_summary,
  primary_focus,
  states_present,
  website,
  apply_or_donate_link,
  region,
  verified,
  is_active,
  created_at,
  updated_at
  -- Excludes: email, phone, hq_address, notes
FROM public.ngos
WHERE is_active = true;

-- 2. Update storage bucket with file limits
UPDATE storage.buckets 
SET 
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE name = 'profile-pictures';

-- 3. Add user activity deletion policy
DROP POLICY IF EXISTS "Users can delete their own activity" ON public.user_activity;
CREATE POLICY "Users can delete their own activity"
ON public.user_activity
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create government opportunities tables
-- Jobs from SarkariResult
CREATE TABLE IF NOT EXISTS public.gov_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  category TEXT,
  notification_date TEXT,
  last_date TEXT,
  total_posts TEXT,
  qualification TEXT,
  age_limit TEXT,
  application_fee TEXT,
  eligibility TEXT,
  selection_process TEXT,
  apply_link TEXT,
  notification_link TEXT,
  detail_page_url TEXT,
  youtube_guide TEXT,
  source TEXT DEFAULT 'sarkariresult',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT gov_jobs_unique UNIQUE(title, department, last_date)
);

-- Admissions from SarkariResult  
CREATE TABLE IF NOT EXISTS public.gov_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authority TEXT,
  category TEXT,
  notification_date TEXT,
  last_date TEXT,
  eligibility TEXT,
  application_fee TEXT,
  age_limit TEXT,
  selection_process TEXT,
  apply_link TEXT,
  notification_link TEXT,
  detail_page_url TEXT,
  youtube_guide TEXT,
  source TEXT DEFAULT 'sarkariresult',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT gov_admissions_unique UNIQUE(title, authority, last_date)
);

-- Admit Cards from SarkariResult
CREATE TABLE IF NOT EXISTS public.gov_admit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  exam_date TEXT,
  admit_card_date TEXT,
  download_link TEXT,
  detail_page_url TEXT,
  status TEXT DEFAULT 'available',
  source TEXT DEFAULT 'sarkariresult',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT gov_admit_cards_unique UNIQUE(title, department, exam_date)
);

-- User bookmarks for government opportunities
CREATE TABLE IF NOT EXISTS public.user_gov_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('job', 'admission', 'admit_card')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_gov_bookmarks_unique UNIQUE(user_id, item_id, item_type)
);

-- User reminders for deadlines
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_type TEXT DEFAULT 'deadline',
  sent_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.gov_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gov_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for government opportunity tables (public read, admin write)
CREATE POLICY "Anyone can view active gov jobs"
ON public.gov_jobs FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view active gov admissions"
ON public.gov_admissions FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view active admit cards"
ON public.gov_admit_cards FOR SELECT
USING (is_active = true);

-- Policies for user bookmarks
CREATE POLICY "Users can manage their own gov bookmarks"
ON public.user_gov_bookmarks FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for user reminders
CREATE POLICY "Users can manage their own reminders"
ON public.user_reminders FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gov_jobs_active ON public.gov_jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gov_admissions_active ON public.gov_admissions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gov_admit_cards_active ON public.gov_admit_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_gov_bookmarks_user ON public.user_gov_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_date ON public.user_reminders(user_id, reminder_date);

-- 5. Create pending careers table for AI suggestions (security fix)
CREATE TABLE IF NOT EXISTS public.pending_careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  suggested_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pending_careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert pending careers"
ON public.pending_careers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Admins can manage pending careers"
ON public.pending_careers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_gov_jobs_updated_at
BEFORE UPDATE ON public.gov_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_gov_admissions_updated_at
BEFORE UPDATE ON public.gov_admissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();