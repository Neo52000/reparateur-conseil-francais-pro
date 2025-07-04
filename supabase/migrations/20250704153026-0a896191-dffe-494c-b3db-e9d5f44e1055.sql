-- Ajouter la colonne description à la table repairers pour corriger l'erreur RLS
ALTER TABLE public.repairers 
ADD COLUMN IF NOT EXISTS description TEXT;