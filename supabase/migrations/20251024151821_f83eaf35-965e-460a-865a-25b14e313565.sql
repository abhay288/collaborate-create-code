-- Enable real-time for user activity table
ALTER TABLE public.user_activity REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity;