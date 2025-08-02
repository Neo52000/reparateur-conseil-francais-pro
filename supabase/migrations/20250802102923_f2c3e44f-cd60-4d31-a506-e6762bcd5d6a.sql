-- Phase 3: Créer uniquement les nouvelles tables manquantes

-- Table pour les sauvegardes système
CREATE TABLE IF NOT EXISTS public.system_backups (
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
CREATE TABLE IF NOT EXISTS public.restore_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_name TEXT NOT NULL,
  point_type TEXT NOT NULL DEFAULT 'automatic',
  snapshot_data JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le statut des services système
CREATE TABLE IF NOT EXISTS public.system_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  service_status TEXT NOT NULL DEFAULT 'running',
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Table pour les utilisateurs système
CREATE TABLE IF NOT EXISTS public.system_users (
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

-- Activer RLS pour les nouvelles tables
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restore_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
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

-- Insérer quelques services système par défaut si pas déjà présents
INSERT INTO public.system_services (service_name, service_status) 
VALUES 
('database', 'running'),
('cache', 'running'),
('auth', 'running'),
('storage', 'running'),
('api', 'running')
ON CONFLICT (service_name) DO NOTHING;