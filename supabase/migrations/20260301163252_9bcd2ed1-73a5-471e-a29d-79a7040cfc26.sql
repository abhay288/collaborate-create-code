
-- Mock Interview tables
CREATE TABLE public.mock_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'in_progress',
  overall_score integer,
  strengths text[],
  improvements text[],
  feedback_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.mock_interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_number integer NOT NULL,
  category text,
  user_answer text,
  ai_score integer,
  ai_feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interviews" ON public.mock_interviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own interview questions" ON public.mock_interview_questions FOR ALL USING (EXISTS (SELECT 1 FROM public.mock_interviews WHERE id = mock_interview_questions.interview_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.mock_interviews WHERE id = mock_interview_questions.interview_id AND user_id = auth.uid()));
