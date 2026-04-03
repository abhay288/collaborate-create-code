-- 1. Add DELETE policy for quiz_responses (users can delete their quiz answers)
CREATE POLICY "Users can delete their own quiz answers"
ON public.quiz_responses
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Fix function search paths for security
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3. Add verified_scholarships sample data (since count is 0)
INSERT INTO public.verified_scholarships (
  name, provider, official_domain, source, source_url, apply_url,
  eligibility_summary, amount, required_documents, status, target_academic_level, target_locations
) VALUES 
(
  'National Scholarship Portal (NSP) - Pre-Matric Scholarship',
  'Ministry of Social Justice and Empowerment',
  'scholarships.gov.in',
  'NSP Official',
  'https://scholarships.gov.in',
  'https://scholarships.gov.in/fresh/registercheck',
  'For students from SC/ST/OBC/Minority communities studying in Class 9-10',
  '₹1,000-3,500 per annum',
  ARRAY['Income Certificate', 'Caste Certificate', 'Aadhaar Card', 'Bank Account Details'],
  'active',
  ARRAY['Class 9-10'],
  ARRAY['All India']
),
(
  'NSP Post-Matric Scholarship for SC Students',
  'Ministry of Social Justice and Empowerment',
  'scholarships.gov.in',
  'NSP Official',
  'https://scholarships.gov.in',
  'https://scholarships.gov.in/fresh/registercheck',
  'For SC students pursuing Post-Matric or Post-Secondary education',
  '₹2,500-15,000 per annum + maintenance allowance',
  ARRAY['Income Certificate', 'Caste Certificate', 'Previous Year Marksheet', 'Bank Details'],
  'active',
  ARRAY['Class 11-12', 'UG', 'PG', 'Diploma'],
  ARRAY['All India']
),
(
  'UP Scholarship - Pre-Matric',
  'Government of Uttar Pradesh',
  'scholarship.up.gov.in',
  'UP Scholarship Portal',
  'https://scholarship.up.gov.in',
  'https://scholarship.up.gov.in/fresh-student.html',
  'For UP domicile students from Class 9-10 belonging to OBC/SC/ST/General categories',
  '₹1,000-1,500 per annum',
  ARRAY['Domicile Certificate', 'Income Certificate', 'Caste Certificate', 'Bank Account'],
  'active',
  ARRAY['Class 9-10'],
  ARRAY['Uttar Pradesh']
),
(
  'UP Scholarship - Post-Matric',
  'Government of Uttar Pradesh',
  'scholarship.up.gov.in',
  'UP Scholarship Portal',
  'https://scholarship.up.gov.in',
  'https://scholarship.up.gov.in/fresh-student.html',
  'For UP students pursuing higher education after Class 10',
  '₹2,000-25,000 per annum based on course',
  ARRAY['Domicile Certificate', 'Income Certificate', 'Previous Marksheet', 'Fee Receipt'],
  'active',
  ARRAY['Class 11-12', 'UG', 'PG', 'Diploma'],
  ARRAY['Uttar Pradesh']
),
(
  'Central Sector Scholarship Scheme',
  'Ministry of Education (MHRD)',
  'scholarships.gov.in',
  'NSP Official',
  'https://scholarships.gov.in',
  'https://scholarships.gov.in/fresh/registercheck',
  'For top 20% students who cleared Class 12 from recognized boards with family income < 8 LPA',
  '₹10,000-20,000 per annum for 3-5 years',
  ARRAY['Class 12 Marksheet', 'Income Certificate', 'Bank Account', 'Aadhaar'],
  'active',
  ARRAY['UG', 'PG'],
  ARRAY['All India']
),
(
  'AICTE Pragati Scholarship for Girls',
  'AICTE',
  'aicte-pragati-saksham.ac.in',
  'AICTE Official',
  'https://www.aicte-pragati-saksham.ac.in',
  'https://www.aicte-pragati-saksham.ac.in',
  'For girl students in AICTE approved technical institutions with family income < 8 LPA',
  '₹50,000 per annum for up to 4 years',
  ARRAY['Income Certificate', 'College Admission Letter', 'Aadhaar', 'Bank Details'],
  'active',
  ARRAY['Diploma', 'UG'],
  ARRAY['All India']
),
(
  'Buddy4Study Scholarships',
  'Buddy4Study',
  'buddy4study.com',
  'Buddy4Study Platform',
  'https://www.buddy4study.com',
  'https://www.buddy4study.com/scholarships',
  'Multiple scholarships for students across India from various corporates and foundations',
  '₹25,000-2,00,000 based on scholarship',
  ARRAY['Application Form', 'Marksheets', 'ID Proof', 'Income Certificate'],
  'active',
  ARRAY['Class 9-10', 'Class 11-12', 'UG', 'PG'],
  ARRAY['All India']
),
(
  'MyScheme - PM Scholarship Scheme',
  'Government of India',
  'myscheme.gov.in',
  'MyScheme Portal',
  'https://www.myscheme.gov.in',
  'https://www.myscheme.gov.in/schemes',
  'For wards of ex-servicemen/ex-coast guard personnel for professional degree courses',
  '₹2,500-3,000 per month for 5 years',
  ARRAY['Discharge Certificate', 'PPO/ESM Certificate', 'Marksheets', 'Bank Account'],
  'active',
  ARRAY['UG'],
  ARRAY['All India']
)
ON CONFLICT DO NOTHING;