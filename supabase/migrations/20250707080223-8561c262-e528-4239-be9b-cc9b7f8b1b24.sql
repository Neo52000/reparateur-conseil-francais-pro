-- Installer l'extension unaccent pour supprimer les accents
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Fonction de remplacement si unaccent n'est pas disponible
CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Si unaccent est disponible, l'utiliser, sinon faire un remplacement basique
  BEGIN
    RETURN unaccent(input_text);
  EXCEPTION 
    WHEN undefined_function THEN
      -- Remplacement basique des caractères accentués
      RETURN translate(
        lower(input_text),
        'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ',
        'aaaaaaaceeeeiiiinoooooosuuuuyy'
      );
  END;
END;
$$;

-- Mettre à jour la fonction auto_generate_seo_page pour utiliser normalize_text
CREATE OR REPLACE FUNCTION public.auto_generate_seo_page()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  city_name TEXT;
  city_slug_name TEXT;
  existing_page_count INTEGER;
BEGIN
  -- Récupérer la ville du réparateur ajouté
  city_name := NEW.city;
  city_slug_name := lower(regexp_replace(normalize_text(city_name), '[^a-zA-Z0-9]+', '-', 'g'));
  
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
$$;

-- Mettre à jour la fonction update_seo_page_stats pour utiliser normalize_text
CREATE OR REPLACE FUNCTION public.update_seo_page_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  page_record RECORD;
  repairer_count_val INTEGER;
  avg_rating_val NUMERIC;
BEGIN
  -- Mettre à jour les stats pour toutes les pages de la ville
  FOR page_record IN 
    SELECT * FROM public.local_seo_pages 
    WHERE city_slug = lower(regexp_replace(normalize_text(COALESCE(NEW.city, OLD.city)), '[^a-zA-Z0-9]+', '-', 'g'))
  LOOP
    -- Compter les réparateurs dans cette ville
    SELECT COUNT(*), COALESCE(AVG(rating), 4.8)
    INTO repairer_count_val, avg_rating_val
    FROM public.repairers 
    WHERE lower(regexp_replace(normalize_text(city), '[^a-zA-Z0-9]+', '-', 'g')) = page_record.city_slug;
    
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
$$;