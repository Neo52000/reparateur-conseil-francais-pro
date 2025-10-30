-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.get_blog_automation_config();

-- Recréer la fonction avec le bon schéma
CREATE OR REPLACE FUNCTION public.get_blog_automation_config()
RETURNS TABLE(
  id UUID,
  enabled BOOLEAN,
  auto_publish BOOLEAN,
  schedule_time TEXT,
  schedule_day INTEGER,
  ai_model TEXT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  prompt_template TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Retourner la configuration (ou NULL si elle n'existe pas)
  RETURN QUERY
  SELECT 
    bac.id,
    bac.enabled,
    bac.auto_publish,
    bac.schedule_time,
    bac.schedule_day,
    bac.ai_model,
    bac.last_run_at,
    bac.next_run_at,
    bac.prompt_template,
    bac.created_at,
    bac.updated_at
  FROM public.blog_automation_config bac
  ORDER BY bac.created_at DESC
  LIMIT 1;
END;
$$;