-- Phase 1: Infrastructure de données pour le module SEO Local

-- Table des templates de contenu SEO
CREATE TABLE public.local_seo_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'smartphone', 'tablette', 'ordinateur', etc.
  content_template TEXT NOT NULL,
  title_template TEXT NOT NULL,
  meta_description_template TEXT NOT NULL,
  h1_template TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Obtenez un devis gratuitement',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des pages SEO locales générées
CREATE TABLE public.local_seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  content_paragraph_1 TEXT NOT NULL,
  content_paragraph_2 TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  map_embed_url TEXT,
  repairer_count INTEGER DEFAULT 0,
  average_rating NUMERIC(2,1) DEFAULT 0,
  sample_testimonials JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  seo_score INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  click_through_rate NUMERIC(5,2) DEFAULT 0,
  generated_by_ai BOOLEAN DEFAULT true,
  ai_model TEXT DEFAULT 'mistral',
  generation_prompt TEXT,
  last_updated_content TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des métriques de performance SEO
CREATE TABLE public.local_seo_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.local_seo_pages(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  average_position NUMERIC(4,1) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  time_on_page INTEGER DEFAULT 0, -- en secondes
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, date)
);

-- Templates par défaut pour les services principaux
INSERT INTO public.local_seo_templates (name, service_type, content_template, title_template, meta_description_template, h1_template) VALUES
('Réparation Smartphone', 'smartphone', 
'Vous cherchez un spécialiste de la réparation de smartphone à {city} ? Notre plateforme vous met en relation avec {repairer_count} réparateurs qualifiés dans votre ville. Que ce soit pour un écran cassé, une batterie défaillante ou un problème logiciel, nos experts certifiés interviennent rapidement avec des pièces de qualité.

Les habitants de {city} nous font confiance pour leurs réparations mobiles. Nos réparateurs partenaires offrent des garanties sur leurs interventions et utilisent exclusivement des composants certifiés. Avec une note moyenne de {average_rating}/5, ils représentent l''excellence de la réparation smartphone dans la région.',
'Réparation Smartphone {city} - Réparateurs Certifiés Près de Chez Vous',
'Réparation smartphone à {city} ⚡ {repairer_count} experts certifiés ✓ Devis gratuit ✓ Intervention rapide ✓ Garantie incluse',
'Réparation Smartphone à {city}'),

('Réparation Tablette', 'tablette',
'Besoin de réparer votre tablette à {city} ? Faites confiance à nos {repairer_count} réparateurs spécialisés dans la remise en état des tablettes tactiles. iPad, Samsung Galaxy Tab, ou autres marques, nos techniciens maîtrisent toutes les réparations : écran tactile, connecteur de charge, haut-parleurs, et bien plus.

À {city}, nos partenaires réparateurs sont reconnus pour leur expertise technique et leur service client irréprochable. Avec une satisfaction client de {average_rating}/5, ils garantissent des réparations durables et vous accompagnent dans l''entretien de vos appareils numériques.',
'Réparation Tablette {city} - Service Rapide et Garanti',
'Réparation tablette {city} ⚡ Experts certifiés ✓ Toutes marques ✓ Devis immédiat ✓ Garantie {average_rating}/5',
'Réparation Tablette à {city}');

-- Fonction pour générer automatiquement une page SEO lors de l'ajout d'un réparateur dans une nouvelle ville
CREATE OR REPLACE FUNCTION public.auto_generate_seo_page()
RETURNS TRIGGER AS $$
DECLARE
  city_name TEXT;
  city_slug_name TEXT;
  existing_page_count INTEGER;
