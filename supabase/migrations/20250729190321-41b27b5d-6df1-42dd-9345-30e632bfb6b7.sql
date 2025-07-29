-- Tables pour le générateur de devis intelligent et signatures électroniques

-- Table pour les signatures électroniques
CREATE TABLE public.electronic_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  signature_data_url TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  verification_hash TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les modèles de devis IA
CREATE TABLE public.ai_quote_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  repair_type TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  parts_cost NUMERIC NOT NULL,
  labor_cost NUMERIC NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  success_rate NUMERIC DEFAULT 0.95,
  warranty_days INTEGER DEFAULT 180,
  ai_confidence NUMERIC DEFAULT 0.8,
  usage_count INTEGER DEFAULT 0,
  performance_score NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique d'analyse IA
CREATE TABLE public.ai_quote_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID,
  device_info JSONB NOT NULL,
  ai_reasoning TEXT,
  confidence_score NUMERIC,
  suggested_price NUMERIC,
  alternative_solutions JSONB,
  processing_time_ms INTEGER,
  ai_model TEXT DEFAULT 'mistral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des colonnes aux devis existants pour l'IA
ALTER TABLE public.quotes_with_timeline 
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS client_signature_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parts_cost NUMERIC,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC,
ADD COLUMN IF NOT EXISTS warranty_period_days INTEGER DEFAULT 180;

-- Enable RLS
ALTER TABLE public.electronic_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quote_analyses ENABLE ROW LEVEL SECURITY;

-- Policies pour electronic_signatures
CREATE POLICY "Users can view signatures for their quotes" 
ON public.electronic_signatures 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotes_with_timeline 
    WHERE id = electronic_signatures.quote_id 
    AND (client_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = quotes_with_timeline.repairer_id
    ))
  )
);

CREATE POLICY "Clients can create signatures for their quotes" 
ON public.electronic_signatures 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes_with_timeline 
    WHERE id = electronic_signatures.quote_id 
    AND client_id = auth.uid()
  )
);

-- Policies pour ai_quote_templates
CREATE POLICY "Repairers can manage their AI templates" 
ON public.ai_quote_templates 
FOR ALL 
USING (repairer_id = auth.uid());

-- Policies pour ai_quote_analyses
CREATE POLICY "Users can view analyses for their quotes" 
ON public.ai_quote_analyses 
FOR SELECT 
USING (
  quote_id IS NULL OR EXISTS (
    SELECT 1 FROM public.quotes_with_timeline 
    WHERE id = ai_quote_analyses.quote_id 
    AND (client_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = quotes_with_timeline.repairer_id
    ))
  )
);

CREATE POLICY "System can create analyses" 
ON public.ai_quote_analyses 
FOR INSERT 
WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_electronic_signatures_updated_at
BEFORE UPDATE ON public.electronic_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_quote_templates_updated_at
BEFORE UPDATE ON public.ai_quote_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();