-- =====================================================
-- MIGRATION MANUELLE : Correction des Cron Jobs Blog
-- À exécuter dans le SQL Editor de Supabase
-- =====================================================
--
-- PROBLÈME : Les cron jobs actuels n'incluent pas de header Authorization,
-- ce qui empêche les Edge Functions d'avoir les permissions admin nécessaires
--
-- SOLUTION : Recréer les cron jobs avec le service_role key dans les headers
--
-- ⚠️ IMPORTANT : Remplacez YOUR_SERVICE_ROLE_KEY_HERE par votre vraie clé
-- Vous pouvez la trouver dans : Supabase Dashboard → Settings → API
-- =====================================================

-- 1. Supprimer les anciens cron jobs s'ils existent
SELECT cron.unschedule('weekly-blog-automation') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-blog-automation'
);

SELECT cron.unschedule('daily-blog-auto-publish') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-blog-auto-publish'
);

SELECT cron.unschedule('blog-auto-publish') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blog-auto-publish'
);

-- 2. Recréer le cron job principal avec service_role key
SELECT cron.schedule(
  'weekly-blog-automation',
  '0 8 * * 1', -- Tous les lundis à 8h00
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-ai-generator',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
        ),
        body:=jsonb_build_object(
          'auto_publish', false,
          'test_mode', false
        )
    ) as request_id;
  $$
);

-- 3. Créer un cron job quotidien pour auto-publish
SELECT cron.schedule(
  'daily-blog-auto-publish',
  '0 9 * * *', -- Tous les jours à 9h00
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-auto-publish',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
        ),
        body:=jsonb_build_object()
    ) as request_id;
  $$
);

-- 4. Vérifier que les cron jobs sont bien créés
SELECT jobname, schedule, active 
FROM cron.job 
WHERE jobname IN ('weekly-blog-automation', 'daily-blog-auto-publish');

-- FIN DE LA MIGRATION
-- 
-- INSTRUCTIONS :
-- 1. Copiez ce script dans le SQL Editor de Supabase
-- 2. Remplacez toutes les occurrences de YOUR_SERVICE_ROLE_KEY_HERE par votre vraie service_role key
--    (Supabase Dashboard → Settings → API → service_role key)
-- 3. Exécutez le script
-- 4. Vérifiez que les cron jobs sont actifs avec la dernière requête SELECT
