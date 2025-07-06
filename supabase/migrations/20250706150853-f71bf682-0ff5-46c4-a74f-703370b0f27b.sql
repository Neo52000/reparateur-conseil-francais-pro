-- Module Backend SEO & Monitoring Technique
-- Tables pour la surveillance et l'optimisation SEO automatisée

-- Table de configuration globale du monitoring SEO
CREATE TABLE public.seo_monitoring_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  google_search_console_token TEXT,
  monitoring_enabled BOOLEAN NOT NULL DEFAULT true,
  sitemap_auto_update BOOLEAN NOT NULL DEFAULT true,
  alert_webhooks JSONB NOT NULL DEFAULT '{}',
  performance_thresholds JSONB NOT NULL DEFAULT '{"response_time": 1000, "availability": 99.5}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des URLs à surveiller
CREATE TABLE public.monitored_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  url_type TEXT NOT NULL, -- 'seo_page', 'repairer_profile', 'search', 'homepage'
  reference_id UUID, -- lien vers local_seo_pages ou repairers
  priority INTEGER NOT NULL DEFAULT 5, -- 1-10 (10 = critique)
  last_check TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table historique des vérifications de santé
CREATE TABLE public.url_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitored_url_id UUID NOT NULL REFERENCES public.monitored_urls(id) ON DELETE CASCADE,
  check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  http_status INTEGER,
  response_time_ms INTEGER,
  is_indexable BOOLEAN,
  has_noindex BOOLEAN,
  has_canonical BOOLEAN,
  meta_title_length INTEGER,
  meta_description_length INTEGER,
  h1_count INTEGER,
  errors JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]'
);

-- Table des alertes SEO
CREATE TABLE public.seo_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'error_404', 'slow_response', 'noindex_detected', 'missing_meta'
  url TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'ignored'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table de l'historique des sitemaps
CREATE TABLE public.sitemap_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sitemap_content TEXT NOT NULL,
  urls_count INTEGER NOT NULL,
  submitted_to_google BOOLEAN NOT NULL DEFAULT false,
  google_submission_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_monitored_urls_type ON public.monitored_urls(url_type);
CREATE INDEX idx_monitored_urls_active ON public.monitored_urls(is_active);
CREATE INDEX idx_url_health_checks_timestamp ON public.url_health_checks(check_timestamp);
CREATE INDEX idx_seo_alerts_status ON public.seo_alerts(status);
CREATE INDEX idx_seo_alerts_severity ON public.seo_alerts(severity);

-- RLS Policies
ALTER TABLE public.seo_monitoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitemap_history ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent accéder aux données SEO
CREATE POLICY "Admins can manage SEO monitoring config" ON public.seo_monitoring_config FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admins can manage monitored URLs" ON public.monitored_urls FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admins can view health checks" ON public.url_health_checks FOR SELECT USING (get_current_user_role() = 'admin');
CREATE POLICY "Admins can manage SEO alerts" ON public.seo_alerts FOR ALL USING (get_current_user_role() = 'admin');
CREATE POLICY "Admins can view sitemap history" ON public.sitemap_history FOR SELECT USING (get_current_user_role() = 'admin');

-- Edge Functions peuvent insérer des données de monitoring
CREATE POLICY "Edge functions can insert health checks" ON public.url_health_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Edge functions can insert alerts" ON public.seo_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Edge functions can insert sitemap history" ON public.sitemap_history FOR INSERT WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_seo_monitoring_config_updated_at
  BEFORE UPDATE ON public.seo_monitoring_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitored_urls_updated_at
  BEFORE UPDATE ON public.monitored_urls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour ajouter automatiquement les URLs à surveiller
CREATE OR REPLACE FUNCTION public.add_url_to_monitoring(
  url_to_monitor TEXT,
  url_type_param TEXT,
  reference_id_param UUID DEFAULT NULL,
  priority_param INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  url_id UUID;
BEGIN
  INSERT INTO public.monitored_urls (url, url_type, reference_id, priority)
  VALUES (url_to_monitor, url_type_param, reference_id_param, priority_param)
  ON CONFLICT (url) DO UPDATE SET
    url_type = EXCLUDED.url_type,
    reference_id = EXCLUDED.reference_id,
    priority = EXCLUDED.priority,
    updated_at = now()
  RETURNING id INTO url_id;
  
  RETURN url_id;
END;
$$;

-- Initialiser la configuration par défaut
INSERT INTO public.seo_monitoring_config (id, monitoring_enabled, sitemap_auto_update)
VALUES (gen_random_uuid(), true, true)
ON CONFLICT DO NOTHING;