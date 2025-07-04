-- Extension de la table repairers pour les améliorations automatiques
ALTER TABLE public.repairers 
ADD COLUMN IF NOT EXISTS unique_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS deepseek_classification JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deepseek_confidence NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS mistral_enhanced BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mistral_enhancement_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS geocoding_accuracy TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS geocoding_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS enhanced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enhancement_status TEXT DEFAULT 'pending' CHECK (enhancement_status IN ('pending', 'processing', 'completed', 'failed'));

-- Table pour l'historique des améliorations IA
CREATE TABLE IF NOT EXISTS public.ai_enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES public.repairers(id) ON DELETE CASCADE,
  enhancement_type TEXT NOT NULL CHECK (enhancement_type IN ('deepseek_classification', 'mistral_enhancement', 'geocoding', 'data_cleaning')),
  ai_model TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Table pour l'historique de géocodage
CREATE TABLE IF NOT EXISTS public.geocoding_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES public.repairers(id) ON DELETE CASCADE,
  original_address TEXT NOT NULL,
  normalized_address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  accuracy TEXT,
  geocoding_service TEXT DEFAULT 'nominatim',
  response_data JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les métriques de qualité des données
CREATE TABLE IF NOT EXISTS public.data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES public.repairers(id) ON DELETE CASCADE,
  completeness_score NUMERIC DEFAULT 0,
  accuracy_score NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  issues_detected JSONB DEFAULT '[]',
  improvements_suggested JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configuration des améliorations de scraping
CREATE TABLE IF NOT EXISTS public.scraping_enhancement_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID
);

-- Fonction pour générer des IDs uniques avec préfixe
CREATE OR REPLACE FUNCTION public.generate_unique_id(prefix TEXT DEFAULT 'REP')
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    new_id := prefix || '_' || LPAD(counter::TEXT, 6, '0') || '_' || EXTRACT(EPOCH FROM now())::INTEGER;
    
    -- Vérifier l'unicité dans la table repairers
    IF NOT EXISTS (SELECT 1 FROM public.repairers WHERE unique_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
    
    -- Éviter une boucle infinie
    IF counter > max_attempts THEN
      new_id := prefix || '_' || gen_random_uuid()::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le score de qualité des données
CREATE OR REPLACE FUNCTION public.calculate_data_quality_score(repairer_record public.repairers)
RETURNS NUMERIC AS $$
DECLARE
  completeness_score NUMERIC := 0;
  accuracy_score NUMERIC := 0;
  consistency_score NUMERIC := 0;
  total_score NUMERIC := 0;
BEGIN
  -- Score de complétude (40% du score total)
  completeness_score := (
    CASE WHEN repairer_record.name IS NOT NULL AND length(trim(repairer_record.name)) > 0 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.address IS NOT NULL AND length(trim(repairer_record.address)) > 0 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.phone IS NOT NULL AND length(trim(repairer_record.phone)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.email IS NOT NULL AND length(trim(repairer_record.email)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.website IS NOT NULL AND length(trim(repairer_record.website)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.description IS NOT NULL AND length(trim(repairer_record.description)) > 0 THEN 5 ELSE 0 END
  );
  
  -- Score de précision (40% du score total)
  accuracy_score := (
    CASE WHEN repairer_record.lat IS NOT NULL AND repairer_record.lng IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN repairer_record.postal_code IS NOT NULL AND repairer_record.postal_code ~ '^[0-9]{5}$' THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.phone IS NOT NULL AND length(replace(replace(replace(repairer_record.phone, ' ', ''), '.', ''), '-', '')) >= 10 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.email IS NOT NULL AND repairer_record.email ~ '^[^@]+@[^@]+\.[^@]+$' THEN 5 ELSE 0 END
  );
  
  -- Score de cohérence (20% du score total)
  consistency_score := (
    CASE WHEN repairer_record.deepseek_confidence > 0.7 THEN 10 ELSE 5 END +
    CASE WHEN repairer_record.is_verified = TRUE THEN 10 ELSE 0 END
  );
  
  total_score := completeness_score + accuracy_score + consistency_score;
  
  RETURN LEAST(100, total_score);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un unique_id
CREATE OR REPLACE FUNCTION public.auto_generate_unique_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_unique_id('REP');
  END IF;
  
  -- Calculer automatiquement le score de qualité
  NEW.data_quality_score := calculate_data_quality_score(NEW);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur la table repairers
DROP TRIGGER IF EXISTS trigger_auto_generate_unique_id ON public.repairers;
CREATE TRIGGER trigger_auto_generate_unique_id
  BEFORE INSERT OR UPDATE ON public.repairers
  FOR EACH ROW EXECUTE FUNCTION auto_generate_unique_id();

-- RLS policies pour les nouvelles tables
ALTER TABLE public.ai_enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geocoding_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_enhancement_config ENABLE ROW LEVEL SECURITY;

-- Policies pour ai_enhancements
CREATE POLICY "Admins can manage AI enhancements" 
ON public.ai_enhancements FOR ALL 
USING (get_current_user_role() = 'admin');

-- Policies pour geocoding_history
CREATE POLICY "Admins can manage geocoding history" 
ON public.geocoding_history FOR ALL 
USING (get_current_user_role() = 'admin');

-- Policies pour data_quality_metrics
CREATE POLICY "Admins can manage data quality metrics" 
ON public.data_quality_metrics FOR ALL 
USING (get_current_user_role() = 'admin');

-- Policies pour scraping_enhancement_config
CREATE POLICY "Admins can manage scraping enhancement config" 
ON public.scraping_enhancement_config FOR ALL 
USING (get_current_user_role() = 'admin');

-- Configuration par défaut
INSERT INTO public.scraping_enhancement_config (config_key, config_value) VALUES
('deepseek_enabled', '{"enabled": true, "confidence_threshold": 0.7, "auto_validate": true}'),
('mistral_enabled', '{"enabled": true, "enhance_descriptions": true, "standardize_services": true}'),
('geocoding_enabled', '{"enabled": true, "service": "nominatim", "fallback_city_coords": true}'),
('data_cleaning_enabled', '{"enabled": true, "fix_encoding": true, "standardize_formats": true}'),
('unique_id_config', '{"prefix": "REP", "auto_generate": true, "format": "PREFIX_NNNNNN_TIMESTAMP"}')
ON CONFLICT (config_key) DO NOTHING;