-- Table des catégories de commerces pour la catégorisation intelligente
CREATE TABLE IF NOT EXISTS public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  search_keywords TEXT[] DEFAULT '{}',
  scraping_prompts JSONB DEFAULT '{}',
  color TEXT DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter la catégorie aux réparateurs
ALTER TABLE public.repairers 
ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES public.business_categories(id),
ADD COLUMN IF NOT EXISTS auto_detected_category TEXT,
ADD COLUMN IF NOT EXISTS category_confidence NUMERIC DEFAULT 0;

-- RLS pour business_categories
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
ON public.business_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.business_categories FOR ALL
USING (get_current_user_role() = 'admin');

-- Insérer les catégories principales pour les réparateurs
INSERT INTO public.business_categories (name, description, icon, search_keywords, scraping_prompts, color) VALUES
('Réparation Smartphones', 'Spécialistes de la réparation de téléphones mobiles et smartphones', '📱', 
 ARRAY['réparation smartphone', 'réparation téléphone', 'réparation mobile', 'réparation écran', 'déblocage téléphone'],
 '{"serper": "réparation smartphone {location}", "firecrawl": "spécialiste réparation téléphone mobile", "deepseek": "Analyser si ce commerce répare des smartphones et téléphones mobiles"}',
 '#3b82f6'),
 
('Réparation Tablettes', 'Réparation de tablettes iPad, Android et autres', '📱', 
 ARRAY['réparation tablette', 'réparation ipad', 'réparation samsung tab'],
 '{"serper": "réparation tablette {location}", "firecrawl": "réparation tablette iPad Android", "deepseek": "Analyser si ce commerce répare des tablettes"}',
 '#10b981'),
 
('Réparation Ordinateurs', 'Services de réparation PC, Mac et ordinateurs portables', '💻', 
 ARRAY['réparation ordinateur', 'réparation pc', 'réparation mac', 'dépannage informatique'],
 '{"serper": "réparation ordinateur {location}", "firecrawl": "réparation PC Mac ordinateur portable", "deepseek": "Analyser si ce commerce répare des ordinateurs"}',
 '#f59e0b'),
 
('Magasins Multi-Services', 'Magasins proposant plusieurs services de réparation', '🛠️', 
 ARRAY['réparation multimédia', 'service après-vente', 'réparation électronique'],
 '{"serper": "réparation électronique {location}", "firecrawl": "magasin réparation multimédia électronique", "deepseek": "Analyser si ce commerce propose plusieurs services de réparation électronique"}',
 '#8b5cf6'),
 
('Accessoires et Pièces', 'Vente d''accessoires et pièces détachées', '🔧', 
 ARRAY['accessoires téléphone', 'pièces détachées', 'coques protection'],
 '{"serper": "accessoires téléphone {location}", "firecrawl": "vente accessoires pièces détachées mobile", "deepseek": "Analyser si ce commerce vend des accessoires ou pièces détachées pour mobiles"}',
 '#ef4444');

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_business_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_categories_updated_at_trigger
  BEFORE UPDATE ON public.business_categories
  FOR EACH ROW EXECUTE FUNCTION update_business_categories_updated_at();