-- Sécuriser les vues admin avec vérification user_roles

-- 1. Recréer admin_shopify_stores_overview avec restriction admin
DROP VIEW IF EXISTS public.admin_shopify_stores_overview;

CREATE VIEW public.admin_shopify_stores_overview AS
SELECT 
  ss.id,
  ss.repairer_id,
  p.email AS repairer_email,
  COALESCE((p.first_name || ' '::text) || p.last_name, p.email) AS repairer_name,
  ss.shop_domain,
  ss.store_status,
  ss.store_name,
  ss.claimed_at,
  ss.commission_rate,
  ss.created_at,
  count(DISTINCT soc.id) AS total_orders,
  COALESCE(sum(soc.order_total_amount), 0::numeric) AS total_revenue,
  COALESCE(sum(soc.commission_amount), 0::numeric) AS total_commissions
FROM public.shopify_stores ss
LEFT JOIN public.profiles p ON ss.repairer_id = p.id
LEFT JOIN public.shopify_order_commissions soc ON ss.id = soc.store_id
WHERE EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role = 'admin'
  AND is_active = true
)
GROUP BY ss.id, p.email, p.first_name, p.last_name;

-- 2. Recréer blog_automation_cron_history avec restriction admin
DROP VIEW IF EXISTS public.blog_automation_cron_history;

CREATE VIEW public.blog_automation_cron_history AS
SELECT 
  jr.jobid,
  j.jobname,
  jr.runid,
  jr.status,
  jr.return_message,
  jr.start_time,
  jr.end_time,
  EXTRACT(epoch FROM jr.end_time - jr.start_time) AS duration_seconds
FROM cron.job_run_details jr
JOIN cron.job j ON j.jobid = jr.jobid
WHERE j.jobname = 'weekly-blog-automation'::text
AND EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role = 'admin'
  AND is_active = true
)
ORDER BY jr.start_time DESC;

-- 3. Recréer nf203_admin_overview avec restriction admin
DROP VIEW IF EXISTS public.nf203_admin_overview;

CREATE VIEW public.nf203_admin_overview AS
SELECT 
  rp.id AS repairer_id,
  rp.business_name AS repairer_name,
  rp.city AS repairer_city,
  count(DISTINCT ei.id) AS total_invoices,
  count(DISTINCT eic.id) AS chained_invoices,
  count(DISTINCT na.id) AS archives_count,
  count(DISTINCT npc.id) AS closures_count,
  max(npc.closure_date) AS last_closure,
  count(DISTINCT alerts.id) FILTER (WHERE alerts.status = 'active'::text) AS active_alerts,
  count(DISTINCT alerts.id) FILTER (WHERE alerts.severity = 'critical'::text) AS critical_alerts,
  count(DISTINCT eic.id)::numeric / NULLIF(count(DISTINCT ei.id), 0)::numeric * 100::numeric AS compliance_rate,
  max(ei.created_at) AS last_invoice_date,
  max(na.created_at) AS last_archive_date
FROM public.repairer_profiles rp
LEFT JOIN public.electronic_invoices ei ON ei.repairer_id = rp.user_id
LEFT JOIN public.electronic_invoices_chain eic ON eic.repairer_id = rp.user_id
LEFT JOIN public.nf203_archives na ON na.repairer_id = rp.user_id
LEFT JOIN public.nf203_period_closures npc ON npc.repairer_id = rp.user_id
LEFT JOIN public.nf203_alerts alerts ON alerts.repairer_id = rp.user_id
WHERE EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role = 'admin'
  AND is_active = true
)
GROUP BY rp.id, rp.business_name, rp.city;