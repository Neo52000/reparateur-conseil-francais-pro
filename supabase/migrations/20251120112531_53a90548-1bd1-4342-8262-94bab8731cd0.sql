-- Update blog_automation_schedules RLS to allow admins via profiles.role OR user_roles.role

-- Drop existing policies
DROP POLICY IF EXISTS "admin_select_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_insert_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_update_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_delete_blog_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can view schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can insert schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_select_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_insert_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_update_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_delete_blog_automation_schedules" ON public.blog_automation_schedules;

-- New combined policies: profiles.role = 'admin' OR user_roles has active admin
CREATE POLICY "admin_select_blog_schedules"
ON public.blog_automation_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "admin_insert_blog_schedules"
ON public.blog_automation_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "admin_update_blog_schedules"
ON public.blog_automation_schedules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "admin_delete_blog_schedules"
ON public.blog_automation_schedules
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
  )
);