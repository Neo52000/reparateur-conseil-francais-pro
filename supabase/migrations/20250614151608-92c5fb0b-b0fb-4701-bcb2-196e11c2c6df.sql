
-- Vérifier le profil existant
SELECT id, email, first_name, last_name, role 
FROM public.profiles 
WHERE email = 'reine.elie@gmail.com';

-- Vérifier l'utilisateur dans auth.users
SELECT id, email, raw_user_meta_data
FROM auth.users 
WHERE email = 'reine.elie@gmail.com';
