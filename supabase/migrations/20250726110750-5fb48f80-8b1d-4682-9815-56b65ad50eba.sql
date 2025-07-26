-- Fix remaining security issues: Security Definer View and Function Search Path
-- This migration addresses the remaining database-level security warnings

-- Step 1: Fix the unaccent wrapper function to have a proper search path
CREATE OR REPLACE FUNCTION public.unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = ''
AS $function$
  SELECT extensions.unaccent('unaccent', $1);
$function$;

-- Step 2: Identify and recreate any Security Definer views
-- Check for admin_subscription_overview view which might be the issue
DROP VIEW IF EXISTS public.admin_subscription_overview CASCADE;

-- Recreate the admin_subscription_overview view without SECURITY DEFINER
CREATE VIEW public.admin_subscription_overview AS
SELECT 
    rs.id,
    rs.repairer_id,
    rs.email,
    rs.user_id,
    p.first_name,
    p.last_name,
    rs.subscription_tier,
    rs.billing_cycle,
    rs.subscribed,
    rs.created_at,
    rs.updated_at,
    rs.subscription_end,
    sp.plan_name,
    sp.price_monthly,
    sp.price_yearly
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON rs.user_id = p.id
LEFT JOIN public.subscription_plans sp ON rs.subscription_tier = sp.tier;

-- Step 3: Ensure RLS is enabled on the view's underlying tables
ALTER TABLE public.repairer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper RLS policy for the admin_subscription_overview view access
CREATE POLICY "Admin only access to subscription overview" 
ON public.repairer_subscriptions 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Step 5: Fix any other potential function search path issues
-- Update any remaining functions that might not have search_path set
CREATE OR REPLACE FUNCTION public.unaccent(regdictionary, text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = ''
AS $function$
  SELECT extensions.unaccent($1, $2);
$function$;

CREATE OR REPLACE FUNCTION public.unaccent_init(internal)
RETURNS internal
LANGUAGE sql
PARALLEL SAFE
SET search_path = ''
AS $function$
  SELECT extensions.unaccent_init($1);
$function$;

CREATE OR REPLACE FUNCTION public.unaccent_lexize(internal, internal, internal, internal)
RETURNS internal
LANGUAGE sql
PARALLEL SAFE
SET search_path = ''
AS $function$
  SELECT extensions.unaccent_lexize($1, $2, $3, $4);
$function$;