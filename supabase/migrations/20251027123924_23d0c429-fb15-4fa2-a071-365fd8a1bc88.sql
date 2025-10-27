-- Phase 1: Ajouter colonnes pour géolocalisation et contenu enrichi
ALTER TABLE public.repairers
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;

-- Phase 2: Ajouter colonnes pour contenu enrichi aux pages SEO
ALTER TABLE public.local_seo_pages
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Mettre à jour la colonne sample_testimonials pour être un JSONB par défaut
ALTER TABLE public.local_seo_pages
ALTER COLUMN sample_testimonials SET DEFAULT '[]'::jsonb;

-- Créer index pour améliorer les performances des requêtes géospatiales
CREATE INDEX IF NOT EXISTS idx_repairers_location 
ON public.repairers(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Créer index pour les recherches par ville
CREATE INDEX IF NOT EXISTS idx_repairers_city_verified 
ON public.repairers(city, is_verified) 
WHERE is_verified = true;

-- Créer index pour les pages SEO publiées
CREATE INDEX IF NOT EXISTS idx_local_seo_pages_published_slug 
ON public.local_seo_pages(slug, is_published) 
WHERE is_published = true;

-- Commenter les colonnes pour documentation
COMMENT ON COLUMN public.repairers.latitude IS 'Latitude géographique du réparateur (géocodage automatique)';
COMMENT ON COLUMN public.repairers.longitude IS 'Longitude géographique du réparateur (géocodage automatique)';
COMMENT ON COLUMN public.repairers.geocoded_at IS 'Date du dernier géocodage automatique';
COMMENT ON COLUMN public.local_seo_pages.services IS 'Liste des services proposés (générés par IA) - format: [{"name": "...", "price": "...", "duration": "..."}]';
COMMENT ON COLUMN public.local_seo_pages.faq IS 'Questions fréquentes (générées par IA) - format: [{"question": "...", "answer": "..."}]';
COMMENT ON COLUMN public.local_seo_pages.hero_image_url IS 'URL de l''image hero (Unsplash ou upload)';
COMMENT ON COLUMN public.local_seo_pages.og_image_url IS 'URL de l''image Open Graph (générée automatiquement)';