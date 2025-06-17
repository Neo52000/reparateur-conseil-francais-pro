
-- Créer une table pour stocker les entreprises fermées/radiées
CREATE TABLE public.closed_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siret TEXT,
  siren TEXT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  status TEXT NOT NULL, -- 'radiée', 'liquidation', 'cessation', etc.
  closure_date DATE,
  verification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pappers_data JSONB, -- Stockage des données complètes de Pappers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table de cache pour éviter les requêtes répétées à Pappers
CREATE TABLE public.pappers_verification_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  siret TEXT UNIQUE NOT NULL,
  siren TEXT,
  is_active BOOLEAN NOT NULL,
  business_status TEXT,
  pappers_data JSONB,
  last_verified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des colonnes à la table repairers pour stocker les infos de vérification
ALTER TABLE public.repairers 
ADD COLUMN siret TEXT,
ADD COLUMN siren TEXT,
ADD COLUMN pappers_verified BOOLEAN DEFAULT false,
ADD COLUMN pappers_last_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN business_status TEXT;

-- Ajouter des colonnes à la table scraping_logs pour les statistiques Pappers
ALTER TABLE public.scraping_logs
ADD COLUMN items_pappers_verified INTEGER DEFAULT 0,
ADD COLUMN items_pappers_rejected INTEGER DEFAULT 0,
ADD COLUMN pappers_api_calls INTEGER DEFAULT 0;

-- Index pour les performances
CREATE INDEX idx_closed_businesses_siret ON public.closed_businesses(siret);
CREATE INDEX idx_closed_businesses_siren ON public.closed_businesses(siren);
CREATE INDEX idx_pappers_cache_siret ON public.pappers_verification_cache(siret);
CREATE INDEX idx_pappers_cache_last_verified ON public.pappers_verification_cache(last_verified);
CREATE INDEX idx_repairers_siret ON public.repairers(siret);
CREATE INDEX idx_repairers_pappers_verified ON public.repairers(pappers_verified);

-- Activer RLS
ALTER TABLE public.closed_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pappers_verification_cache ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les admins
CREATE POLICY "Admins can manage closed businesses" 
  ON public.closed_businesses 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage pappers cache" 
  ON public.pappers_verification_cache 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
