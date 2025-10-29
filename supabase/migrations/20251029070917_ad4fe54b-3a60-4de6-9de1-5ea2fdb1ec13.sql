-- Créer la table pour les pages SEO des réparateurs individuels
CREATE TABLE IF NOT EXISTS public.repairer_seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL REFERENCES public.repairers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  url_path TEXT NOT NULL UNIQUE, -- /ville/nom-reparateur
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  intro_paragraph TEXT NOT NULL,
  services_description TEXT NOT NULL,
  why_choose_us TEXT NOT NULL,
  structured_data JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  page_views INTEGER NOT NULL DEFAULT 0,
  last_generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sitemap_submitted_at TIMESTAMP WITH TIME ZONE,
  google_indexed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_repairer_seo_pages_repairer_id ON public.repairer_seo_pages(repairer_id);
CREATE INDEX IF NOT EXISTS idx_repairer_seo_pages_slug ON public.repairer_seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_repairer_seo_pages_published ON public.repairer_seo_pages(is_published);

-- Enable RLS
ALTER TABLE public.repairer_seo_pages ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les pages publiées
CREATE POLICY "Pages SEO publiées visibles par tous"
ON public.repairer_seo_pages
FOR SELECT
USING (is_published = true);

-- Politique: Les réparateurs peuvent voir leur propre page (via repairer_profiles)
CREATE POLICY "Réparateurs peuvent voir leur page SEO"
ON public.repairer_seo_pages
FOR SELECT
USING (
  repairer_id IN (
    SELECT repairer_id FROM public.repairer_profiles WHERE user_id = auth.uid()
  )
);

-- Politique: Les admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer toutes les pages SEO"
ON public.repairer_seo_pages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.update_repairer_seo_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour la mise à jour automatique
CREATE TRIGGER update_repairer_seo_pages_updated_at
BEFORE UPDATE ON public.repairer_seo_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_repairer_seo_page_updated_at();