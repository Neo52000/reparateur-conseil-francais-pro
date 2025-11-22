
-- Fix Function Search Path Mutable issue
-- Add SET search_path to functions that are missing it

-- Fix update_conversation_on_message function
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    unread_count_client = CASE WHEN NEW.sender_type = 'repairer' THEN unread_count_client + 1 ELSE unread_count_client END,
    unread_count_repairer = CASE WHEN NEW.sender_type = 'user' THEN unread_count_repairer + 1 ELSE unread_count_repairer END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix cleanup_expired_conversations function
CREATE OR REPLACE FUNCTION public.cleanup_expired_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.conversation_memory WHERE expires_at < NOW();
END;
$function$;

-- Fix update_supplier_rating function
CREATE OR REPLACE FUNCTION public.update_supplier_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.suppliers_directory 
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::NUMERIC, 1)
      FROM public.suppliers_directory_reviews 
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
        AND status = 'published'
    ), 0),
    review_count = COALESCE((
      SELECT COUNT(*)
      FROM public.suppliers_directory_reviews 
      WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
        AND status = 'published'
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix increment_impressions function
CREATE OR REPLACE FUNCTION public.increment_impressions(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.ad_banners 
  SET current_impressions = current_impressions + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$function$;

-- Fix increment_clicks function
CREATE OR REPLACE FUNCTION public.increment_clicks(banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.ad_banners 
  SET current_clicks = current_clicks + 1,
      updated_at = now()
  WHERE id = banner_id;
END;
$function$;

-- Fix increment_chatbot_metric function
CREATE OR REPLACE FUNCTION public.increment_chatbot_metric(metric_name text, increment_by integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.chatbot_analytics (date, metric_type, metric_value)
  VALUES (CURRENT_DATE, metric_name, increment_by)
  ON CONFLICT (date, metric_type)
  DO UPDATE SET 
    metric_value = chatbot_analytics.metric_value + increment_by,
    created_at = now();
END;
$function$;

-- Fix increment_share_count function
CREATE OR REPLACE FUNCTION public.increment_share_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.blog_posts 
  SET share_count = share_count + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  action_param text, 
  resource_param text DEFAULT NULL, 
  success_param boolean DEFAULT true, 
  error_message_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  audit_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to log security events';
  END IF;
  
  IF action_param IS NULL OR trim(action_param) = '' THEN
    RAISE EXCEPTION 'Action parameter cannot be empty';
  END IF;
  
  INSERT INTO public.security_audit_log (
    user_id, action, resource, success, error_message
  ) VALUES (
    current_user_id, action_param, resource_param, success_param, error_message_param
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$function$;

-- Fix validate_and_use_promo_code function
CREATE OR REPLACE FUNCTION public.validate_and_use_promo_code(promo_code_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  code_record RECORD;
BEGIN
  SELECT * INTO code_record 
  FROM public.promo_codes 
  WHERE code = promo_code_text 
    AND active = true 
    AND (valid_until IS NULL OR valid_until > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Code promo invalide ou expiré'
    );
  END IF;
  
  UPDATE public.promo_codes 
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = code_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'discount_type', code_record.discount_type,
    'discount_value', code_record.discount_value,
    'applicable_plans', code_record.applicable_plans
  );
END;
$function$;
