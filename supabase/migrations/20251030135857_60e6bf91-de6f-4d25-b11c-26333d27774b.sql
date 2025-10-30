-- Attribuer le rôle admin à reine.elie@gmail.com
INSERT INTO public.user_roles (user_id, role, is_active)
SELECT id, 'admin', true
FROM public.profiles
WHERE email = 'reine.elie@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true;