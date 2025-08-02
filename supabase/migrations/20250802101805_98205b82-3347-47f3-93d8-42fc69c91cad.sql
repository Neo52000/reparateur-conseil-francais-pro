-- Phase 3: Tables pour éliminer les simulations

-- Table pour les configurations système
CREATE TABLE public.system_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les métriques de performance en temps réel
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Table pour les sauvegardes système
CREATE TABLE public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'full',
  file_size_bytes BIGINT,
  backup_status TEXT NOT NULL DEFAULT 'in_progress',
  backup_path TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les points de restauration
CREATE TABLE public.restore_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_name TEXT NOT NULL,
  point_type TEXT NOT NULL DEFAULT 'automatic',
  snapshot_data JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le statut des services système
CREATE TABLE public.system_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  service_status TEXT NOT NULL DEFAULT 'running',
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Table pour les utilisateurs avec leurs rôles détaillés
CREATE TABLE public.system_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restore_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (admin seulement pour la plupart)
CREATE POLICY "Admins manage system configs" ON public.system_configurations
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins view performance metrics" ON public.performance_metrics
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage backups" ON public.system_backups
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins manage restore points" ON public.restore_points
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins view system services" ON public.system_services
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can update services" ON public.system_services
  FOR ALL USING (true);

CREATE POLICY "Admins manage system users" ON public.system_users
  FOR ALL USING (get_current_user_role() = 'admin');

-- Insérer quelques configurations par défaut
INSERT INTO public.system_configurations (config_key, config_value, description) VALUES
('backup_retention_days', '30', 'Nombre de jours de rétention des sauvegardes'),
('max_concurrent_users', '1000', 'Nombre maximum d\'utilisateurs simultanés'),
('maintenance_mode', 'false', 'Mode maintenance activé/désactivé'),
('performance_monitoring', 'true', 'Surveillance des performances activée');

-- Insérer quelques services système par défaut
INSERT INTO public.system_services (service_name, service_status) VALUES
('database', 'running'),
('cache', 'running'),
('auth', 'running'),
('storage', 'running'),
('api', 'running');