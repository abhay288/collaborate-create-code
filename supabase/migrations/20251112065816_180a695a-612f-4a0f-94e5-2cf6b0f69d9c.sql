-- Add UPDATE policy for quiz_responses so users can change their answers
CREATE POLICY "Users can update their own quiz responses"
ON quiz_responses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests from cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net;

COMMENT ON POLICY "Users can update their own quiz responses" ON quiz_responses IS 'Allows users to change their quiz answers before submission';