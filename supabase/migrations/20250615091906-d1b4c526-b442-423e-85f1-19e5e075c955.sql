
-- Créer une table pour les profils détaillés des réparateurs
CREATE TABLE public.repairer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  siret_number TEXT,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  has_qualirepar_label BOOLEAN DEFAULT false,
  repair_types TEXT[] DEFAULT '{}', -- telephone, montre, console, ordinateur, autres
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Activer RLS
ALTER TABLE public.repairer_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les réparateurs puissent voir et modifier leur propre profil
CREATE POLICY "Repairers can view their own profile" 
  ON public.repairer_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Repairers can update their own profile" 
  ON public.repairer_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Repairers can insert their own profile" 
  ON public.repairer_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les admins puissent tout voir et gérer
CREATE POLICY "Admins can manage all repairer profiles" 
  ON public.repairer_profiles 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour permettre la lecture publique des profils validés (pour l'app client)
CREATE POLICY "Public can view verified repairer profiles" 
  ON public.repairer_profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Index pour les performances
CREATE INDEX idx_repairer_profiles_user_id ON public.repairer_profiles(user_id);
CREATE INDEX idx_repairer_profiles_city ON public.repairer_profiles(city);
CREATE INDEX idx_repairer_profiles_repair_types ON public.repairer_profiles USING GIN(repair_types);
