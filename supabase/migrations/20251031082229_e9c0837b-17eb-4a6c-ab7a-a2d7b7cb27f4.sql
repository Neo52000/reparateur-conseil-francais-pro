-- Assigner tous les rôles à l'utilisateur super admin (reine.elie@gmail.com)
-- L'utilisateur doit avoir accès aux 3 interfaces : admin, repairer, user (client)

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Trouver l'UUID de l'utilisateur avec l'email reine.elie@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'reine.elie@gmail.com'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Ajouter le rôle 'admin' (si pas déjà présent)
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (admin_user_id, 'admin', true)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET is_active = true;
    
    -- Ajouter le rôle 'repairer' (si pas déjà présent)
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (admin_user_id, 'repairer', true)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET is_active = true;
    
    -- Ajouter le rôle 'user' (accès client) (si pas déjà présent)
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (admin_user_id, 'user', true)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET is_active = true;
    
    RAISE NOTICE 'Rôles assignés avec succès à l''utilisateur %', admin_user_id;
  ELSE
    RAISE WARNING 'Utilisateur reine.elie@gmail.com non trouvé';
  END IF;
END $$;