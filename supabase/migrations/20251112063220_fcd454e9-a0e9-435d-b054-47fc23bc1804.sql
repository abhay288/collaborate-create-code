-- Create recommendation feedback table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('job', 'college', 'scholarship')),
  recommendation_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'applied', 'not_interested')),
  feedback_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_recommendation_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_type ON public.recommendation_feedback(recommendation_type);
CREATE INDEX idx_recommendation_feedback_recommendation_id ON public.recommendation_feedback(recommendation_id);

-- Enable RLS
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.recommendation_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own feedback
CREATE POLICY "Users can create their own feedback"
ON public.recommendation_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
ON public.recommendation_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
ON public.recommendation_feedback
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_recommendation_feedback_updated_at
BEFORE UPDATE ON public.recommendation_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();