-- =============================================
-- PHASE 1: Système de niveaux réparateurs V3 COMPLET
-- =============================================

-- 1. Extension table repairer_profiles avec niveaux
ALTER TABLE repairer_profiles 
ADD COLUMN IF NOT EXISTS repairer_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_percent INTEGER DEFAULT 0;

-- Ajouter contrainte CHECK séparément pour éviter erreur si existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'repairer_profiles_repairer_level_check'
  ) THEN
    ALTER TABLE repairer_profiles ADD CONSTRAINT repairer_profiles_repairer_level_check CHECK (repairer_level BETWEEN 0 AND 3);
  END IF;
END $$;

-- 2. Table zones d'exclusivité (Niveau 3)
CREATE TABLE IF NOT EXISTS exclusivity_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL,
  city_name TEXT NOT NULL,
  postal_codes TEXT[] NOT NULL DEFAULT '{}',
  radius_km INTEGER DEFAULT 10,
  repairer_id UUID REFERENCES repairer_profiles(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  monthly_price DECIMAL(10,2) DEFAULT 299.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ajouter colonne FK si pas existe
ALTER TABLE repairer_profiles 
ADD COLUMN IF NOT EXISTS exclusivity_zone_id UUID;

-- Ajouter la foreign key
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'repairer_profiles_exclusivity_zone_id_fkey'
  ) THEN
    ALTER TABLE repairer_profiles 
    ADD CONSTRAINT repairer_profiles_exclusivity_zone_id_fkey 
    FOREIGN KEY (exclusivity_zone_id) REFERENCES exclusivity_zones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Table pages SEO programmatiques
CREATE TABLE IF NOT EXISTS seo_programmatic_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  h1_title TEXT,
  meta_description TEXT,
  content JSONB DEFAULT '{}',
  schema_org JSONB DEFAULT '{}',
  internal_links TEXT[] DEFAULT '{}',
  repairers_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  is_indexed BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Table logs recherche IA
CREATE TABLE IF NOT EXISTS ai_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_query TEXT NOT NULL,
  parsed_intent JSONB DEFAULT '{}',
  matched_repairers UUID[] DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  fallback_used BOOLEAN DEFAULT false,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_repairer_profiles_level ON repairer_profiles(repairer_level);
CREATE INDEX IF NOT EXISTS idx_repairer_profiles_seo_score ON repairer_profiles(seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_exclusivity_zones_city ON exclusivity_zones(city_slug);
CREATE INDEX IF NOT EXISTS idx_exclusivity_zones_active ON exclusivity_zones(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON seo_programmatic_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_programmatic_pages(slug);
CREATE INDEX IF NOT EXISTS idx_ai_search_created ON ai_search_queries(created_at DESC);

-- 7. RLS pour exclusivity_zones
ALTER TABLE exclusivity_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Zones visibles par tous en lecture" ON exclusivity_zones;
CREATE POLICY "Zones visibles par tous en lecture"
ON exclusivity_zones FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Zones modifiables par admin" ON exclusivity_zones;
CREATE POLICY "Zones modifiables par admin"
ON exclusivity_zones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
    AND user_roles.is_active = true
  )
);

-- 8. RLS pour seo_programmatic_pages
ALTER TABLE seo_programmatic_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pages SEO visibles par tous" ON seo_programmatic_pages;
CREATE POLICY "Pages SEO visibles par tous"
ON seo_programmatic_pages FOR SELECT
USING (is_published = true OR EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'super_admin')
  AND user_roles.is_active = true
));

DROP POLICY IF EXISTS "Pages SEO modifiables par admin" ON seo_programmatic_pages;
CREATE POLICY "Pages SEO modifiables par admin"
ON seo_programmatic_pages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
    AND user_roles.is_active = true
  )
);

-- 9. RLS pour ai_search_queries
ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Logs recherche visibles par admin" ON ai_search_queries;
CREATE POLICY "Logs recherche visibles par admin"
ON ai_search_queries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
    AND user_roles.is_active = true
  )
);

DROP POLICY IF EXISTS "Insertion logs recherche par tous" ON ai_search_queries;
CREATE POLICY "Insertion logs recherche par tous"
ON ai_search_queries FOR INSERT
WITH CHECK (true);

-- 10. Fonction calcul score SEO
CREATE OR REPLACE FUNCTION calculate_seo_score(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM repairer_profiles WHERE id = profile_id;
  
  IF profile IS NULL THEN RETURN 0; END IF;
  
  -- Points de base selon niveau
  score := COALESCE(profile.repairer_level, 0) * 20;
  
  -- Complétude profil
  IF profile.description IS NOT NULL AND length(profile.description) > 100 THEN score := score + 10; END IF;
  IF profile.phone IS NOT NULL THEN score := score + 5; END IF;
  IF profile.email IS NOT NULL THEN score := score + 5; END IF;
  IF profile.website IS NOT NULL THEN score := score + 5; END IF;
  IF profile.logo_url IS NOT NULL THEN score := score + 10; END IF;
  IF profile.siret IS NOT NULL THEN score := score + 10; END IF;
  
  -- Services et spécialités
  IF array_length(profile.services, 1) > 3 THEN score := score + 10; END IF;
  IF array_length(profile.specialties, 1) > 2 THEN score := score + 5; END IF;
  
  -- Horaires
  IF profile.opening_hours IS NOT NULL THEN score := score + 10; END IF;
  
  -- Vérifications
  IF profile.is_verified THEN score := score + 15; END IF;
  IF profile.has_qualirepar_label THEN score := score + 10; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction calcul complétion profil
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 15;
  filled_fields INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM repairer_profiles WHERE id = profile_id;
  
  IF profile IS NULL THEN RETURN 0; END IF;
  
  IF profile.business_name IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.description IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.phone IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.email IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.website IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.address IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.city IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.postal_code IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.logo_url IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.siret IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.opening_hours IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF array_length(profile.services, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF array_length(profile.specialties, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile.lat IS NOT NULL AND profile.lng IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile.is_verified THEN filled_fields := filled_fields + 1; END IF;
  
  RETURN (filled_fields * 100) / total_fields;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;