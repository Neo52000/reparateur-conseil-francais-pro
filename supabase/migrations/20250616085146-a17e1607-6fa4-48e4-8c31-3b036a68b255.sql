
-- Supprimer l'ancienne contrainte de vérification des rôles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Créer une nouvelle contrainte qui inclut le rôle 'repairer'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'repairer'));
