-- RLS policy to allow admins to INSERT into blog_automation_config
-- Ensures only users with admin role in public.user_roles can create the default config

-- Enable RLS (safe if already enabled)
ALTER TABLE public.blog_automation_config ENABLE ROW LEVEL SECURITY;

-- Drop and recreate INSERT policy for admins
DROP POLICY IF EXISTS "Admins can insert blog automation config" ON public.blog_automation_config;
CREATE POLICY "Admins can insert blog automation config"
  ON public.blog_automation_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
        AND ur.is_active = true
    )
  );
