-- Supprimer les politiques existantes et créer une temporaire basée sur l'email
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Temporary debug policy for suppliers" ON public.suppliers_directory;

-- Créer une politique temporaire basée sur l'email JWT
CREATE POLICY "Admin email can manage suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email') = 'reine.elie@gmail.com'
) 
WITH CHECK (
  (auth.jwt() ->> 'email') = 'reine.elie@gmail.com'
);