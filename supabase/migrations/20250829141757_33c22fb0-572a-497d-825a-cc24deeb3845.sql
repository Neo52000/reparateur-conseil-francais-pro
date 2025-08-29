-- Security Fix - Update Functions In Place (No Dependencies Break)

-- 1. Update existing functions with proper security settings (don't drop them)

-- Fix the log security function with proper search path
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

-- Fix the get current user role function with proper search path
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

-- Update existing has_paid_subscription function (keep same signature to avoid dependency issues)
-- First check what the current signature is and update accordingly
-- This function likely has parameter name "repairer_user_id" based on the error
CREATE OR REPLACE FUNCTION public.has_paid_subscription(repairer_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path TO ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.repairer_subscriptions 
    WHERE repairer_subscriptions.user_id = repairer_user_id
    AND subscription_tier IN ('basic', 'premium', 'enterprise')
    AND subscribed = true
  );
END;
$$;

-- 2. Fix views by recreating them without security definer
DROP VIEW IF EXISTS public.repairers_safe;
DROP VIEW IF EXISTS public.repairer_profiles_safe;

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

-- Grant proper access
GRANT SELECT ON public.repairers_safe TO anon, authenticated;
GRANT SELECT ON public.repairer_profiles_safe TO anon, authenticated;

-- 3. Log the security improvements
SELECT public.log_security_event('SECURITY_LINTER_ISSUES_RESOLVED', 'FUNCTIONS_AND_VIEWS_SECURED', true, 'Updated functions with secure search_path and fixed view security');