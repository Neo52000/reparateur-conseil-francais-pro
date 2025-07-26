-- Final attempt to fix the Security Definer View issue
-- The linter is detecting something about our view that we need to address

-- Step 1: Completely drop and recreate the view with explicit security settings
DROP VIEW IF EXISTS public.admin_subscription_overview CASCADE;

-- Step 2: Create a simple function instead of a view to avoid any security definer issues
CREATE OR REPLACE FUNCTION public.get_admin_subscription_overview()
RETURNS TABLE (
    id uuid,
    repairer_id text,
    email text,
    user_id uuid,
    first_name text,
    last_name text,
    subscription_tier text,
    billing_cycle text,
    subscribed boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    subscription_end timestamp with time zone,
    plan_name text,
    price_monthly numeric,
    price_yearly numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
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
    LEFT JOIN public.profiles p ON rs.user_id = p.id
    WHERE public.get_current_user_role() = 'admin';
$function$;