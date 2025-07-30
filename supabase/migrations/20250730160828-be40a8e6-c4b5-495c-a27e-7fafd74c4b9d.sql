-- Création des tables pour les validations métier V3

-- Table des codes IRIS (codes de réparation standardisés)
CREATE TABLE IF NOT EXISTS public.qualirepar_iris_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  repair_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des réparateurs autorisés QualiRépar
CREATE TABLE IF NOT EXISTS public.qualirepar_auth_repairers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  siret TEXT,
  certification_number TEXT,
  certification_date DATE,
  certification_expiry DATE,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'FR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table du catalogue produits QualiRépar
CREATE TABLE IF NOT EXISTS public.qualirepar_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  model_reference TEXT,
  supported_repair_types JSONB DEFAULT '[]'::jsonb,
  max_bonus_amount NUMERIC(10,2),
  eco_organism TEXT DEFAULT 'ecosystem',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, brand_id)
);

-- Table des règles de validation métier
CREATE TABLE IF NOT EXISTS public.qualirepar_business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL, -- 'validation', 'eligibility', 'calculation'
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_qualirepar_iris_codes_code ON public.qualirepar_iris_codes(code);
CREATE INDEX IF NOT EXISTS idx_qualirepar_iris_codes_active ON public.qualirepar_iris_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_qualirepar_auth_repairers_id ON public.qualirepar_auth_repairers(repairer_id);
CREATE INDEX IF NOT EXISTS idx_qualirepar_auth_repairers_active ON public.qualirepar_auth_repairers(is_active);
CREATE INDEX IF NOT EXISTS idx_qualirepar_auth_repairers_siret ON public.qualirepar_auth_repairers(siret);

CREATE INDEX IF NOT EXISTS idx_qualirepar_catalog_product ON public.qualirepar_catalog(product_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_qualirepar_catalog_active ON public.qualirepar_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_qualirepar_catalog_category ON public.qualirepar_catalog(category);

CREATE INDEX IF NOT EXISTS idx_qualirepar_business_rules_type ON public.qualirepar_business_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_qualirepar_business_rules_active ON public.qualirepar_business_rules(is_active);

-- Triggers pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_qualirepar_validation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qualirepar_iris_codes_updated_at
  BEFORE UPDATE ON public.qualirepar_iris_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_qualirepar_validation_updated_at();

CREATE TRIGGER update_qualirepar_auth_repairers_updated_at
  BEFORE UPDATE ON public.qualirepar_auth_repairers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_qualirepar_validation_updated_at();

CREATE TRIGGER update_qualirepar_catalog_updated_at
  BEFORE UPDATE ON public.qualirepar_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_qualirepar_validation_updated_at();

CREATE TRIGGER update_qualirepar_business_rules_updated_at
  BEFORE UPDATE ON public.qualirepar_business_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_qualirepar_validation_updated_at();

-- RLS Policies
ALTER TABLE public.qualirepar_iris_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_auth_repairers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_business_rules ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les codes IRIS (nécessaire pour validation)
CREATE POLICY "Allow public read access to IRIS codes" ON public.qualirepar_iris_codes
  FOR SELECT USING (is_active = true);

-- Gestion admin seulement pour les modifications
CREATE POLICY "Admin manage IRIS codes" ON public.qualirepar_iris_codes
  FOR ALL USING (get_current_user_role() = 'admin');

-- Lecture publique pour les réparateurs autorisés
CREATE POLICY "Allow public read access to authorized repairers" ON public.qualirepar_auth_repairers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage authorized repairers" ON public.qualirepar_auth_repairers
  FOR ALL USING (get_current_user_role() = 'admin');

-- Lecture publique pour le catalogue
CREATE POLICY "Allow public read access to catalog" ON public.qualirepar_catalog
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage catalog" ON public.qualirepar_catalog
  FOR ALL USING (get_current_user_role() = 'admin');

-- Gestion admin pour les règles métier
CREATE POLICY "Admin manage business rules" ON public.qualirepar_business_rules
  FOR ALL USING (get_current_user_role() = 'admin');

-- Insertion de données de base pour les codes IRIS
INSERT INTO public.qualirepar_iris_codes (code, description, category, repair_type) VALUES
('1001', 'Remplacement écran smartphone', 'smartphone', 'display_replacement'),
('1002', 'Remplacement batterie smartphone', 'smartphone', 'battery_replacement'),
('1003', 'Réparation connecteur charge smartphone', 'smartphone', 'charging_port_repair'),
('1004', 'Remplacement haut-parleur smartphone', 'smartphone', 'speaker_replacement'),
('1005', 'Réparation bouton home smartphone', 'smartphone', 'button_repair'),
('2001', 'Remplacement écran tablette', 'tablet', 'display_replacement'),
('2002', 'Remplacement batterie tablette', 'tablet', 'battery_replacement'),
('3001', 'Remplacement écran ordinateur portable', 'laptop', 'display_replacement'),
('3002', 'Remplacement batterie ordinateur portable', 'laptop', 'battery_replacement'),
('3003', 'Réparation clavier ordinateur portable', 'laptop', 'keyboard_repair')
ON CONFLICT (code) DO NOTHING;