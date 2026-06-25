-- ============================================================================
-- MVP D — Migration 8/8 : seed initial de la file SEO
-- ============================================================================
-- 40 combinaisons (villes × catégories) à générer en priorité par le cron.
-- À 5 pages/semaine, ça occupe 8 semaines de contenu. La table peut être
-- ré-alimentée à tout moment côté admin.
--
-- Idempotent : ON CONFLICT DO NOTHING si une migration précédente a déjà
-- inséré ces lignes.
-- ============================================================================

BEGIN;

-- Pour activer ON CONFLICT on a besoin d'une contrainte unique sur
-- (kind, city, model, symptom). Idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seo_page_queue_dedupe'
  ) THEN
    ALTER TABLE public.seo_page_queue
      ADD CONSTRAINT seo_page_queue_dedupe
      UNIQUE (kind, city, model, symptom);
  END IF;
END $$;

INSERT INTO public.seo_page_queue (kind, city, model, symptom, topic, priority)
SELECT 'city', c.city, NULL, NULL,
       'Réparateurs ' || c.city || ' — guide complet', 100
FROM (VALUES
  ('Paris'), ('Lyon'), ('Marseille'), ('Toulouse'), ('Nice'),
  ('Bordeaux'), ('Lille'), ('Nantes'), ('Strasbourg'), ('Montpellier')
) AS c(city)
ON CONFLICT (kind, city, model, symptom) DO NOTHING;

INSERT INTO public.seo_page_queue (kind, city, model, symptom, topic, priority)
SELECT 'symptom', NULL, NULL, s.symptom,
       s.symptom || ' — diagnostic et estimation de prix', 80
FROM (VALUES
  ('lave-linge qui ne vidange plus'),
  ('lave-linge qui fuit'),
  ('lave-vaisselle qui ne lave plus'),
  ('réfrigérateur qui ne refroidit plus'),
  ('four qui ne chauffe plus'),
  ('smartphone écran cassé'),
  ('smartphone batterie qui se décharge vite'),
  ('ordinateur portable qui ne s''allume plus'),
  ('TV plus de son'),
  ('console qui surchauffe')
) AS s(symptom)
ON CONFLICT (kind, city, model, symptom) DO NOTHING;

INSERT INTO public.seo_page_queue (kind, city, model, symptom, topic, priority)
SELECT 'guide', NULL, NULL, NULL, g.topic, 60
FROM (VALUES
  ('Comment choisir un réparateur électroménager fiable'),
  ('Le Bonus Réparation expliqué : montants et démarches'),
  ('Réparer ou remplacer son appareil : comment décider ?'),
  ('Garantie légale de conformité vs garantie commerciale'),
  ('Diagnostiquer une panne avant d''appeler un réparateur'),
  ('QualiRépar : ce que change le label pour le client'),
  ('Prix moyen d''une réparation par appareil en 2026'),
  ('Réparation à domicile vs en atelier : avantages comparés'),
  ('Pièces détachées : neuf, reconditionné, équivalent'),
  ('Que faire en cas de litige avec un réparateur')
) AS g(topic)
ON CONFLICT (kind, city, model, symptom) DO NOTHING;

INSERT INTO public.seo_page_queue (kind, city, model, symptom, topic, priority)
SELECT 'model', NULL, m.model, NULL,
       'Réparation ' || m.model || ' : pannes courantes et tarifs', 70
FROM (VALUES
  ('iPhone 13'), ('iPhone 14'), ('Samsung Galaxy S22'), ('Samsung Galaxy S23'),
  ('MacBook Air M1'), ('MacBook Pro M2'), ('iPad Pro'),
  ('PlayStation 5'), ('Xbox Series X'), ('Nintendo Switch')
) AS m(model)
ON CONFLICT (kind, city, model, symptom) DO NOTHING;

COMMIT;
