-- =====================================================
-- MIGRATION MANUELLE : Configuration du Cron Job AI-CMO
-- A executer dans le SQL Editor de Supabase
-- =====================================================
--
-- Ce cron job appelle l'Edge Function ai-cmo-worker toutes
-- les heures pour executer les questions de monitoring actives.
--
-- ⚠️ IMPORTANT :
-- 1. Allez dans Supabase Dashboard > SQL Editor
-- 2. Remplacez YOUR_SERVICE_ROLE_KEY_HERE par votre vraie cle
--    (Supabase Dashboard > Settings > API > service_role key)
-- 3. Executez le script
-- =====================================================

-- 1. S'assurer que les extensions necessaires sont activees
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer l'ancien cron job s'il existe
SELECT cron.unschedule('ai-cmo-worker')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'ai-cmo-worker'
);

-- 3. Creer le cron job (s'execute toutes les heures a la minute 0)
SELECT cron.schedule(
  'ai-cmo-worker',
  '0 * * * *', -- Toutes les heures
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/ai-cmo-worker',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
        ),
        body:='{"site_id": "00000000-0000-0000-0000-000000000001"}'::jsonb
    ) as request_id;
  $$
);

-- 4. Verifier que le cron job est bien cree
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname = 'ai-cmo-worker';

-- =====================================================
-- FIN DE LA MIGRATION
--
-- Apres execution, vous devriez voir:
-- jobname: ai-cmo-worker
-- schedule: 0 * * * *
-- active: true
--
-- Le worker verifiera automatiquement quelles questions
-- sont dues (next_run_at <= now) et ne traitera que
-- celles-ci. Chaque question a sa propre frequence
-- configurable (1h, 6h, 12h, quotidien, hebdomadaire).
-- =====================================================
