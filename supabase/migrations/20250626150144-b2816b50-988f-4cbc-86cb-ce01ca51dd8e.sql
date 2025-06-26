
-- Créer la table pour les prix personnalisés des réparateurs
CREATE TABLE public.repairer_custom_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repair_price_id UUID NOT NULL REFERENCES public.repair_prices(id) ON DELETE CASCADE,
  custom_price_eur NUMERIC NOT NULL,
  custom_part_price_eur NUMERIC,
  custom_labor_price_eur NUMERIC,
  margin_percentage NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(repairer_id, repair_price_id)
);

-- Ajouter Row Level Security (RLS)
ALTER TABLE public.repairer_custom_prices ENABLE ROW LEVEL SECURITY;

-- Politique pour que les réparateurs puissent voir leurs propres prix
CREATE POLICY "Repairers can view their own custom prices" 
  ON public.repairer_custom_prices 
  FOR SELECT 
  USING (auth.uid() = repairer_id);

-- Politique pour que les réparateurs puissent créer leurs propres prix
CREATE POLICY "Repairers can create their own custom prices" 
  ON public.repairer_custom_prices 
  FOR INSERT 
  WITH CHECK (auth.uid() = repairer_id);

-- Politique pour que les réparateurs puissent modifier leurs propres prix
CREATE POLICY "Repairers can update their own custom prices" 
  ON public.repairer_custom_prices 
  FOR UPDATE 
  USING (auth.uid() = repairer_id);

-- Politique pour que les réparateurs puissent supprimer leurs propres prix
CREATE POLICY "Repairers can delete their own custom prices" 
  ON public.repairer_custom_prices 
  FOR DELETE 
  USING (auth.uid() = repairer_id);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_repairer_custom_prices_repairer_id ON public.repairer_custom_prices(repairer_id);
CREATE INDEX idx_repairer_custom_prices_repair_price_id ON public.repairer_custom_prices(repair_price_id);
