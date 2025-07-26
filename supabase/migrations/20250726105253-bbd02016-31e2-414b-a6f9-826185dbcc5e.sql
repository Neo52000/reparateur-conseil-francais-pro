-- Fix remaining functions and finalize security measures

-- Fix remaining functions that need search_path
CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  -- Si unaccent est disponible, l'utiliser, sinon faire un remplacement basique
  BEGIN
    RETURN public.unaccent(input_text);
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

CREATE OR REPLACE FUNCTION public.auto_generate_seo_page()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  city_name TEXT;
  city_slug_name TEXT;
  existing_page_count INTEGER;
BEGIN
  -- Récupérer la ville du réparateur ajouté
  city_name := NEW.city;
  city_slug_name := lower(regexp_replace(public.normalize_text(city_name), '[^a-zA-Z0-9]+', '-', 'g'));
  
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

CREATE OR REPLACE FUNCTION public.update_seo_page_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  page_record RECORD;
  repairer_count_val INTEGER;
  avg_rating_val NUMERIC;
BEGIN
  -- Mettre à jour les stats pour toutes les pages de la ville
  FOR page_record IN 
    SELECT * FROM public.local_seo_pages 
    WHERE city_slug = lower(regexp_replace(public.normalize_text(COALESCE(NEW.city, OLD.city)), '[^a-zA-Z0-9]+', '-', 'g'))
  LOOP
    -- Compter les réparateurs dans cette ville
    SELECT COUNT(*), COALESCE(AVG(rating), 4.8)
    INTO repairer_count_val, avg_rating_val
    FROM public.repairers 
    WHERE lower(regexp_replace(public.normalize_text(city), '[^a-zA-Z0-9]+', '-', 'g')) = page_record.city_slug;
    
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

CREATE OR REPLACE FUNCTION public.generate_repair_order_number(repairer_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  order_number TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN order_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.repair_orders 
  WHERE repair_orders.repairer_id = generate_repair_order_number.repairer_id
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_repair_order_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chatbot_learning_patterns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the trigger function to use proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(new.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN new;
END;
$$;

-- Add missing RLS policies for tables without policies
CREATE POLICY "Only system can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Add index for better performance on security audit log
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id_created_at 
ON public.security_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits(identifier, action);

-- Clean up old rate limit entries (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '24 hours';
END;
$$;