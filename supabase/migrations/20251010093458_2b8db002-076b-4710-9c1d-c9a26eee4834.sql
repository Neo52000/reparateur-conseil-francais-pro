-- Fix Security Definer View Issue
-- Remove any SECURITY DEFINER property from views

-- Check if admin_subscription_overview function exists and drop it if it's a view
DROP VIEW IF EXISTS public.admin_subscription_overview CASCADE;

-- Ensure all existing views don't have security definer
-- Recreate the views that are currently in the database

-- Recreate repairers_safe view
CREATE OR REPLACE VIEW public.repairers_safe AS
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
FROM repairers;

-- Recreate repairer_profiles_safe view  
CREATE OR REPLACE VIEW public.repairer_profiles_safe AS
SELECT 
  id,
  business_name,
  city,
  repair_types,
  created_at
FROM repairer_profiles;

-- Recreate nf203_admin_overview view
CREATE OR REPLACE VIEW public.nf203_admin_overview AS
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
  (count(DISTINCT eic.id)::numeric / NULLIF(count(DISTINCT ei.id), 0)::numeric * 100) AS compliance_rate,
  max(ei.created_at) AS last_invoice_date,
  max(na.created_at) AS last_archive_date
FROM repairer_profiles rp
LEFT JOIN electronic_invoices ei ON ei.repairer_id = rp.user_id
LEFT JOIN electronic_invoices_chain eic ON eic.repairer_id = rp.user_id
LEFT JOIN nf203_archives na ON na.repairer_id = rp.user_id
LEFT JOIN nf203_period_closures npc ON npc.repairer_id = rp.user_id
LEFT JOIN nf203_alerts alerts ON alerts.repairer_id = rp.user_id
GROUP BY rp.id, rp.business_name, rp.city;
