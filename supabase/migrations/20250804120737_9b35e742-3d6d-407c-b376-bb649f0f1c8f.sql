-- Temporairement, ajouter une politique plus permissive pour diagnostiquer
CREATE POLICY "Temporary debug policy for suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Également s'assurer que votre profil utilisateur existe avec le bon rôle
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  auth.uid(),
  (auth.jwt() -> 'email')::text,
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'first_name'), 'Admin'),
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'last_name'), 'User'),
  'admin'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = now();
  
-- Créer une entrée dans user_roles pour vous donner le rôle admin
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES (auth.uid(), 'admin', true)
ON CONFLICT (user_id, role) DO UPDATE SET 
  is_active = true,
  assigned_at = now();