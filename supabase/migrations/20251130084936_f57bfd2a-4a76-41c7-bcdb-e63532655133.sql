-- =====================================================
-- FIX: Blog Automation - get_blog_automation_status function
-- Corriger la dépendance circulaire RLS avec SECURITY DEFINER
-- =====================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.get_blog_automation_status();

-- Créer la nouvelle fonction avec SECURITY DEFINER pour éviter les problèmes RLS
CREATE OR REPLACE FUNCTION public.get_blog_automation_status()
RETURNS TABLE (
  enabled boolean,
  schedule text,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  last_status text,
  last_error text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF get_current_user_role() != 'admin' THEN
    RETURN;
  END IF;

  -- Retourner le statut de l'automation (pour l'instant des valeurs par défaut)
  RETURN QUERY
  SELECT 
    true as enabled,
    '0 8 * * 1'::text as schedule,
    NULL::timestamp with time zone as last_run,
    NULL::timestamp with time zone as next_run,
    'pending'::text as last_status,
    NULL::text as last_error;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_blog_automation_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_blog_automation_status() TO anon;

-- Forcer le rechargement du schéma PostgREST
NOTIFY pgrst, 'reload schema';