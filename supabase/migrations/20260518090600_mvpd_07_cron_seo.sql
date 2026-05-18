-- ============================================================================
-- MVP D — Migration 7/7 : cron weekly pour generate-seo-page
-- ============================================================================
-- pg_cron + pg_net déjà activés (cf. 20251031084455).
-- Schedule : tous les lundis à 04:00 UTC ; appelle l'edge function avec
-- le header x-cron-secret (lu depuis vault.secrets, à provisionner par
-- l'admin via `supabase secrets set CRON_SECRET=...` côté Edge ET via
-- `select vault.create_secret('<value>', 'mvpd_cron_secret')` côté DB).
--
-- Le project ref est lu depuis vault.secrets également pour éviter de
-- coder en dur l'URL.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent unschedule
DO $$
BEGIN
  PERFORM cron.unschedule('mvpd-generate-seo');
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

-- L'URL et le secret sont stockés dans vault.secrets pour ne pas figer
-- les credentials dans la migration. À provisionner manuellement par
-- l'admin avant que le cron ne s'exécute :
--
--   select vault.create_secret('https://<ref>.functions.supabase.co/generate-seo-page', 'mvpd_seo_url');
--   select vault.create_secret('<cron_secret>', 'mvpd_cron_secret');
--
-- Si les secrets n'existent pas, l'appel échoue silencieusement (NULL) ;
-- pas de plantage du cron.
SELECT cron.schedule(
  'mvpd-generate-seo',
  '0 4 * * 1',
  $$
  SELECT
    net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'mvpd_seo_url' LIMIT 1),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'mvpd_cron_secret' LIMIT 1)
      ),
      body := jsonb_build_object('source', 'pg_cron', 'at', now())
    );
  $$
);

COMMIT;
