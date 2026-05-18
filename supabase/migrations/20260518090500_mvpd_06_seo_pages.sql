-- ============================================================================
-- MVP D — Migration 6/7 : seo_pages (long-form pages générées par Claude Sonnet)
-- ============================================================================
-- Table greenfield, n'altère pas repairer_seo_pages ni seo_programmatic_pages
-- (qui servent les routes existantes /reparation/:model/:city, etc.).
--
-- Une page = (kind, city?, model?, symptom?) ; slug stable et unique.
-- Lecture publique pour le SSR/SPA ; écriture admin uniquement.
-- ============================================================================

BEGIN;

CREATE TABLE public.seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('guide', 'city', 'model', 'symptom')),
  city text,
  model text,
  symptom text,
  title text NOT NULL,
  meta_description text NOT NULL,
  h1 text NOT NULL,
  body_md text NOT NULL,
  generated_by text NOT NULL DEFAULT 'claude-sonnet',
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT true
);

CREATE INDEX seo_pages_kind_idx ON public.seo_pages(kind, published);
CREATE INDEX seo_pages_city_idx ON public.seo_pages(city) WHERE city IS NOT NULL;

-- File d'attente des combinaisons à générer.
CREATE TABLE public.seo_page_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('guide', 'city', 'model', 'symptom')),
  city text,
  model text,
  symptom text,
  topic text,
  priority integer NOT NULL DEFAULT 0,
  processed_at timestamptz,
  failed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX seo_page_queue_pending_idx
  ON public.seo_page_queue(priority DESC, created_at)
  WHERE processed_at IS NULL AND failed_at IS NULL;

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_pages_public_read_published"
  ON public.seo_pages FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "seo_pages_admin_all"
  ON public.seo_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "seo_page_queue_admin_all"
  ON public.seo_page_queue FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;
