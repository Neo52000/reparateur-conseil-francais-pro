-- Corriger la fonction get_current_user_role pour prioriser admin > repairer > user
-- Le problème: LIMIT 1 sans ORDER BY retourne un rôle aléatoire parmi les 3 rôles actifs
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles 
     WHERE user_id = auth.uid() 
     AND is_active = true 
     ORDER BY 
       CASE role 
         WHEN 'admin' THEN 1 
         WHEN 'repairer' THEN 2 
         ELSE 3 
       END
     LIMIT 1), 
    'user'
  );
$$;