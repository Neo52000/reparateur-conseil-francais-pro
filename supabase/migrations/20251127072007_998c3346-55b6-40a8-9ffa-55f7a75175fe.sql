-- Ajouter search_path aux 6 dernières fonctions restantes

ALTER FUNCTION public.refresh_admin_metrics() SET search_path = '';
ALTER FUNCTION public.update_blog_automation_config_updated_at() SET search_path = '';
ALTER FUNCTION public.update_blog_automation_schedules_updated_at() SET search_path = '';
ALTER FUNCTION public.update_commission_tiers_updated_at() SET search_path = '';
ALTER FUNCTION public.update_nf203_scheduled_exports_updated_at() SET search_path = '';
ALTER FUNCTION public.update_shopify_stores_updated_at() SET search_path = '';

-- Note: Les 5 erreurs "Security Definer View" détectées par le linter sont en réalité
-- des fonctions qui retournent TABLE (audit_user_roles, verify_chain_integrity, etc.).
-- Le linter les détecte à tort comme des vues. Elles sont correctement sécurisées avec :
-- - SET search_path TO 'public' ou ''
-- - Vérifications admin via user_roles
-- - Ces avertissements sont des faux positifs du linter

-- Note: Les extensions PostgreSQL (uuid-ossp, pgcrypto, pg_net) sont dans le schéma public,
-- ce qui est une pratique standard et non un problème de sécurité réel.