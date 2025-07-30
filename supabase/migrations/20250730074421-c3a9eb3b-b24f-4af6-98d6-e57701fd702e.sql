-- Ajouter une table pour suivre les demandes de devis avec délai 24h
CREATE TABLE IF NOT EXISTS public.quote_response_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  repairer_id UUID NOT NULL,
  client_id UUID NOT NULL,
  has_predefined_pricing BOOLEAN NOT NULL DEFAULT false,
  deadline_24h TIMESTAMP WITH TIME ZONE NOT NULL,
  response_status TEXT NOT NULL DEFAULT 'pending' CHECK (response_status IN ('pending', 'responded', 'expired')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter des colonnes à la table quotes_with_timeline pour le pricing intelligent
ALTER TABLE public.quotes_with_timeline 
ADD COLUMN IF NOT EXISTS has_predefined_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'manual' CHECK (pricing_type IN ('manual', 'predefined', 'express'));

-- Activer RLS sur la nouvelle table
ALTER TABLE public.quote_response_tracking ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour quote_response_tracking
CREATE POLICY "Clients can view their quote tracking" 
ON public.quote_response_tracking 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Repairers can view and update their quote tracking" 
ON public.quote_response_tracking 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.repairer_profiles 
    WHERE user_id = auth.uid() AND id = quote_response_tracking.repairer_id
  )
);

CREATE POLICY "System can create tracking records" 
ON public.quote_response_tracking 
FOR INSERT 
WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_quote_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_tracking_updated_at
  BEFORE UPDATE ON public.quote_response_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_tracking_updated_at();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_quote_tracking_deadline ON public.quote_response_tracking(deadline_24h);
CREATE INDEX IF NOT EXISTS idx_quote_tracking_repairer ON public.quote_response_tracking(repairer_id);
CREATE INDEX IF NOT EXISTS idx_quote_tracking_status ON public.quote_response_tracking(response_status);