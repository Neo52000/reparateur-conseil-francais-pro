-- Correction des erreurs de sécurité RLS QualiRépar
-- Activation de RLS sur les tables d'authentification sensibles

-- 1. Activer RLS sur qualirepar_auth_credentials
ALTER TABLE public.qualirepar_auth_credentials ENABLE ROW LEVEL SECURITY;

-- 2. Activer RLS sur qualirepar_auth_repairers  
ALTER TABLE public.qualirepar_auth_repairers ENABLE ROW LEVEL SECURITY;

-- 3. Politiques de sécurité pour qualirepar_auth_credentials
-- Cette table contient des identifiants d'authentification sensibles - accès admin uniquement

CREATE POLICY "Admins only can view auth credentials" 
ON public.qualirepar_auth_credentials 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can insert auth credentials" 
ON public.qualirepar_auth_credentials 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can update auth credentials" 
ON public.qualirepar_auth_credentials 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can delete auth credentials" 
ON public.qualirepar_auth_credentials 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- 4. Politiques de sécurité pour qualirepar_auth_repairers
-- Cette table contient les réparateurs autorisés - accès admin uniquement

CREATE POLICY "Admins only can view auth repairers" 
ON public.qualirepar_auth_repairers 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can insert auth repairers" 
ON public.qualirepar_auth_repairers 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can update auth repairers" 
ON public.qualirepar_auth_repairers 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins only can delete auth repairers" 
ON public.qualirepar_auth_repairers 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- 5. Autoriser l'accès aux Edge Functions pour l'authentification V3
-- Les fonctions QualiRépar V3 ont besoin d'accéder à ces tables avec des privilèges service

CREATE POLICY "Service role can access auth credentials for API" 
ON public.qualirepar_auth_credentials 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can access auth repairers for API" 
ON public.qualirepar_auth_repairers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);