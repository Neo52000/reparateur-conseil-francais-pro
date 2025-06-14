
-- Créer le compte admin reine.elie@gmail.com
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'reine.elie@gmail.com',
  crypt('Rpadfhq3@52', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Reine","last_name":"Elie","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Créer le profil admin automatiquement
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT u.id, u.email, 'Reine', 'Elie', 'admin'
FROM auth.users u 
WHERE u.email = 'reine.elie@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  updated_at = now();
