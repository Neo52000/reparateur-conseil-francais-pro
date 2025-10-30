-- Recréer la fonction get_blog_automation_config pour retourner une seule ligne
DROP FUNCTION IF EXISTS public.get_blog_automation_config();

CREATE OR REPLACE FUNCTION public.get_blog_automation_config()
RETURNS public.blog_automation_config
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg public.blog_automation_config;
BEGIN
  -- Contrôle d'accès: seuls les admins peuvent accéder
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Permission denied: admin role required'
      USING errcode = '42501';
  END IF;

  -- Récupérer la première ligne de configuration
  SELECT *
  INTO cfg
  FROM public.blog_automation_config
  LIMIT 1;

  RETURN cfg;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_blog_automation_config() TO authenticated;