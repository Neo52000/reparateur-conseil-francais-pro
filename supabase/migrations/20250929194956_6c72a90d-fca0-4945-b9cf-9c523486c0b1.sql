-- Phase A & B: Tables pour alertes, rapports, exports programmés et logs d'accès

-- Table des alertes NF203
CREATE TABLE IF NOT EXISTS public.nf203_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('chain_broken', 'missing_timestamp', 'archive_expiring', 'closure_due', 'low_compliance')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des rapports de conformité
CREATE TABLE IF NOT EXISTS public.nf203_compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_invoices INTEGER DEFAULT 0,
  chained_invoices INTEGER DEFAULT 0,
  compliance_rate NUMERIC DEFAULT 0,
  chain_integrity_checks JSONB DEFAULT '[]',
  periods_closed INTEGER DEFAULT 0,
  archives_created INTEGER DEFAULT 0,
  fec_exports INTEGER DEFAULT 0,
  alerts_count INTEGER DEFAULT 0,
  report_data JSONB NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des exports programmés
CREATE TABLE IF NOT EXISTS public.nf203_scheduled_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('fec_monthly', 'fec_quarterly', 'fec_annual', 'archives_monthly', 'archives_quarterly')),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  next_execution TIMESTAMP WITH TIME ZONE,
  last_execution TIMESTAMP WITH TIME ZONE,
  auto_download BOOLEAN DEFAULT false,
  email_notification BOOLEAN DEFAULT true,
  storage_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des logs d'accès aux archives (RGPD)
CREATE TABLE IF NOT EXISTS public.nf203_archive_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id UUID NOT NULL REFERENCES public.nf203_archives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'export', 'verify', 'search')),
  ip_address INET,
  user_agent TEXT,
  access_reason TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_nf203_alerts_repairer ON public.nf203_alerts(repairer_id);
CREATE INDEX IF NOT EXISTS idx_nf203_alerts_status ON public.nf203_alerts(status);
CREATE INDEX IF NOT EXISTS idx_nf203_alerts_severity ON public.nf203_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_nf203_alerts_created ON public.nf203_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nf203_reports_repairer ON public.nf203_compliance_reports(repairer_id);
CREATE INDEX IF NOT EXISTS idx_nf203_reports_period ON public.nf203_compliance_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_nf203_reports_type ON public.nf203_compliance_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_nf203_scheduled_repairer ON public.nf203_scheduled_exports(repairer_id);
CREATE INDEX IF NOT EXISTS idx_nf203_scheduled_active ON public.nf203_scheduled_exports(is_active);
CREATE INDEX IF NOT EXISTS idx_nf203_scheduled_next ON public.nf203_scheduled_exports(next_execution);

CREATE INDEX IF NOT EXISTS idx_nf203_access_logs_archive ON public.nf203_archive_access_logs(archive_id);
CREATE INDEX IF NOT EXISTS idx_nf203_access_logs_user ON public.nf203_archive_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nf203_access_logs_created ON public.nf203_archive_access_logs(created_at DESC);

-- Vue admin pour monitoring global
CREATE OR REPLACE VIEW public.nf203_admin_overview AS
SELECT 
  rp.id as repairer_id,
  rp.business_name as repairer_name,
  rp.city as repairer_city,
  COUNT(DISTINCT ei.id) as total_invoices,
  COUNT(DISTINCT eic.id) as chained_invoices,
  COUNT(DISTINCT na.id) as archives_count,
  COUNT(DISTINCT npc.id) as closures_count,
  MAX(npc.closure_date) as last_closure,
  COUNT(DISTINCT alerts.id) FILTER (WHERE alerts.status = 'active') as active_alerts,
  COUNT(DISTINCT alerts.id) FILTER (WHERE alerts.severity = 'critical') as critical_alerts,
  (COUNT(DISTINCT eic.id)::numeric / NULLIF(COUNT(DISTINCT ei.id), 0) * 100) as compliance_rate,
  MAX(ei.created_at) as last_invoice_date,
  MAX(na.created_at) as last_archive_date
FROM public.repairer_profiles rp
LEFT JOIN public.electronic_invoices ei ON ei.repairer_id = rp.user_id
LEFT JOIN public.electronic_invoices_chain eic ON eic.repairer_id = rp.user_id
LEFT JOIN public.nf203_archives na ON na.repairer_id = rp.user_id
LEFT JOIN public.nf203_period_closures npc ON npc.repairer_id = rp.user_id
LEFT JOIN public.nf203_alerts alerts ON alerts.repairer_id = rp.user_id
GROUP BY rp.id, rp.business_name, rp.city;

-- RLS Policies pour nf203_alerts
ALTER TABLE public.nf203_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their own alerts"
ON public.nf203_alerts FOR SELECT
USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can acknowledge their alerts"
ON public.nf203_alerts FOR UPDATE
USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "System can create alerts"
ON public.nf203_alerts FOR INSERT
WITH CHECK (true);

-- RLS Policies pour nf203_compliance_reports
ALTER TABLE public.nf203_compliance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their reports"
ON public.nf203_compliance_reports FOR SELECT
USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "System can create reports"
ON public.nf203_compliance_reports FOR INSERT
WITH CHECK (true);

-- RLS Policies pour nf203_scheduled_exports
ALTER TABLE public.nf203_scheduled_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers manage their scheduled exports"
ON public.nf203_scheduled_exports FOR ALL
USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

-- RLS Policies pour nf203_archive_access_logs
ALTER TABLE public.nf203_archive_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view access logs for their archives"
ON public.nf203_archive_access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.nf203_archives
    WHERE id = archive_id AND repairer_id = auth.uid()
  ) OR get_current_user_role() = 'admin'
);

CREATE POLICY "System can log archive access"
ON public.nf203_archive_access_logs FOR INSERT
WITH CHECK (true);

-- Trigger pour updated_at sur scheduled_exports
CREATE OR REPLACE FUNCTION update_nf203_scheduled_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nf203_scheduled_exports_updated_at
BEFORE UPDATE ON public.nf203_scheduled_exports
FOR EACH ROW
EXECUTE FUNCTION update_nf203_scheduled_exports_updated_at();