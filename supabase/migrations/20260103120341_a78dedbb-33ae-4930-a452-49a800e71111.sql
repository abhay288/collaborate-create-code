-- Create FAQs table for admin-editable FAQ system
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_display_order ON public.faqs(display_order);
CREATE INDEX idx_faqs_active ON public.faqs(is_active);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public can view active FAQs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true);

-- Admins can manage FAQs
CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial FAQs from the existing content
INSERT INTO public.faqs (category, question, answer, display_order) VALUES
-- About Avsar
('About Avsar', 'What is Avsar?', 'Avsar is an AI-powered career and education guidance platform designed to help students make informed decisions about their future. It uses advanced machine learning algorithms to analyze your aptitude, interests, and goals to provide personalized career recommendations, college suggestions, and scholarship opportunities.', 1),
('About Avsar', 'Is Avsar free to use?', 'Yes, Avsar is completely free for students. You can take aptitude quizzes, receive career recommendations, explore colleges, and discover scholarships without any cost. We believe quality career guidance should be accessible to everyone.', 2),
('About Avsar', 'How does Avsar''s AI work?', 'Avsar uses a combination of aptitude assessment scores, user preferences, location data, and machine learning models to generate personalized recommendations. Our AI analyzes your quiz responses across categories like logical reasoning, creativity, analytical skills, and technical interests to build a unique profile and match you with suitable career paths and educational opportunities.', 3),
('About Avsar', 'Who can use Avsar?', 'Avsar is designed for students at various stages of their educational journey – from high school students exploring career options to college students looking for the right programs. The platform adapts its recommendations based on your current class level and study area.', 4),
-- Aptitude Quiz
('Aptitude Quiz', 'How long does the aptitude quiz take?', 'The aptitude quiz typically takes 15-25 minutes to complete, depending on how quickly you answer. The quiz consists of 15-20 questions across different categories including logical reasoning, analytical skills, creativity, and technical interests.', 5),
('Aptitude Quiz', 'Can I retake the aptitude quiz?', 'Yes, you can retake the aptitude quiz anytime. Your latest quiz results will be used for generating new recommendations. We recommend retaking the quiz if your interests or goals have changed significantly.', 6),
('Aptitude Quiz', 'What categories does the quiz assess?', 'The quiz assesses multiple dimensions including: Logical Reasoning, Analytical Skills, Creativity, Technical Interests, Quantitative Aptitude, Verbal Ability, and Interpersonal Skills. Each category contributes to your overall profile for more accurate recommendations.', 7),
('Aptitude Quiz', 'Are quiz questions different each time?', 'Yes, questions are dynamically selected based on your class level and study area. The AI also generates new questions to ensure fresh assessments. This helps provide more accurate and updated evaluations of your aptitude.', 8),
-- College Recommendations
('College Recommendations', 'How are colleges recommended to me?', 'Colleges are recommended based on multiple factors: your quiz-derived career interests, preferred courses, location preferences (state and district), college ratings, and the courses they offer. We prioritize colleges in your state first, then nearby states, ensuring locally relevant suggestions.', 9),
('College Recommendations', 'Can I filter colleges by location?', 'Yes, you can set your preferred state and district in your profile. The recommendation engine will prioritize colleges in your preferred location. You can also browse the full college database and apply filters for location, courses, fees, and ratings.', 10),
('College Recommendations', 'What information is available for each college?', 'For each college, you can view: name, location (state and district), courses offered, fees, ratings, NAAC grade, affiliation, established year, admission links, and contact information. We strive to keep this information updated and accurate.', 11),
('College Recommendations', 'Why am I seeing colleges from other states?', 'If there aren''t enough colleges in your state offering your recommended courses, the system includes colleges from nearby states. This ensures you have multiple options to consider. All-India colleges are shown only when regional options are very limited.', 12),
-- Scholarships
('Scholarships', 'How do I find scholarships on Avsar?', 'Visit the Scholarships section to browse all available scholarships. You can filter by type (government, private, NGO), eligibility criteria, deadlines, and amounts. Verified scholarships include direct application links and tutorial videos to help you apply.', 13),
('Scholarships', 'What are Verified Scholarships?', 'Verified Scholarships are opportunities that our team has manually verified for authenticity. These include confirmed application links, official domains, eligibility criteria, and often YouTube tutorial videos explaining the application process.', 14),
('Scholarships', 'How often is scholarship information updated?', 'We regularly update scholarship information including deadlines, eligibility criteria, and amounts. Verified scholarships show the ''last checked'' date so you know how recent the information is. However, always verify details on the official scholarship website before applying.', 15),
('Scholarships', 'Can Avsar help me apply for scholarships?', 'Avsar provides all the information you need to apply, including eligibility criteria, required documents, and application links. For verified scholarships, we also include tutorial videos. However, the actual application must be submitted through the official scholarship portal.', 16),
-- Profile & Account
('Profile & Account', 'How do I update my profile?', 'Go to the Profile page from the dashboard or navigation menu. Here you can update your personal information, education level, class, study area, interests, and location preferences. Updating your profile helps improve the accuracy of recommendations.', 17),
('Profile & Account', 'Can I change my preferred location for recommendations?', 'Yes, you can update your preferred state and district in your profile settings. After updating, your college and scholarship recommendations will reflect your new location preferences.', 18),
('Profile & Account', 'How do I delete my account?', 'To delete your account, go to Profile settings and look for the account deletion option. Please note that account deletion is permanent and will remove all your quiz history, saved items, and recommendations.', 19),
('Profile & Account', 'Is my personal data secure?', 'Yes, we take data security seriously. Your data is encrypted and stored securely using Supabase''s enterprise-grade security. We never share your personal information with third parties without your explicit consent. Read our Privacy Policy for more details.', 20),
-- Recommendations & Results
('Recommendations & Results', 'How accurate are the career recommendations?', 'Our recommendations are based on validated aptitude assessment methodologies and AI analysis. Each recommendation comes with a confidence score indicating how well it matches your profile. While we strive for accuracy, recommendations should be used as guidance alongside personal research and professional counseling.', 21),
('Recommendations & Results', 'Why don''t I see any recommendations?', 'Recommendations are generated after you complete the aptitude quiz. If you haven''t taken the quiz yet, please do so first. If you''ve taken the quiz but still don''t see recommendations, try refreshing the page or checking if the onboarding is complete in your profile.', 22),
('Recommendations & Results', 'Can I provide feedback on recommendations?', 'Yes! Each recommendation has feedback buttons (thumbs up/down) that help us improve our AI. Your feedback is valuable and helps us provide better suggestions to all users.', 23),
('Recommendations & Results', 'How do I save colleges or scholarships for later?', 'You can save any college or scholarship to your favorites by clicking the heart/bookmark icon on the card. Access your saved items from the dashboard or profile page.', 24);