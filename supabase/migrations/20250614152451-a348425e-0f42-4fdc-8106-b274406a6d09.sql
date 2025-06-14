
-- Vérifier le statut actuel de l'utilisateur
SELECT u.id, u.email, u.raw_user_meta_data->>'role' as auth_role, 
       p.role as profile_role, p.first_name, p.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'reine.elie@gmail.com';

-- S'assurer que le profil existe avec le bon rôle admin
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT u.id, u.email, 'Reine', 'Elie', 'admin'
FROM auth.users u 
WHERE u.email = 'reine.elie@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  updated_at = now();

-- Mettre à jour les métadonnées utilisateur
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
),
updated_at = now()
WHERE email = 'reine.elie@gmail.com';
