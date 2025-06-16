
-- Vérifier la contrainte actuelle sur la table profiles
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Mettre à jour la contrainte pour autoriser le rôle 'client'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'user', 'client', 'repairer'));
