-- Corriger les politiques RLS pour la table suppliers_directory
-- Permettre aux admins de gérer tous les fournisseurs

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Admins can manage all suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Paid repairers can view active suppliers" ON public.suppliers_directory;
DROP POLICY IF EXISTS "Premium repairers can view active suppliers" ON public.suppliers_directory;

-- Créer les nouvelles politiques plus permissives
-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage all suppliers" 
ON public.suppliers_directory 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin'::text)
WITH CHECK (get_current_user_role() = 'admin'::text);

-- Tous les utilisateurs authentifiés peuvent voir les fournisseurs actifs
CREATE POLICY "Authenticated users can view active suppliers" 
ON public.suppliers_directory 
FOR SELECT 
TO authenticated
USING (status = 'active'::text);

-- Les utilisateurs peuvent voir tous les fournisseurs (pour les tests/démo)
CREATE POLICY "Public can view suppliers for testing" 
ON public.suppliers_directory 
FOR SELECT 
TO public
USING (true);