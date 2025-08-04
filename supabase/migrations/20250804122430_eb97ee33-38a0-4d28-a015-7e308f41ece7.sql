-- Mettre à jour le rôle de l'utilisateur existant
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'reine.elie@gmail.com';

-- Vérifier les politiques de sécurité existantes et nettoyer
DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Temporary debug policy for suppliers" ON public.suppliers_directory;

-- Recréer la politique admin correcte
CREATE POLICY "Admins can manage suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');