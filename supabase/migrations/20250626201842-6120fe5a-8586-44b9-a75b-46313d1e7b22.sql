
-- Créer la table pour les préférences de catalogue des réparateurs
CREATE TABLE public.repairer_catalog_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('brand', 'device_model', 'repair_type')),
  entity_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  default_margin_percentage NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(repairer_id, entity_type, entity_id)
);

-- Créer la table pour les paramètres par marque
CREATE TABLE public.repairer_brand_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  default_margin_percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique
  UNIQUE(repairer_id, brand_id)
);

-- Modifier la table repairer_custom_prices pour ajouter le type de prix
ALTER TABLE public.repairer_custom_prices 
ADD COLUMN price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'starting_from')),
ADD COLUMN is_starting_price BOOLEAN DEFAULT false;

-- Ajouter Row Level Security pour les nouvelles tables
ALTER TABLE public.repairer_catalog_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_brand_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour repairer_catalog_preferences
CREATE POLICY "Repairers can view their own catalog preferences" 
  ON public.repairer_catalog_preferences 
  FOR SELECT 
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can create their own catalog preferences" 
  ON public.repairer_catalog_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Repairers can update their own catalog preferences" 
  ON public.repairer_catalog_preferences 
  FOR UPDATE 
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can delete their own catalog preferences" 
  ON public.repairer_catalog_preferences 
  FOR DELETE 
  USING (auth.uid() = repairer_id);

-- Politiques pour repairer_brand_settings
CREATE POLICY "Repairers can view their own brand settings" 
  ON public.repairer_brand_settings 
  FOR SELECT 
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can create their own brand settings" 
  ON public.repairer_brand_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Repairers can update their own brand settings" 
  ON public.repairer_brand_settings 
  FOR UPDATE 
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can delete their own brand settings" 
  ON public.repairer_brand_settings 
  FOR DELETE 
  USING (auth.uid() = repairer_id);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_repairer_catalog_preferences_repairer_id ON public.repairer_catalog_preferences(repairer_id);
CREATE INDEX idx_repairer_catalog_preferences_entity ON public.repairer_catalog_preferences(entity_type, entity_id);
CREATE INDEX idx_repairer_brand_settings_repairer_id ON public.repairer_brand_settings(repairer_id);
CREATE INDEX idx_repairer_brand_settings_brand_id ON public.repairer_brand_settings(brand_id);
