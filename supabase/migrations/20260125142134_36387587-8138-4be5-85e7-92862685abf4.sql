-- Add unique constraints for upsert operations on gov tables
ALTER TABLE public.gov_jobs 
ADD CONSTRAINT gov_jobs_unique_key UNIQUE (title, department, last_date);

ALTER TABLE public.gov_admissions 
ADD CONSTRAINT gov_admissions_unique_key UNIQUE (title, authority, last_date);

ALTER TABLE public.gov_admit_cards 
ADD CONSTRAINT gov_admit_cards_unique_key UNIQUE (title, department, exam_date);

-- Also add service role insert policies for edge functions
CREATE POLICY "Service role can insert gov_jobs" 
ON public.gov_jobs FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role can update gov_jobs" 
ON public.gov_jobs FOR UPDATE 
TO service_role 
USING (true);

CREATE POLICY "Service role can insert gov_admissions" 
ON public.gov_admissions FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role can update gov_admissions" 
ON public.gov_admissions FOR UPDATE 
TO service_role 
USING (true);

CREATE POLICY "Service role can insert gov_admit_cards" 
ON public.gov_admit_cards FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role can update gov_admit_cards" 
ON public.gov_admit_cards FOR UPDATE 
TO service_role 
USING (true);

-- Insert sample verified scholarships data
INSERT INTO public.verified_scholarships (
  name, provider, source, source_url, official_domain, apply_url, amount, 
  eligibility_summary, required_documents, status, target_academic_level, 
  target_locations, category_criteria, deadline
) VALUES 
(
  'Post Matric Scholarship for SC Students',
  'Ministry of Social Justice and Empowerment',
  'scholarships.gov.in',
  'https://scholarships.gov.in/',
  'scholarships.gov.in',
  'https://scholarships.gov.in/fresh/newstdRegf498.do',
  'Up to ₹15,000 per annum',
  'For SC students studying in Class 11 onwards. Family income should not exceed ₹2.5 lakh per annum.',
  ARRAY['Caste Certificate', 'Income Certificate', 'Marksheet', 'Bank Account Details', 'Aadhaar Card'],
  'open',
  ARRAY['Class 11', 'Class 12', 'UG', 'PG'],
  ARRAY['All India'],
  ARRAY['SC'],
  NOW() + INTERVAL '60 days'
),
(
  'PM-YASASVI Scholarship Scheme',
  'Ministry of Social Justice and Empowerment',
  'scholarships.gov.in',
  'https://yet.nta.ac.in/',
  'yet.nta.ac.in',
  'https://yet.nta.ac.in/',
  '₹75,000 to ₹1,25,000 per annum',
  'For OBC, EBC, DNT students in Class 9-12. Parental income should not exceed ₹2.5 lakh.',
  ARRAY['Category Certificate', 'Income Certificate', 'School ID', 'Aadhaar Card', 'Bank Passbook'],
  'open',
  ARRAY['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  ARRAY['All India'],
  ARRAY['OBC', 'EBC', 'DNT'],
  NOW() + INTERVAL '45 days'
),
(
  'AICTE Pragati Scholarship for Girls',
  'All India Council for Technical Education',
  'aicte-india.org',
  'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
  'aicte-india.org',
  'https://www.aicte-india.org/schemes/pragati',
  '₹50,000 per annum',
  'For girl students admitted to AICTE approved technical institutions. Family income below ₹8 lakh.',
  ARRAY['10th Marksheet', '12th Marksheet', 'Income Certificate', 'College Admission Letter', 'Aadhaar Card'],
  'open',
  ARRAY['UG'],
  ARRAY['All India'],
  ARRAY['General', 'OBC', 'SC', 'ST'],
  NOW() + INTERVAL '90 days'
),
(
  'Central Sector Scheme of Scholarship',
  'Ministry of Education',
  'scholarships.gov.in',
  'https://scholarships.gov.in/',
  'scholarships.gov.in',
  'https://scholarships.gov.in/fresh/newstdRegfrmInst498.do',
  '₹12,000 per annum for UG, ₹20,000 for PG',
  'For students scoring above 80th percentile in Class 12 board exams. Family income below ₹4.5 lakh.',
  ARRAY['12th Marksheet', 'Income Certificate', 'College Admission Proof', 'Bank Account', 'Aadhaar Card'],
  'open',
  ARRAY['UG', 'PG'],
  ARRAY['All India'],
  ARRAY['General', 'OBC', 'SC', 'ST'],
  NOW() + INTERVAL '30 days'
),
(
  'National Means Cum Merit Scholarship',
  'Ministry of Education',
  'scholarships.gov.in',
  'https://scholarships.gov.in/',
  'scholarships.gov.in',
  'https://scholarships.gov.in/nmms',
  '₹12,000 per annum',
  'For Class 9 students scoring 55% in Class 8. Family income below ₹3.5 lakh.',
  ARRAY['Class 8 Marksheet', 'Income Certificate', 'School Bonafide', 'Aadhaar Card'],
  'open',
  ARRAY['Class 9', 'Class 10', 'Class 11', 'Class 12'],
  ARRAY['All India'],
  ARRAY['General', 'OBC', 'SC', 'ST'],
  NOW() + INTERVAL '75 days'
),
(
  'Pre Matric Scholarship for Minorities',
  'Ministry of Minority Affairs',
  'scholarships.gov.in',
  'https://scholarships.gov.in/',
  'scholarships.gov.in',
  'https://scholarships.gov.in/fresh/newstdRegfrmMn4956.do',
  'Up to ₹5,700 per annum',
  'For minority students from Class 1-10. Family income should not exceed ₹1 lakh per annum.',
  ARRAY['Minority Certificate', 'Income Certificate', 'School ID', 'Aadhaar Card'],
  'open',
  ARRAY['Class 1-5', 'Class 6-8', 'Class 9', 'Class 10'],
  ARRAY['All India'],
  ARRAY['Minority'],
  NOW() + INTERVAL '50 days'
),
(
  'Vidyasaarathi Scholarship',
  'NSDL e-Governance',
  'vidyasaarathi.co.in',
  'https://www.vidyasaarathi.co.in/',
  'vidyasaarathi.co.in',
  'https://www.vidyasaarathi.co.in/scholarship',
  '₹25,000 to ₹100,000',
  'For students pursuing professional courses. Multiple corporate sponsors available.',
  ARRAY['Marksheets', 'Income Proof', 'Admission Letter', 'ID Proof'],
  'open',
  ARRAY['UG', 'PG'],
  ARRAY['All India'],
  ARRAY['General', 'OBC', 'SC', 'ST'],
  NOW() + INTERVAL '40 days'
),
(
  'L&T Build India Scholarship',
  'Larsen & Toubro',
  'lntpublicct.com',
  'https://www.lntpublicct.com/',
  'lntpublicct.com',
  'https://www.lntpublicct.com/scholarship',
  'Full tuition fees + living allowance',
  'For engineering students in top 50 NIRF ranked colleges. Based on JEE Advanced rank.',
  ARRAY['JEE Rank Card', '12th Marksheet', 'Admission Letter', 'Income Certificate'],
  'open',
  ARRAY['UG'],
  ARRAY['All India'],
  ARRAY['General', 'OBC', 'SC', 'ST'],
  NOW() + INTERVAL '55 days'
)
ON CONFLICT DO NOTHING;