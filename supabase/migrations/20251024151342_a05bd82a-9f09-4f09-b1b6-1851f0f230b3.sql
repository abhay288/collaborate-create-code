-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for quiz question categories
CREATE TYPE public.quiz_category AS ENUM ('logical_reasoning', 'analytical_skills', 'creativity', 'technical_interests');

-- Create enum for scholarship types
CREATE TYPE public.scholarship_type AS ENUM ('government', 'private', 'ngo');

-- Create enum for favorite item types
CREATE TYPE public.favorite_item_type AS ENUM ('career', 'college', 'scholarship');

-- User Roles Table (for admin management)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Quiz Questions Table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  category quiz_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Quiz Sessions Table
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Quiz Responses Table
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Careers Table
CREATE TABLE public.careers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- Career Recommendations Table
CREATE TABLE public.career_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

-- Colleges Table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  courses_offered TEXT[],
  cutoff_scores JSONB,
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  fees NUMERIC(12,2),
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Scholarships Table
CREATE TABLE public.scholarships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility_criteria TEXT NOT NULL,
  amount NUMERIC(12,2),
  deadline TIMESTAMP WITH TIME ZONE,
  type scholarship_type NOT NULL,
  application_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- User Favorites Table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type favorite_item_type NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- User Activity Table
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_quiz_responses_session_id ON public.quiz_responses(quiz_session_id);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_career_recommendations_user_id ON public.career_recommendations(user_id);
CREATE INDEX idx_career_recommendations_session_id ON public.career_recommendations(quiz_session_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX idx_colleges_location ON public.colleges(location);

-- Security Definer Function for Role Checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_questions (public read, admin write)
CREATE POLICY "Anyone can view quiz questions"
  ON public.quiz_questions
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions"
  ON public.quiz_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions"
  ON public.quiz_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
  ON public.quiz_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quiz_responses
CREATE POLICY "Users can view their own quiz responses"
  ON public.quiz_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz responses"
  ON public.quiz_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for careers (public read, admin write)
CREATE POLICY "Anyone can view careers"
  ON public.careers
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage careers"
  ON public.careers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for career_recommendations
CREATE POLICY "Users can view their own career recommendations"
  ON public.career_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own career recommendations"
  ON public.career_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for colleges (public read, admin write)
CREATE POLICY "Anyone can view colleges"
  ON public.colleges
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage colleges"
  ON public.colleges
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for scholarships (public read, admin write)
CREATE POLICY "Anyone can view scholarships"
  ON public.scholarships
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage scholarships"
  ON public.scholarships
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity"
  ON public.user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
  ON public.user_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON public.user_activity
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at columns
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_careers_updated_at
  BEFORE UPDATE ON public.careers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true);

-- Storage policies for profile pictures
CREATE POLICY "Users can view all profile pictures"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile picture"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile picture"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );