-- Phase 2: Tables pour les composants partiellement mockés

-- Table pour les clés API
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les endpoints API
CREATE TABLE public.api_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les intégrations
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les logs d'audit détaillés
CREATE TABLE public.detailed_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les rapports de conformité
CREATE TABLE public.compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  generated_by UUID,
  report_data JSONB DEFAULT '{}',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Activer RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Repairers manage their API keys" ON public.api_keys
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Everyone can view API endpoints" ON public.api_endpoints
  FOR SELECT USING (true);

CREATE POLICY "Admins manage endpoints" ON public.api_endpoints
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers manage their integrations" ON public.integrations
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Users view their audit logs" ON public.detailed_audit_logs
  FOR SELECT USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Admins manage compliance reports" ON public.compliance_reports
  FOR ALL USING (get_current_user_role() = 'admin');

-- Triggers
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_cache_stats_updated_at();