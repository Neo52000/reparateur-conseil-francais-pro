-- Fix RPC function and add multi-schedule support

-- 1. Create the missing RPC function for cron status
CREATE OR REPLACE FUNCTION public.get_blog_automation_status()
RETURNS TABLE (
  enabled boolean,
  schedule text,
  last_run timestamptz,
  next_run timestamptz,
  last_status text,
  last_error text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cron.schedule::json->>'active' = 'true' as enabled,
    cron.schedule::text as schedule,
    cron.last_run_start as last_run,
    cron.next_run as next_run,
    cron.status as last_status,
    cron.return_message as last_error
  FROM cron.job cron
  WHERE cron.jobname = 'weekly-blog-automation'
  LIMIT 1;
END;
$$;

-- 2. Create new table for multiple schedules
CREATE TABLE IF NOT EXISTS public.blog_automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  schedule_day INTEGER NOT NULL CHECK (schedule_day >= 0 AND schedule_day <= 6),
  schedule_time TEXT NOT NULL DEFAULT '08:00',
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  prompt_template TEXT,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS for schedules table
ALTER TABLE public.blog_automation_schedules ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies (admin only)
CREATE POLICY "Admins can view schedules"
  ON public.blog_automation_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert schedules"
  ON public.blog_automation_schedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update schedules"
  ON public.blog_automation_schedules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete schedules"
  ON public.blog_automation_schedules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 5. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_blog_automation_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_automation_schedules_updated_at
  BEFORE UPDATE ON public.blog_automation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_automation_schedules_updated_at();

-- 6. Migrate existing config to schedules table (if it exists)
INSERT INTO public.blog_automation_schedules (name, enabled, schedule_day, schedule_time, auto_publish, ai_model, prompt_template, last_run_at)
SELECT 
  'Actualités hebdomadaires' as name,
  enabled,
  schedule_day,
  schedule_time,
  auto_publish,
  ai_model,
  prompt_template,
  last_run_at
FROM public.blog_automation_config
WHERE EXISTS (SELECT 1 FROM public.blog_automation_config)
ON CONFLICT DO NOTHING;

-- 7. Add comment
COMMENT ON TABLE public.blog_automation_schedules IS 'Multiple scheduled blog automation configurations with category selection';