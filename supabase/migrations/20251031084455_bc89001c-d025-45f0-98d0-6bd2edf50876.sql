-- Phase A: Create RPC for blog automation status (if not exists)
CREATE OR REPLACE FUNCTION public.get_blog_automation_status()
RETURNS TABLE (
  enabled boolean,
  schedule text,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  last_status text,
  last_error text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true as enabled,
    '0 8 * * *' as schedule,
    NULL::timestamp with time zone as last_run,
    NULL::timestamp with time zone as next_run,
    'pending'::text as last_status,
    NULL::text as last_error;
$$;

-- Phase B: Setup pg_cron for daily blog automation
-- Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if exists (use DO block to handle non-existent job)
DO $$
BEGIN
  PERFORM cron.unschedule('daily-blog-auto-publish');
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Job doesn't exist, continue
  WHEN OTHERS THEN
    NULL; -- Ignore other errors
END $$;

-- Create daily cron job at 8:00 AM to call blog-auto-publish
SELECT cron.schedule(
  'daily-blog-auto-publish',
  '0 8 * * *', -- Daily at 8:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-auto-publish',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);