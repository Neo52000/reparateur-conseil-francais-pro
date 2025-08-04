-- Créer le profil admin pour l'utilisateur actuel
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  '2eb236c5-7566-42a0-995d-c7d5716adcf'::uuid,
  'reine.elie@gmail.com',
  'Reine',
  'Elie',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = now();

-- Créer l'entrée dans user_roles
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES (
  '2eb236c5-7566-42a0-995d-c7d5716adcf'::uuid,
  'admin',
  true
)
ON CONFLICT (user_id, role) DO UPDATE SET 
  is_active = true,
  assigned_at = now();