BEGIN
  -- Récupérer la ville du réparateur ajouté
  city_name := NEW.city;
  city_slug_name := lower(regexp_replace(unaccent(city_name), '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Vérifier si une page existe déjà pour cette ville
  SELECT COUNT(*) INTO existing_page_count 
  FROM public.local_seo_pages 
  WHERE city_slug = city_slug_name AND service_type = 'smartphone';
  
  -- Si aucune page n'existe, créer une page SEO automatiquement
  IF existing_page_count = 0 THEN
    INSERT INTO public.local_seo_pages (
      slug, city, city_slug, service_type, title, meta_description, h1_title,
      content_paragraph_1, content_paragraph_2, cta_text, repairer_count
    )
    SELECT 
      'reparateur-smartphone-' || city_slug_name,
      city_name,
      city_slug_name,
      'smartphone',
      replace(title_template, '{city}', city_name),
      replace(replace(meta_description_template, '{city}', city_name), '{repairer_count}', '1'),
      replace(h1_template, '{city}', city_name),
      replace(replace(replace(content_template, '{city}', city_name), '{repairer_count}', '1'), '{average_rating}', '4.8'),
      'Notre réseau s''étend dans toute la région et nous sommes fiers de servir les habitants de ' || city_name || ' avec un service de proximité et des tarifs transparents.',
      'Obtenez un devis gratuitement',
      1
    FROM public.local_seo_templates 
    WHERE service_type = 'smartphone' AND is_active = true 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-génération des pages SEO
CREATE TRIGGER auto_generate_seo_on_new_city
  AFTER INSERT ON public.repairers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_seo_page();

-- Fonction pour mettre à jour les statistiques des pages SEO
CREATE OR REPLACE FUNCTION public.update_seo_page_stats()
RETURNS TRIGGER AS $$
DECLARE
  page_record RECORD;
  repairer_count_val INTEGER;
  avg_rating_val NUMERIC;
BEGIN
  -- Mettre à jour les stats pour toutes les pages de la ville
  FOR page_record IN 
    SELECT * FROM public.local_seo_pages 
    WHERE city_slug = lower(regexp_replace(unaccent(COALESCE(NEW.city, OLD.city)), '[^a-zA-Z0-9]+', '-', 'g'))
  LOOP
    -- Compter les réparateurs dans cette ville
    SELECT COUNT(*), COALESCE(AVG(rating), 4.8)
    INTO repairer_count_val, avg_rating_val
    FROM public.repairers 
    WHERE lower(regexp_replace(unaccent(city), '[^a-zA-Z0-9]+', '-', 'g')) = page_record.city_slug;
    
    -- Mettre à jour la page
    UPDATE public.local_seo_pages 
    SET 
      repairer_count = repairer_count_val,
      average_rating = ROUND(avg_rating_val, 1),
      updated_at = now()
    WHERE id = page_record.id;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour des statistiques
CREATE TRIGGER update_seo_stats_on_repairer_change
  AFTER INSERT OR UPDATE OR DELETE ON public.repairers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seo_page_stats();

-- Fonction pour vérifier l'accès aux fonctionnalités SEO Local (Premium/Enterprise uniquement)
CREATE OR REPLACE FUNCTION public.has_local_seo_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = has_local_seo_access.user_id
      AND subscription_tier IN ('premium', 'enterprise')
      AND subscribed = true
  );
$$;

-- RLS Policies pour sécuriser l'accès
ALTER TABLE public.local_seo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_seo_metrics ENABLE ROW LEVEL SECURITY;

-- Policies pour les templates (admin uniquement)
CREATE POLICY "Admins can manage seo templates" ON public.local_seo_templates
  FOR ALL USING (get_current_user_role() = 'admin');

-- Policies pour les pages SEO (Premium/Enterprise + admin)
CREATE POLICY "Premium users and admins can view seo pages" ON public.local_seo_pages
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR 
    has_local_seo_access(auth.uid()) OR
    is_published = true
  );

CREATE POLICY "Premium users and admins can manage seo pages" ON public.local_seo_pages
  FOR INSERT WITH CHECK (
    get_current_user_role() = 'admin' OR 
    has_local_seo_access(auth.uid())
  );

CREATE POLICY "Premium users and admins can update seo pages" ON public.local_seo_pages
  FOR UPDATE USING (
    get_current_user_role() = 'admin' OR 
    has_local_seo_access(auth.uid())
  );

-- Policies pour les métriques (Premium/Enterprise + admin)
CREATE POLICY "Premium users and admins can manage seo metrics" ON public.local_seo_metrics
  FOR ALL USING (
    get_current_user_role() = 'admin' OR 
    has_local_seo_access(auth.uid())
  );

-- Fonction pour actualiser les données d'une page SEO avec l'IA
CREATE OR REPLACE FUNCTION public.refresh_seo_page_content(page_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_record public.local_seo_pages%ROWTYPE;
BEGIN
  -- Vérifier les permissions
  IF NOT (get_current_user_role() = 'admin' OR has_local_seo_access(auth.uid())) THEN
    RETURN FALSE;
  END IF;
  
  -- Récupérer la page
  SELECT * INTO page_record FROM public.local_seo_pages WHERE id = page_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marquer pour régénération IA (sera traité par le service externe)
  UPDATE public.local_seo_pages 
  SET 
    last_updated_content = now(),
    generation_prompt = 'refresh_request_' || extract(epoch from now())
  WHERE id = page_id;
  
  RETURN TRUE;
END;
$$;