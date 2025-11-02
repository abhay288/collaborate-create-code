-- Add more categories to quiz_category enum
ALTER TYPE public.quiz_category ADD VALUE IF NOT EXISTS 'quantitative';
ALTER TYPE public.quiz_category ADD VALUE IF NOT EXISTS 'verbal';
ALTER TYPE public.quiz_category ADD VALUE IF NOT EXISTS 'interpersonal';