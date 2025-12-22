-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Public can view basic repairer info" ON public.repairers;

-- Créer une nouvelle politique qui permet la lecture de tous les réparateurs
CREATE POLICY "Public can view all repairers" 
ON public.repairers 
FOR SELECT 
TO public
USING (true);