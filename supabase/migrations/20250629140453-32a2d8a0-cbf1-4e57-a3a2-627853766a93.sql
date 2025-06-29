
-- Supprimer les politiques en double et problématiques sur la table profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Recréer les politiques profiles sans récursion
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Supprimer et recréer les politiques avec récursion sur repairers
DROP POLICY IF EXISTS "Admins can view all repairers" ON public.repairers;
DROP POLICY IF EXISTS "Admins can update repairers" ON public.repairers;

-- Recréer les politiques repairers en utilisant la fonction get_current_user_role()
CREATE POLICY "Admins can view all repairers" 
  ON public.repairers 
  FOR SELECT 
  TO authenticated
  USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update repairers" 
  ON public.repairers 
  FOR UPDATE 
  TO authenticated
  USING (get_current_user_role() = 'admin');

-- Supprimer et recréer les politiques avec récursion sur repairer_profiles
DROP POLICY IF EXISTS "Admins can manage all repairer profiles" ON public.repairer_profiles;

CREATE POLICY "Admins can manage all repairer profiles" 
  ON public.repairer_profiles 
  FOR ALL 
  TO authenticated
  USING (get_current_user_role() = 'admin');

-- Ajouter une politique pour permettre la lecture publique des profils
CREATE POLICY "Public can view repairer profiles" 
  ON public.repairer_profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Supprimer les politiques potentiellement problématiques sur les autres tables
DROP POLICY IF EXISTS "Edge functions can manage payments" ON public.payments;

-- Recréer une politique plus spécifique pour les paiements
CREATE POLICY "Service role can manage payments" 
  ON public.payments 
  FOR ALL 
  TO service_role
  USING (true);
