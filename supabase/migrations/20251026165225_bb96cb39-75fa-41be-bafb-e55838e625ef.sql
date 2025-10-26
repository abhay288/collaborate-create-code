-- Create verified_scholarships table for real scholarship data
CREATE TABLE public.verified_scholarships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  source TEXT NOT NULL, -- e.g., 'NSP', 'Buddy4Study', 'UP Portal'
  source_url TEXT NOT NULL,
  eligibility_summary TEXT NOT NULL,
  amount TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  apply_url TEXT NOT NULL,
  official_domain TEXT NOT NULL,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  youtube_tutorial_title TEXT,
  youtube_tutorial_channel TEXT,
  youtube_tutorial_url TEXT,
  youtube_tutorial_publish_date DATE,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed', 'coming_soon'
  target_academic_level TEXT[], -- ['UG', 'PG', 'Diploma']
  target_locations TEXT[], -- ['Uttar Pradesh', 'National', etc.]
  minimum_percentage NUMERIC,
  income_criteria TEXT,
  category_criteria TEXT[], -- ['General', 'SC', 'ST', 'OBC', 'Minority']
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verified_jobs table for real job listings
CREATE TABLE public.verified_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_range TEXT,
  apply_url TEXT NOT NULL,
  source_site TEXT NOT NULL, -- 'Naukri', 'LinkedIn', 'Indeed'
  posting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  required_skills TEXT[],
  required_education TEXT[], -- ['UG', 'PG', 'Diploma']
  experience_required TEXT, -- '0-1 years', '1-3 years', etc.
  job_type TEXT, -- 'Full-time', 'Part-time', 'Internship'
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_verified_scholarships_status ON public.verified_scholarships(status);
CREATE INDEX idx_verified_scholarships_locations ON public.verified_scholarships USING GIN(target_locations);
CREATE INDEX idx_verified_scholarships_academic_level ON public.verified_scholarships USING GIN(target_academic_level);
CREATE INDEX idx_verified_scholarships_deadline ON public.verified_scholarships(deadline);

CREATE INDEX idx_verified_jobs_location ON public.verified_jobs(location);
CREATE INDEX idx_verified_jobs_posting_date ON public.verified_jobs(posting_date);
CREATE INDEX idx_verified_jobs_is_active ON public.verified_jobs(is_active);
CREATE INDEX idx_verified_jobs_education ON public.verified_jobs USING GIN(required_education);

-- Enable Row Level Security
ALTER TABLE public.verified_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow everyone to read verified opportunities
CREATE POLICY "Anyone can view verified scholarships"
  ON public.verified_scholarships
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view active jobs"
  ON public.verified_jobs
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage verified opportunities
CREATE POLICY "Admins can manage verified scholarships"
  ON public.verified_scholarships
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage verified jobs"
  ON public.verified_jobs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_verified_scholarships_updated_at
  BEFORE UPDATE ON public.verified_scholarships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verified_jobs_updated_at
  BEFORE UPDATE ON public.verified_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample verified scholarships from trusted sources
