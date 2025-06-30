
-- Activer les extensions nécessaires pour le cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer une tâche cron qui nettoie les logs d'audit tous les jours à 2h du matin
-- Garde les logs des 90 derniers jours par défaut
SELECT cron.schedule(
  'cleanup-audit-logs-daily',
  '0 2 * * *', -- tous les jours à 2h00
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/cleanup-audit-logs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc"}'::jsonb,
        body:='{"daysToKeep": 90}'::jsonb
    ) as request_id;
  $$
);

-- Créer une table pour stocker la configuration de nettoyage
CREATE TABLE IF NOT EXISTS public.audit_cleanup_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  days_to_keep INTEGER NOT NULL DEFAULT 90,
  auto_cleanup_enabled BOOLEAN NOT NULL DEFAULT true,
  last_cleanup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer la configuration par défaut
INSERT INTO public.audit_cleanup_config (days_to_keep, auto_cleanup_enabled)
VALUES (90, true)
ON CONFLICT DO NOTHING;

-- Activer RLS sur la table de configuration
ALTER TABLE public.audit_cleanup_config ENABLE ROW LEVEL SECURITY;

-- Policy pour que seuls les admins puissent voir et modifier la configuration
CREATE POLICY "Only admins can manage audit cleanup config" 
  ON public.audit_cleanup_config 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
