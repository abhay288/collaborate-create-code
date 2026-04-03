-- Create NGOs table for educational NGOs
CREATE TABLE public.ngos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mission_summary TEXT NOT NULL,
  primary_focus TEXT NOT NULL,
  states_present TEXT[] DEFAULT '{}',
  hq_address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT NOT NULL,
  apply_or_donate_link TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active NGOs" 
  ON public.ngos 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage NGOs" 
  ON public.ngos 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_ngos_updated_at
  BEFORE UPDATE ON public.ngos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial NGO data
INSERT INTO public.ngos (name, mission_summary, primary_focus, states_present, website, email, apply_or_donate_link, verified, is_active) VALUES
('Pratham Education Foundation', 'Improve quality of education through large-scale remedial programs across India. Focuses on foundational literacy and numeracy for underprivileged children.', 'Remedial Learning', ARRAY['Maharashtra', 'Delhi', 'Rajasthan', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Bihar', 'Uttar Pradesh'], 'https://www.pratham.org/', NULL, 'https://www.pratham.org/', true, true),

('Teach For India', 'Fellowship-based teaching initiative placing talented graduates in underserved classrooms to drive systemic change in education quality.', 'Quality Teaching', ARRAY['Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Bangalore', 'Chennai', 'Kolkata'], 'https://www.teachforindia.org/', NULL, 'https://www.teachforindia.org/contact-us', true, true),

('Smile Foundation', 'Multi-faceted approach to education, health, and livelihood programs across India, with special focus on girl child education.', 'Education & Health', ARRAY['Delhi', 'Maharashtra', 'Karnataka', 'West Bengal', 'Odisha', 'Jharkhand'], 'https://www.smilefoundationindia.org/', 'info@smilefoundationindia.org', 'https://www.smilefoundationindia.org/', true, true),

('The Akshaya Patra Foundation', 'Largest mid-day meal provider in the world, serving nutritious meals to improve school attendance and child nutrition.', 'Mid-Day Meals', ARRAY['Karnataka', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Andhra Pradesh', 'Telangana', 'Odisha', 'Assam'], 'https://www.akshayapatra.org/', NULL, 'https://www.akshayapatra.org/', true, true),

('CRY (Child Rights and You)', 'Restores childrens right to education, health, protection and participation by partnering with grassroots organizations.', 'Child Rights', ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'], 'https://www.cry.org/', NULL, 'https://www.cry.org/contact/', true, true),

('Educate Girls', 'Community-based program to enroll out-of-school girls and improve learning outcomes through volunteer-driven remedial learning.', 'Girls Education', ARRAY['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'], 'https://www.educategirls.ngo/', 'info.in@educategirls.ngo', 'https://www.educategirls.ngo/', true, true),

('Room to Read India', 'Focuses on literacy and girls education through school libraries, teacher training, and life skills programs.', 'Literacy', ARRAY['Delhi', 'Rajasthan', 'Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Uttarakhand', 'Chhattisgarh'], 'https://www.roomtoread.org/', 'info.india@roomtoread.org', 'https://www.roomtoread.org/', true, true),

('Save the Children India', 'Global organization providing education, healthcare, and protection to disadvantaged children across India.', 'Child Protection', ARRAY['Delhi', 'Bihar', 'Jharkhand', 'Odisha', 'Rajasthan', 'West Bengal', 'Andhra Pradesh', 'Telangana'], 'https://www.savethechildren.in/', NULL, 'https://www.savethechildren.in/', true, true),

('Goonj', 'Uses reuse and recycling initiatives to support rural education infrastructure, school supplies, and community development.', 'Rural Education', ARRAY['Delhi', 'Bihar', 'Jharkhand', 'Odisha', 'Karnataka', 'Maharashtra'], 'https://goonj.org/', NULL, 'https://goonj.org/', true, true),

('Bharti Foundation', 'Runs quality schools and education programs in rural areas through Satya Bharti Schools and learning initiatives.', 'Rural Schools', ARRAY['Punjab', 'Haryana', 'Rajasthan', 'Uttar Pradesh', 'Tamil Nadu', 'West Bengal'], 'https://www.bhartifoundation.org/', NULL, 'https://www.bhartifoundation.org/', true, true),

('Make A Difference (MAD)', 'Supports children in shelter homes to access quality education, mentorship, and life skills development.', 'Shelter Home Education', ARRAY['Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Mumbai', 'Chennai', 'Kolkata', 'Lucknow'], 'https://makeadiff.in/', NULL, 'https://makeadiff.in/', true, true),

('Azim Premji Foundation', 'Works on systemic reform in public education through teacher development, curriculum design, and school leadership programs.', 'Teacher Development', ARRAY['Karnataka', 'Rajasthan', 'Chhattisgarh', 'Uttarakhand', 'Madhya Pradesh', 'Puducherry', 'Telangana'], 'https://azimpremjifoundation.org/', NULL, 'https://azimpremjifoundation.org/', true, true);