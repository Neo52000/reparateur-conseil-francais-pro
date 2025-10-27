-- Activer les extensions nécessaires pour les cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer un cron job pour publier automatiquement les articles programmés
-- S'exécute toutes les 5 minutes
SELECT cron.schedule(
  'blog-auto-publish',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-auto-publish',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Vérifier que le cron job a été créé
SELECT * FROM cron.job WHERE jobname = 'blog-auto-publish';
