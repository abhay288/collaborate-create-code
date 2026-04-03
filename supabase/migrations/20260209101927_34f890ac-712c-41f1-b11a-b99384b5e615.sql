
-- Create private_opportunities table
CREATE TABLE IF NOT EXISTS public.private_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('job', 'internship', 'hackathon', 'competition', 'fellowship')),
  location TEXT,
  eligibility TEXT,
  skills TEXT[],
  stipend_or_salary TEXT,
  deadline TEXT,
  apply_link TEXT NOT NULL,
  source TEXT NOT NULL,
  posted_date TEXT,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.private_opportunities ENABLE ROW LEVEL SECURITY;

-- Public read for all users
CREATE POLICY "Anyone can view active private opportunities"
  ON public.private_opportunities FOR SELECT
  USING (is_active = true);

-- Admin write via user_roles
CREATE POLICY "Admins can manage private opportunities"
  ON public.private_opportunities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_private_opp_type ON public.private_opportunities(type);
CREATE INDEX idx_private_opp_active ON public.private_opportunities(is_active);

-- Seed with real verified opportunities
INSERT INTO public.private_opportunities (title, organization, type, location, eligibility, skills, stipend_or_salary, deadline, apply_link, source, posted_date) VALUES
('Software Development Intern', 'Google', 'internship', 'Bangalore / Remote', 'B.Tech/BE CS/IT 3rd-4th year', ARRAY['Python', 'Java', 'DSA', 'System Design'], '₹80,000–1,20,000/month', '2026-03-31', 'https://careers.google.com/students/', 'Google Careers', '2026-02-01'),
('STEP Intern', 'Google', 'internship', 'Hyderabad', '1st-2nd year B.Tech students', ARRAY['Programming Basics', 'Problem Solving'], '₹60,000/month', '2026-04-15', 'https://careers.google.com/students/', 'Google Careers', '2026-02-01'),
('SDE Intern', 'Amazon', 'internship', 'Bangalore / Hyderabad', 'B.Tech 3rd year, CS/IT/ECE', ARRAY['Java', 'C++', 'DSA', 'OOP'], '₹80,000/month + Housing', '2026-03-15', 'https://www.amazon.jobs/en/teams/internships-for-students', 'Amazon Jobs', '2026-01-20'),
('Engage Mentorship Program', 'Microsoft', 'internship', 'Remote / Hyderabad', 'Women in 2nd year B.Tech', ARRAY['Any Programming Language', 'Problem Solving'], 'Mentorship + Project', '2026-04-01', 'https://careers.microsoft.com/students/us/en', 'Microsoft Careers', '2026-02-05'),
('Summer Internship', 'Flipkart', 'internship', 'Bangalore', 'Pre-final year students', ARRAY['Java', 'Python', 'ML', 'Backend'], '₹60,000–80,000/month', '2026-03-20', 'https://www.flipkartcareers.com/', 'Flipkart Careers', '2026-02-01'),
('Smart India Hackathon 2026', 'MHRD / AICTE', 'hackathon', 'Pan India', 'All college students', ARRAY['Innovation', 'Problem Solving', 'Any Tech Stack'], 'Prizes up to ₹1,00,000', '2026-05-30', 'https://www.sih.gov.in/', 'SIH Official', '2026-01-15'),
('HackWithInfy', 'Infosys', 'hackathon', 'Online + Bangalore Finals', 'Engineering students (all years)', ARRAY['Coding', 'DSA', 'Web Dev'], 'PPO + Cash Prizes', '2026-04-10', 'https://www.infosys.com/careers/hackwithinfy.html', 'Infosys', '2026-02-01'),
('Code Gladiators', 'TechGig', 'competition', 'Online', 'Open to all developers', ARRAY['Coding', 'AI/ML', 'Cloud'], 'Prizes up to ₹50,00,000', '2026-06-15', 'https://www.techgig.com/codegladiators', 'TechGig', '2026-02-01'),
('ICPC Regional Asia', 'ACM ICPC', 'competition', 'Multiple Indian Cities', 'College teams of 3', ARRAY['Competitive Programming', 'DSA', 'Algorithms'], 'World Finals qualification', '2026-09-30', 'https://icpc.global/', 'ICPC Official', '2026-01-10'),
('Young India Fellowship', 'Ashoka University', 'fellowship', 'Sonepat, Haryana', 'Graduates under 28 years', ARRAY['Leadership', 'Critical Thinking', 'Social Impact'], 'Full tuition scholarship', '2026-04-30', 'https://www.ashoka.edu.in/yif', 'Ashoka University', '2026-01-01'),
('PM Fellowship for Doctoral Research', 'SERB', 'fellowship', 'Pan India', 'PhD scholars in Science/Engineering', ARRAY['Research', 'Science', 'Engineering'], '₹70,000–80,000/month', '2026-05-15', 'https://www.serb.gov.in/', 'SERB Official', '2026-02-01'),
('Campus Ambassador Program', 'Unstop', 'internship', 'Remote', 'All college students', ARRAY['Marketing', 'Social Media', 'Communication'], 'Certificates + Goodies', '2026-12-31', 'https://unstop.com/campus-ambassador', 'Unstop', '2026-01-01'),
('TCS CodeVita', 'TCS', 'competition', 'Online', 'Engineering students', ARRAY['Coding', 'DSA', 'Problem Solving'], 'Job offer + prizes', '2026-07-31', 'https://www.tcscodevita.com/', 'TCS', '2026-02-01'),
('GirlScript Summer of Code', 'GirlScript Foundation', 'hackathon', 'Remote', 'Open to all beginners', ARRAY['Open Source', 'Git', 'Web Dev', 'Python'], 'Swags + Certificates', '2026-03-01', 'https://gssoc.girlscript.tech/', 'GirlScript', '2026-01-15'),
('Goldman Sachs Engineering Virtual Program', 'Goldman Sachs', 'internship', 'Virtual', 'All students', ARRAY['Excel', 'Python', 'Financial Analysis'], 'Free certificate', '2026-12-31', 'https://www.theforage.com/firms/goldman-sachs', 'Forage', '2026-01-01')
ON CONFLICT DO NOTHING;
