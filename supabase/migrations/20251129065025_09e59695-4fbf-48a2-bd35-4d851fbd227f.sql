-- =====================================================
-- FIX: Blog Automation Schedules RLS Policy
-- Corriger la dépendance circulaire RLS
-- =====================================================

-- Supprimer l'ancienne politique qui fait un SELECT direct sur user_roles
DROP POLICY IF EXISTS "Admins can manage automation schedules" ON public.blog_automation_schedules;

-- Créer la nouvelle politique utilisant get_current_user_role() (SECURITY DEFINER)
-- Cela évite la dépendance circulaire car la fonction bypass RLS
CREATE POLICY "Admins can manage automation schedules" 
ON public.blog_automation_schedules
FOR ALL 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');