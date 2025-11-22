-- Create blog_automation_schedules table
CREATE TABLE IF NOT EXISTS public.blog_automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  schedule_day INTEGER NOT NULL CHECK (schedule_day >= 0 AND schedule_day <= 6),
  schedule_time TEXT NOT NULL DEFAULT '09:00',
  auto_publish BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT NOT NULL DEFAULT 'mistral-large-latest',
  prompt_template TEXT,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_automation_schedules ENABLE ROW LEVEL SECURITY;

-- Policies: Admin only
CREATE POLICY "Admins can view all schedules"
  ON public.blog_automation_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create schedules"
  ON public.blog_automation_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update schedules"
  ON public.blog_automation_schedules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete schedules"
  ON public.blog_automation_schedules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.blog_automation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for performance
CREATE INDEX idx_blog_automation_schedules_enabled ON public.blog_automation_schedules(enabled);
CREATE INDEX idx_blog_automation_schedules_category ON public.blog_automation_schedules(category_id);