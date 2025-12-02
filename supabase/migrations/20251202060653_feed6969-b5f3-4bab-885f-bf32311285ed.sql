-- Créer le cron job pour vérifier les planifications de blog toutes les minutes
SELECT cron.schedule(
  'blog-scheduler-check',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/blog-scheduler-cron',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg5ODIyNCwiZXhwIjoyMDY1NDc0MjI0fQ.YOUR_SERVICE_ROLE_KEY_HERE'
    ),
    body:='{}'::jsonb
  );
  $$
);
