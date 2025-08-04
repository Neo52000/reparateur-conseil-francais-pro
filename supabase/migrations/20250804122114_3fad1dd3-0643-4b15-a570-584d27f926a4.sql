-- Créer le profil admin avec UUID correct (ajoutons les tirets manquants)
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  '2eb236c5-7566-42a0-995d-c7d5716adcf0'::uuid,
  'reine.elie@gmail.com',
  'Reine',
  'Elie',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = now();