
-- Career Roadmaps table
CREATE TABLE public.career_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_career TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmaps" ON public.career_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON public.career_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON public.career_roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own roadmaps" ON public.career_roadmaps FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_career_roadmaps_updated_at BEFORE UPDATE ON public.career_roadmaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mentor Chat Sessions table
CREATE TABLE public.mentor_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat sessions" ON public.mentor_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chat sessions" ON public.mentor_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.mentor_chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Mentor Chat Messages table
CREATE TABLE public.mentor_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.mentor_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat messages" ON public.mentor_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.mentor_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Skill Gap Analysis cache
CREATE TABLE public.skill_gap_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  user_skills TEXT[] NOT NULL DEFAULT '{}',
  missing_skills TEXT[] NOT NULL DEFAULT '{}',
  match_percentage INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_gap_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skill gaps" ON public.skill_gap_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skill gaps" ON public.skill_gap_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skill gaps" ON public.skill_gap_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skill gaps" ON public.skill_gap_analyses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_skill_gap_analyses_updated_at BEFORE UPDATE ON public.skill_gap_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
