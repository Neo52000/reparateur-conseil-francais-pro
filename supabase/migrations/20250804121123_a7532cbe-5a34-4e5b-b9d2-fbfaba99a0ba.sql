-- Créer une politique temporaire plus permissive pour diagnostiquer
CREATE POLICY "Temporary debug policy for suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Mettre à jour le profil de l'utilisateur actuel pour lui donner le rôle admin
-- Utilisons l'ID d'utilisateur spécifique que nous obtiendrons
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE id = '2eb236c5-7566-42a0-995d-c7d5716adcf';