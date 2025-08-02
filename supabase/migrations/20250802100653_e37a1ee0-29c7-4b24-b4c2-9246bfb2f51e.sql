-- Créer les tables pour remplacer les données mockées

-- Table pour les statistiques de cache système
CREATE TABLE public.system_cache_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_size_mb NUMERIC NOT NULL DEFAULT 0,
  hit_ratio NUMERIC NOT NULL DEFAULT 0,
  miss_ratio NUMERIC NOT NULL DEFAULT 0,
  operations_per_second INTEGER NOT NULL DEFAULT 0,
  memory_usage_percent NUMERIC NOT NULL DEFAULT 0,
  disk_usage_percent NUMERIC NOT NULL DEFAULT 0,
  active_keys INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les entrées de cache
CREATE TABLE public.system_cache_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL,
  size_mb NUMERIC NOT NULL DEFAULT 0,
  hit_count INTEGER NOT NULL DEFAULT 0,
  ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la synchronisation de catalogue  
CREATE TABLE public.catalog_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  synced_items INTEGER NOT NULL DEFAULT 0,
  pending_items INTEGER NOT NULL DEFAULT 0,
  error_items INTEGER NOT NULL DEFAULT 0,
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  sync_interval INTEGER NOT NULL DEFAULT 3600,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les éléments de catalogue
CREATE TABLE public.catalog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les logs de campagnes de relance
CREATE TABLE public.relaunch_campaign_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  trigger_event TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  emails_sent INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les activités récentes
CREATE TABLE public.recent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  repairer_id UUID,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.system_cache_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relaunch_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les admins uniquement sur le cache système
CREATE POLICY "Admins can manage cache stats" ON public.system_cache_stats
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage cache entries" ON public.system_cache_entries
  FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques pour les réparateurs
CREATE POLICY "Repairers can manage their catalog sync" ON public.catalog_sync_status
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their catalog items" ON public.catalog_items
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their campaign logs" ON public.relaunch_campaign_logs
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Users can view their activities" ON public.recent_activities
  FOR SELECT USING (user_id = auth.uid() OR repairer_id = auth.uid());

CREATE POLICY "System can insert activities" ON public.recent_activities
  FOR INSERT WITH CHECK (true);

-- Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_cache_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cache_stats_updated_at
  BEFORE UPDATE ON public.system_cache_stats
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();

CREATE TRIGGER update_cache_entries_updated_at
  BEFORE UPDATE ON public.system_cache_entries
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();

CREATE TRIGGER update_catalog_sync_updated_at
  BEFORE UPDATE ON public.catalog_sync_status
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();

CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();

CREATE TRIGGER update_relaunch_logs_updated_at
  BEFORE UPDATE ON public.relaunch_campaign_logs
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();