-- Créer une politique temporaire très permissive pour permettre l'insertion
DROP POLICY IF EXISTS "Temporary debug policy for suppliers" ON public.suppliers_directory;

CREATE POLICY "Temporary debug policy for suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);