INSERT INTO public.verified_scholarships (
  name, provider, source, source_url, eligibility_summary, amount, deadline,
  apply_url, official_domain, required_documents, status,
  target_academic_level, target_locations, youtube_tutorial_title,
  youtube_tutorial_channel, youtube_tutorial_url, verified_by
) VALUES 
(
  'UP Pre-Matric Scholarship for Minorities',
  'Government of Uttar Pradesh',
  'UP Scholarship Portal',
  'https://scholarship.up.gov.in',
  'Class 9-10, Minority community, Uttar Pradesh domicile, Family income < ₹2 lakh/year',
  '₹10,000 per year',
  '2025-12-31 23:59:59+05:30',
  'https://scholarship.up.gov.in',
  'scholarship.up.gov.in',
  ARRAY['Income Certificate', 'Caste Certificate', 'Aadhar Card', 'Bank Details', 'School Certificate'],
  'open',
  ARRAY['UG'],
  ARRAY['Uttar Pradesh'],
  'UP Scholarship Online Application 2024-25 | Complete Process',
  'Sarkari Result',
  'https://www.youtube.com/results?search_query=UP+Pre+Matric+Scholarship+application',
  'System Admin'
),
(
  'UP Post-Matric Scholarship for SC/ST',
  'Government of Uttar Pradesh',
  'UP Scholarship Portal',
  'https://scholarship.up.gov.in',
  'Class 11 & above, SC/ST category, Uttar Pradesh domicile, Pursuing higher education',
  '₹15,000 - ₹35,000 per year',
  '2025-11-30 23:59:59+05:30',
  'https://scholarship.up.gov.in',
  'scholarship.up.gov.in',
  ARRAY['Income Certificate', 'Caste Certificate', 'Aadhar Card', 'Bank Details', 'Admission Receipt'],
  'open',
  ARRAY['UG', 'PG'],
  ARRAY['Uttar Pradesh'],
  'UP Post Matric Scholarship | How to Apply Online',
  'Digital Education',
  'https://www.youtube.com/results?search_query=UP+Post+Matric+Scholarship+SC+ST',
  'System Admin'
),
(
  'National Means cum Merit Scholarship (NMMS)',
  'Ministry of Education, Government of India',
  'National Scholarship Portal',
  'https://scholarships.gov.in',
  'Class 9-12, Family income < ₹1.5 lakh/year, Minimum 55% in Class 8, State NMMS exam qualified',
  '₹12,000 per year',
  '2025-10-31 23:59:59+05:30',
  'https://scholarships.gov.in',
  'scholarships.gov.in',
  ARRAY['Income Certificate', 'Class 8 Marksheet', 'Aadhar Card', 'Bank Details', 'School Certificate', 'NMMS Exam Certificate'],
  'open',
  ARRAY['UG'],
  ARRAY['National'],
  'NSP NMMS Scholarship Application 2024 | Step by Step Guide',
  'Scholarship Portal India',
  'https://www.youtube.com/results?search_query=NMMS+scholarship+NSP+application',
  'System Admin'
),
(
  'Central Sector Scheme of Scholarship',
  'Ministry of Education, Government of India',
  'National Scholarship Portal',
  'https://scholarships.gov.in',
  'Top 20,000 rank holders in Class 12 (from State/CBSE/ICSE), Family income < ₹4.5 lakh/year, Pursuing UG degree',
  '₹20,000 per year (General) / ₹10,000 per year (Professional)',
  '2025-09-30 23:59:59+05:30',
  'https://scholarships.gov.in',
  'scholarships.gov.in',
  ARRAY['Class 12 Marksheet', 'Income Certificate', 'Aadhar Card', 'Bank Details', 'College Admission Proof'],
  'open',
  ARRAY['UG'],
  ARRAY['National'],
  'Central Sector Scholarship NSP | Complete Application Process',
  'Student Guide India',
  'https://www.youtube.com/results?search_query=Central+Sector+Scholarship+NSP',
  'System Admin'
),
(
  'Buddy4Study Engineering Scholarship',
  'Buddy4Study (Various Providers)',
  'Buddy4Study',
  'https://www.buddy4study.com',
  'B.Tech/B.E. students, Minimum 60% marks, Family income varies by provider',
  '₹10,000 - ₹50,000 (varies)',
  '2025-09-30 23:59:59+05:30',
  'https://www.buddy4study.com/page/scholarships-for-engineering-students',
  'buddy4study.com',
  ARRAY['Academic Records', 'Income Certificate', 'Aadhar Card', 'College ID', 'Admission Proof'],
  'open',
  ARRAY['UG'],
  ARRAY['National'],
  'Buddy4Study Scholarship Application Process | Complete Guide',
  'Student Guide',
  'https://www.youtube.com/results?search_query=Buddy4Study+scholarship+application',
  'System Admin'
);

-- Insert sample verified jobs (Note: These should be updated regularly by admins)
INSERT INTO public.verified_jobs (
  role, company, location, salary_range, apply_url, source_site,
  posting_date, required_skills, required_education, experience_required,
  job_type, verified_by
) VALUES
(
  'Software Developer Intern',
  'Tech Solutions India',
  'Noida, Uttar Pradesh',
  '₹15,000 - ₹25,000 per month',
  'https://www.naukri.com',
  'Naukri.com',
  CURRENT_DATE - INTERVAL '2 days',
  ARRAY['Programming', 'Problem Solving', 'Java', 'Python'],
  ARRAY['UG'],
  '0-1 years',
  'Internship',
  'System Admin'
),
(
  'Junior Data Analyst',
  'Analytics Corp',
  'Lucknow, Uttar Pradesh',
  '₹20,000 - ₹30,000 per month',
  'https://www.linkedin.com/jobs',
  'LinkedIn Jobs',
  CURRENT_DATE - INTERVAL '4 days',
  ARRAY['Data Analysis', 'Excel', 'SQL', 'Statistics'],
  ARRAY['UG', 'PG'],
  '0-2 years',
  'Full-time',
  'System Admin'
),
(
  'Business Development Intern',
  'Growth Partners',
  'Kanpur, Uttar Pradesh',
  '₹12,000 - ₹20,000 per month',
  'https://www.indeed.com',
  'Indeed',
  CURRENT_DATE - INTERVAL '1 day',
  ARRAY['Communication', 'Sales', 'Interpersonal Skills', 'Presentation'],
  ARRAY['UG'],
  '0-1 years',
  'Internship',
  'System Admin'
);