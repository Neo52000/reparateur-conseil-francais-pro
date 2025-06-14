
-- Créer une table pour stocker les logs de scraping
CREATE TABLE public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'pages_jaunes', 'google_places', etc.
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  items_scraped INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une table pour stocker les réparateurs scrapés
CREATE TABLE public.repairers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  department TEXT,
  region TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  lat NUMERIC,
  lng NUMERIC,
  rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  services TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  price_range TEXT CHECK (price_range IN ('low', 'medium', 'high')),
  response_time TEXT,
  opening_hours JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_open BOOLEAN,
  source TEXT NOT NULL, -- 'pages_jaunes', 'google_places', 'manual'
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, address, city) -- Éviter les doublons
);

-- Activer RLS sur les tables
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de tout voir et gérer
CREATE POLICY "Admins can manage scraping logs" 
  ON public.scraping_logs 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage repairers" 
  ON public.repairers 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour permettre la lecture publique des réparateurs (pour l'app client)
CREATE POLICY "Public can view repairers" 
  ON public.repairers 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Index pour les performances
CREATE INDEX idx_repairers_city ON public.repairers(city);
CREATE INDEX idx_repairers_department ON public.repairers(department);
CREATE INDEX idx_repairers_source ON public.repairers(source);
CREATE INDEX idx_repairers_is_open ON public.repairers(is_open);
CREATE INDEX idx_scraping_logs_status ON public.scraping_logs(status);
CREATE INDEX idx_scraping_logs_source ON public.scraping_logs(source);
