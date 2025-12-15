-- =====================================================
-- MIGRATION MANUELLE : Configuration du Cron Job Blog
-- À exécuter dans le SQL Editor de Supabase
-- =====================================================
--
-- PROBLÈME : Aucun cron job n'est configuré pour appeler
-- l'Edge Function blog-scheduler-cron automatiquement.
--
-- SOLUTION : Créer un cron job qui s'exécute toutes les minutes.
--
-- ⚠️ IMPORTANT : 
-- 1. Allez dans Supabase Dashboard → SQL Editor
-- 2. Remplacez YOUR_SERVICE_ROLE_KEY_HERE par votre vraie clé
--    (Supabase Dashboard → Settings → API → service_role key)
-- 3. Exécutez le script
-- =====================================================

-- 1. S'assurer que les extensions nécessaires sont activées
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Supprimer l'ancien cron job s'il existe
SELECT cron.unschedule('blog-scheduler-cron') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blog-scheduler-cron'
);

-- 3. Créer le nouveau cron job (s'exécute toutes les minutes)
SELECT cron.schedule(
  'blog-scheduler-cron',
  '* * * * *', -- Toutes les minutes
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-scheduler-cron',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
        ),
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- 4. Vérifier que le cron job est bien créé
SELECT jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'blog-scheduler-cron';

-- =====================================================
-- FIN DE LA MIGRATION
-- 
-- Après exécution, vous devriez voir:
-- jobname: blog-scheduler-cron
-- schedule: * * * * *
-- active: true
-- =====================================================
