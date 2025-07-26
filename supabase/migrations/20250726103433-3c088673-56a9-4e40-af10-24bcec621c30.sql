-- Fix remaining security issues detected by linter

-- 1. Fix all remaining functions to include search_path = ''
CREATE OR REPLACE FUNCTION public.increment_share_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET share_count = share_count + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_impressions(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.ad_banners 
  SET current_impressions = current_impressions + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_clicks(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.ad_banners 
  SET current_clicks = current_clicks + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_chatbot_metric(metric_name text, increment_by integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.chatbot_analytics (date, metric_type, metric_value)
  VALUES (CURRENT_DATE, metric_name, increment_by)
  ON CONFLICT (date, metric_type)
  DO UPDATE SET 
    metric_value = chatbot_analytics.metric_value + increment_by,
    created_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_and_use_promo_code(promo_code_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code_record RECORD;
  result JSONB;
BEGIN
  -- Rechercher le code promo
  SELECT * INTO code_record 
  FROM public.promo_codes 
  WHERE code = promo_code_text 
    AND active = true 
    AND (valid_until IS NULL OR valid_until > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  FOR UPDATE;
  
  -- Si le code n'existe pas ou n'est pas valide
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Code promo invalide ou expiré'
    );
  END IF;
  
  -- Incrémenter l'utilisation
  UPDATE public.promo_codes 
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = code_record.id;
  
  -- Retourner les détails du code
  RETURN jsonb_build_object(
    'valid', true,
    'discount_type', code_record.discount_type,
    'discount_value', code_record.discount_value,
    'applicable_plans', code_record.applicable_plans
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_free_plan_to_repairer(user_email text, user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Insérer un abonnement gratuit par défaut
  INSERT INTO public.repairer_subscriptions (
    repairer_id,
    email,
    user_id,
    subscription_tier,
    billing_cycle,
    subscribed,
    created_at,
    updated_at
  ) VALUES (
    user_id::TEXT,
    user_email,
    user_id,
    'free',
    'monthly',
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_id(prefix text DEFAULT 'REP'::text)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    new_id := prefix || '_' || LPAD(counter::TEXT, 6, '0') || '_' || EXTRACT(EPOCH FROM now())::INTEGER;
    
    -- Vérifier l'unicité dans la table repairers
    IF NOT EXISTS (SELECT 1 FROM public.repairers WHERE unique_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
    
    -- Éviter une boucle infinie
    IF counter > max_attempts THEN
      new_id := prefix || '_' || gen_random_uuid()::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_data_quality_score(repairer_record repairers)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  completeness_score NUMERIC := 0;
  accuracy_score NUMERIC := 0;
  consistency_score NUMERIC := 0;
  total_score NUMERIC := 0;
BEGIN
  -- Score de complétude (40% du score total)
  completeness_score := (
    CASE WHEN repairer_record.name IS NOT NULL AND length(trim(repairer_record.name)) > 0 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.address IS NOT NULL AND length(trim(repairer_record.address)) > 0 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.phone IS NOT NULL AND length(trim(repairer_record.phone)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.email IS NOT NULL AND length(trim(repairer_record.email)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.website IS NOT NULL AND length(trim(repairer_record.website)) > 0 THEN 5 ELSE 0 END +
    CASE WHEN repairer_record.description IS NOT NULL AND length(trim(repairer_record.description)) > 0 THEN 5 ELSE 0 END
  );
  
  -- Score de précision (40% du score total)
  accuracy_score := (
    CASE WHEN repairer_record.lat IS NOT NULL AND repairer_record.lng IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN repairer_record.postal_code IS NOT NULL AND repairer_record.postal_code ~ '^[0-9]{5}$' THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.phone IS NOT NULL AND length(replace(replace(replace(repairer_record.phone, ' ', ''), '.', ''), '-', '')) >= 10 THEN 10 ELSE 0 END +
    CASE WHEN repairer_record.email IS NOT NULL AND repairer_record.email ~ '^[^@]+@[^@]+\.[^@]+$' THEN 5 ELSE 0 END
  );
  
  -- Score de cohérence (20% du score total)
  consistency_score := (
    CASE WHEN repairer_record.deepseek_confidence > 0.7 THEN 10 ELSE 5 END +
    CASE WHEN repairer_record.is_verified = TRUE THEN 10 ELSE 0 END
  );
  
  total_score := completeness_score + accuracy_score + consistency_score;
  
  RETURN LEAST(100, total_score);
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_unique_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_unique_id('REP');
  END IF;
  
  -- Calculer automatiquement le score de qualité
  NEW.data_quality_score := calculate_data_quality_score(NEW);
  
  RETURN NEW;
END;
$$;

-- Continue with more functions...
CREATE OR REPLACE FUNCTION public.generate_pos_customer_number(repairer_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  customer_number TEXT;
BEGIN
  -- Créer un préfixe basé sur l'année
  prefix := 'C' || TO_CHAR(CURRENT_DATE, 'YY') || '-';
  
  -- Obtenir le compteur pour ce réparateur cette année
  SELECT COALESCE(MAX(
    CASE WHEN customer_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(customer_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.pos_customers 
  WHERE pos_customers.repairer_id = generate_pos_customer_number.repairer_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  customer_number := prefix || LPAD(counter::TEXT, 5, '0');
  
  RETURN customer_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_business_categories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_pos_customer_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.customer_number IS NULL THEN
    NEW.customer_number := generate_pos_customer_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_module_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Validate POS pricing (€49.90/month or €499/year)
  IF NEW.module_type = 'pos' THEN
    IF NEW.billing_cycle = 'monthly' AND NEW.module_price != 49.90 THEN
      RAISE EXCEPTION 'POS monthly price must be €49.90';
    ELSIF NEW.billing_cycle = 'yearly' AND NEW.module_price != 499.00 THEN
      RAISE EXCEPTION 'POS yearly price must be €499.00';
    END IF;
  END IF;
  
  -- Validate E-commerce pricing (€89/month or €890/year)
  IF NEW.module_type = 'ecommerce' THEN
    IF NEW.billing_cycle = 'monthly' AND NEW.module_price != 89.00 THEN
      RAISE EXCEPTION 'E-commerce monthly price must be €89.00';
    ELSIF NEW.billing_cycle = 'yearly' AND NEW.module_price != 890.00 THEN
      RAISE EXCEPTION 'E-commerce yearly price must be €890.00';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;