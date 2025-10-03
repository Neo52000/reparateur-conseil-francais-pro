-- Table pour gérer les pages de services statiques
CREATE TABLE IF NOT EXISTS public.static_service_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_text TEXT,
  cta_link TEXT,
  is_published BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  generation_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.static_service_pages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view published service pages"
  ON public.static_service_pages
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage service pages"
  ON public.static_service_pages
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE TRIGGER update_static_service_pages_updated_at
  BEFORE UPDATE ON public.static_service_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_static_service_pages_slug ON public.static_service_pages(slug);
CREATE INDEX idx_static_service_pages_published ON public.static_service_pages(is_published);

-- Insert des pages par défaut
INSERT INTO public.static_service_pages (slug, title, meta_description, hero_title, hero_subtitle, content, is_published) VALUES
('reparation-smartphone', 'Réparation Smartphone', 'Service professionnel de réparation de smartphones. Intervention rapide et garantie.', 'Réparation Smartphone', 'Intervention rapide par des professionnels certifiés', '[]'::jsonb, true),
('reparation-tablette', 'Réparation Tablette', 'Réparation de tablettes toutes marques. Service rapide et garanti.', 'Réparation Tablette', 'Experts en réparation de tablettes', '[]'::jsonb, true),
('reparation-ordinateur', 'Réparation Ordinateur', 'Réparation d''ordinateurs portables et fixes. Diagnostic gratuit.', 'Réparation Ordinateur', 'Dépannage et réparation PC & Mac', '[]'::jsonb, true),
('reparation-console', 'Réparation Console', 'Réparation de consoles de jeux toutes générations. Expertise garantie.', 'Réparation Console', 'Spécialistes des consoles de jeux', '[]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;