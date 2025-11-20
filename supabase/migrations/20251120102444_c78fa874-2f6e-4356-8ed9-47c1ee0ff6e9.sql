-- Fix blog_automation_schedules RLS policies to use profiles.role instead of user_roles
-- This fixes the issue where admins can't add blog schedules

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can insert schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_select_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_insert_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_update_blog_automation_schedules" ON public.blog_automation_schedules;
DROP POLICY IF EXISTS "admin_delete_blog_automation_schedules" ON public.blog_automation_schedules;

-- Create new policies using profiles.role
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
);