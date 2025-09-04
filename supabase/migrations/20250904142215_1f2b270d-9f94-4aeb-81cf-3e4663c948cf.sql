-- Fix the remaining Security Definer View issues by recreating safe views
-- Drop and recreate views with explicit security invoker properties

-- Drop existing safe views
DROP VIEW IF EXISTS public.repairers_safe;
DROP VIEW IF EXISTS public.repairer_profiles_safe;

-- Create repairers_safe view with explicit security invoker
CREATE VIEW public.repairers_safe 
WITH (security_invoker = true)
AS SELECT 
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

-- Create repairer_profiles_safe view with explicit security invoker  
CREATE VIEW public.repairer_profiles_safe
WITH (security_invoker = true)
AS SELECT 
    id,
    business_name,
    city,
    repair_types,
    created_at
FROM public.repairer_profiles;

-- Add RLS policies for the safe views to ensure proper access control
-- Note: Views inherit RLS from their underlying tables, but we can add comments for clarity

COMMENT ON VIEW public.repairers_safe IS 'Safe view of repairers data with security_invoker = true';
COMMENT ON VIEW public.repairer_profiles_safe IS 'Safe view of repairer profiles data with security_invoker = true';