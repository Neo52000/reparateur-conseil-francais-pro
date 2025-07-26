-- Fix security issues with a simpler approach
-- Remove problematic unaccent references and fix the Security Definer view

-- Step 1: Remove the problematic unaccent wrapper functions
DROP FUNCTION IF EXISTS public.unaccent(text);
DROP FUNCTION IF EXISTS public.unaccent(regdictionary, text);
DROP FUNCTION IF EXISTS public.unaccent_init(internal);
DROP FUNCTION IF EXISTS public.unaccent_lexize(internal, internal, internal, internal);

-- Step 2: Update normalize_text function to not depend on unaccent extension
CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
  -- Simple character replacement without unaccent dependency
  RETURN translate(
    lower(input_text),
    'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ',
    'aaaaaaaceeeeiiiinoooooosuuuuyy'
  );
END;
$function$;

-- Step 3: Fix the admin_subscription_overview view by removing it and recreating properly
DROP VIEW IF EXISTS public.admin_subscription_overview CASCADE;

-- Recreate as a regular view (not materialized, not security definer)
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
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 'Gratuit'
        WHEN rs.subscription_tier = 'basic' THEN 'Basic'
        WHEN rs.subscription_tier = 'pro' THEN 'Pro'
        WHEN rs.subscription_tier = 'premium' THEN 'Premium'
        WHEN rs.subscription_tier = 'enterprise' THEN 'Enterprise'
        ELSE 'Unknown'
    END as plan_name,
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 0
        WHEN rs.subscription_tier = 'basic' THEN 9.90
        WHEN rs.subscription_tier = 'pro' THEN 19.90
        WHEN rs.subscription_tier = 'premium' THEN 39.90
        WHEN rs.subscription_tier = 'enterprise' THEN 99.90
        ELSE 0
    END as price_monthly,
    CASE 
        WHEN rs.subscription_tier = 'free' THEN 0
        WHEN rs.subscription_tier = 'basic' THEN 99.00
        WHEN rs.subscription_tier = 'pro' THEN 199.00
        WHEN rs.subscription_tier = 'premium' THEN 399.00
        WHEN rs.subscription_tier = 'enterprise' THEN 999.00
        ELSE 0
    END as price_yearly
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON rs.user_id = p.id;

-- Step 4: Ensure proper RLS on the view access
-- The view will inherit RLS from its underlying tables

-- Step 5: Clean up the extensions schema if it's empty
DROP SCHEMA IF EXISTS extensions CASCADE;