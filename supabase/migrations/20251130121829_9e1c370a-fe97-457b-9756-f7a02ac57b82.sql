-- =====================================================
-- MIGRATION : Correction Vues SECURITY DEFINER
-- Recréer les vues avec security_invoker = true
-- =====================================================

-- 1. admin_shopify_stores_overview
DROP VIEW IF EXISTS public.admin_shopify_stores_overview;
CREATE VIEW public.admin_shopify_stores_overview 
WITH (security_invoker = true) AS
SELECT 
    ss.id,
    ss.repairer_id,
    p.email AS repairer_email,
    COALESCE(((p.first_name || ' '::text) || p.last_name), p.email) AS repairer_name,
    ss.shop_domain,
    ss.store_status,
    ss.store_name,
    ss.claimed_at,
    ss.commission_rate,
    ss.created_at,
    count(DISTINCT soc.id) AS total_orders,
    COALESCE(sum(soc.order_total_amount), (0)::numeric) AS total_revenue,
    COALESCE(sum(soc.commission_amount), (0)::numeric) AS total_commissions
FROM public.shopify_stores ss
LEFT JOIN public.profiles p ON (ss.repairer_id = p.id)
LEFT JOIN public.shopify_order_commissions soc ON (ss.id = soc.store_id)
WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
)
GROUP BY ss.id, p.email, p.first_name, p.last_name;

-- 2. admin_subscription_overview
DROP VIEW IF EXISTS public.admin_subscription_overview;
CREATE VIEW public.admin_subscription_overview 
WITH (security_invoker = true) AS
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
    CASE rs.subscription_tier
        WHEN 'free' THEN 'Gratuit'
        WHEN 'basic' THEN 'Basic'
        WHEN 'pro' THEN 'Pro'
        WHEN 'premium' THEN 'Premium'
        WHEN 'enterprise' THEN 'Enterprise'
        ELSE 'Unknown'
    END AS plan_name,
    CASE rs.subscription_tier
        WHEN 'free' THEN 0::numeric
        WHEN 'basic' THEN 9.90
        WHEN 'pro' THEN 19.90
        WHEN 'premium' THEN 39.90
        WHEN 'enterprise' THEN 99.90
        ELSE 0::numeric
    END AS price_monthly,
    CASE rs.subscription_tier
        WHEN 'free' THEN 0::numeric
        WHEN 'basic' THEN 99.00
        WHEN 'pro' THEN 199.00
        WHEN 'premium' THEN 399.00
        WHEN 'enterprise' THEN 999.00
        ELSE 0::numeric
    END AS price_yearly
FROM public.repairer_subscriptions rs
LEFT JOIN public.profiles p ON (rs.user_id = p.id)
WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
);

-- 3. blog_automation_cron_history
DROP VIEW IF EXISTS public.blog_automation_cron_history;
CREATE VIEW public.blog_automation_cron_history 
WITH (security_invoker = true) AS
SELECT 
    jr.jobid,
    j.jobname,
    jr.runid,
    jr.status,
    jr.return_message,
    jr.start_time,
    jr.end_time,
    EXTRACT(epoch FROM (jr.end_time - jr.start_time)) AS duration_seconds
FROM cron.job_run_details jr
JOIN cron.job j ON (j.jobid = jr.jobid)
WHERE j.jobname = 'weekly-blog-automation'
AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
)
ORDER BY jr.start_time DESC;

-- 4. nf203_admin_overview
DROP VIEW IF EXISTS public.nf203_admin_overview;
CREATE VIEW public.nf203_admin_overview 
WITH (security_invoker = true) AS
SELECT 
    rp.id AS repairer_id,
    rp.business_name AS repairer_name,
    rp.city AS repairer_city,
    count(DISTINCT ei.id) AS total_invoices,
    count(DISTINCT eic.id) AS chained_invoices,
    count(DISTINCT na.id) AS archives_count,
    count(DISTINCT npc.id) AS closures_count,
    max(npc.closure_date) AS last_closure,
    count(DISTINCT alerts.id) FILTER (WHERE alerts.status = 'active') AS active_alerts,
    count(DISTINCT alerts.id) FILTER (WHERE alerts.severity = 'critical') AS critical_alerts,
    ((count(DISTINCT eic.id)::numeric / NULLIF(count(DISTINCT ei.id), 0)::numeric) * 100::numeric) AS compliance_rate,
    max(ei.created_at) AS last_invoice_date,
    max(na.created_at) AS last_archive_date
FROM public.repairer_profiles rp
LEFT JOIN public.electronic_invoices ei ON (ei.repairer_id = rp.user_id)
LEFT JOIN public.electronic_invoices_chain eic ON (eic.repairer_id = rp.user_id)
LEFT JOIN public.nf203_archives na ON (na.repairer_id = rp.user_id)
LEFT JOIN public.nf203_period_closures npc ON (npc.repairer_id = rp.user_id)
LEFT JOIN public.nf203_alerts alerts ON (alerts.repairer_id = rp.user_id)
WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
    AND user_roles.is_active = true
)
GROUP BY rp.id, rp.business_name, rp.city;

-- 5. repairer_profiles_safe (vue publique - données non sensibles)
DROP VIEW IF EXISTS public.repairer_profiles_safe;
CREATE VIEW public.repairer_profiles_safe 
WITH (security_invoker = true) AS
SELECT 
    id,
    business_name,
    city,
    repair_types,
    created_at
FROM public.repairer_profiles;

-- 6. repairers_safe (vue publique - données non sensibles)
DROP VIEW IF EXISTS public.repairers_safe;
CREATE VIEW public.repairers_safe 
WITH (security_invoker = true) AS
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