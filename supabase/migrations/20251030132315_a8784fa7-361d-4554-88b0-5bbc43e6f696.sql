-- =====================================================
-- MIGRATION : Automatisation Blog Hebdomadaire
-- =====================================================

-- 1. Créer la table de configuration
CREATE TABLE IF NOT EXISTS blog_automation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT true,
  category_id UUID REFERENCES blog_categories(id),
  auto_publish BOOLEAN DEFAULT false,
  schedule_time TEXT DEFAULT '08:00',
  schedule_day INTEGER DEFAULT 1,
  ai_model TEXT DEFAULT 'google/gemini-2.5-flash',
  prompt_template TEXT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insérer la configuration par défaut
INSERT INTO blog_automation_config (
  enabled,
  category_id,
  auto_publish,
  schedule_time,
  schedule_day,
  ai_model,
  prompt_template
) VALUES (
  false,
  (SELECT id FROM blog_categories WHERE slug = 'actualites-reparation'),
  false,
  '08:00',
  1,
  'google/gemini-2.5-flash',
  'Actualités hebdomadaires de la réparation mobile et smartphone'
) ON CONFLICT DO NOTHING;

-- 3. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_blog_automation_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_automation_config_updated_at ON blog_automation_config;
CREATE TRIGGER blog_automation_config_updated_at
  BEFORE UPDATE ON blog_automation_config
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_automation_config_updated_at();

-- 4. RLS Policies
ALTER TABLE blog_automation_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view automation config" ON blog_automation_config;
CREATE POLICY "Admins can view automation config"
  ON blog_automation_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
      AND user_roles.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update automation config" ON blog_automation_config;
CREATE POLICY "Admins can update automation config"
  ON blog_automation_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
      AND user_roles.is_active = true
    )
  );

-- 5. Créer le cron job
SELECT cron.unschedule('weekly-blog-automation') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-blog-automation'
);

SELECT cron.schedule(
  'weekly-blog-automation',
  '0 8 * * 1',
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/weekly-blog-automation',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body:=jsonb_build_object(
          'auto_publish', false,
          'test_mode', false
        )
    ) as request_id;
  $$
);

-- 6. Fonction pour obtenir le statut du cron
CREATE OR REPLACE FUNCTION get_blog_automation_status()
RETURNS TABLE(
  enabled BOOLEAN,
  schedule TEXT,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as enabled,
    j.schedule,
    (SELECT MAX(start_time) FROM cron.job_run_details WHERE jobid = j.jobid) as last_run,
    NULL::TIMESTAMPTZ as next_run,
    (SELECT status FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_status,
    (SELECT return_message FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1) as last_error
  FROM cron.job j
  WHERE j.jobname = 'weekly-blog-automation';
END;
$$ LANGUAGE plpgsql;

-- 7. Vue pour l'historique du cron
CREATE OR REPLACE VIEW blog_automation_cron_history AS
SELECT 
  jr.jobid,
  j.jobname,
  jr.runid,
  jr.status,
  jr.return_message,
  jr.start_time,
  jr.end_time,
  EXTRACT(EPOCH FROM (jr.end_time - jr.start_time)) as duration_seconds
FROM cron.job_run_details jr
JOIN cron.job j ON j.jobid = jr.jobid
WHERE j.jobname = 'weekly-blog-automation'
ORDER BY jr.start_time DESC;