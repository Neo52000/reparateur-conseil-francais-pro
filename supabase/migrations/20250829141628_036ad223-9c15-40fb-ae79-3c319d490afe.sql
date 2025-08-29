-- Fix Security Warnings from Linter
-- Addresses: Security Definer Views and Function Search Path issues

-- 1. Fix Security Definer Views by recreating as regular views
DROP VIEW IF EXISTS public.repairers_safe;
DROP VIEW IF EXISTS public.repairer_profiles_safe;

-- Recreate as regular views (not security definer)
CREATE VIEW public.repairers_safe AS
SELECT 
  id,
  name,
  city,
  postal_code,
  specialties,
  rating,
  review_count,
  lat,
  lng,
  created_at
FROM public.repairers;

CREATE VIEW public.repairer_profiles_safe AS
SELECT 
  id,
  business_name,
  city,
  repair_types,
  created_at
FROM public.repairer_profiles;

-- 2. Fix Function Search Path (set to secure path)
CREATE OR REPLACE FUNCTION public.log_security_event(
  action_param TEXT,
  resource_param TEXT DEFAULT NULL,
  success_param BOOLEAN DEFAULT true,
  error_message_param TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource, success, error_message
  ) VALUES (
    auth.uid(), action_param, resource_param, success_param, error_message_param
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- 3. Update other security functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_paid_subscription(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path TO ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = has_paid_subscription.user_id
    AND subscription_tier IN ('basic', 'premium', 'enterprise')
    AND subscribed = true
  );
END;
$$;

-- Grant proper access to safe views
GRANT SELECT ON public.repairers_safe TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_safe TO anon, authenticated;

-- Log the security improvements
SELECT public.log_security_event('SECURITY_WARNINGS_FIXED', 'FUNCTIONS_AND_VIEWS_SECURED', true, 'Fixed security definer views and function search paths');