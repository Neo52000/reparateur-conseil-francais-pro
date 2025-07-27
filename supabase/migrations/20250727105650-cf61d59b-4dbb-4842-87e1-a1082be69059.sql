-- Create monitoring tables for TopReparateurs Checkmate clone

-- Main monitors table
CREATE TABLE public.monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('http', 'ping', 'dns', 'ssl', 'infrastructure', 'business_metric', 'seo_rank', 'client_satisfaction')),
  url TEXT,
  method TEXT DEFAULT 'GET',
  headers JSONB DEFAULT '{}',
  body TEXT,
  expected_status_codes INTEGER[] DEFAULT '{200}',
  timeout_seconds INTEGER DEFAULT 30,
  check_interval_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  repairer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settings JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.monitors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can manage their own monitors" 
ON public.monitors 
FOR ALL 
USING (repairer_id = auth.uid());

-- Monitor results table
CREATE TABLE public.monitor_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID NOT NULL REFERENCES public.monitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('up', 'down', 'degraded', 'unknown')),
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location TEXT DEFAULT 'fr-paris',
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.monitor_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can view their monitor results" 
ON public.monitor_results 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.monitors 
  WHERE monitors.id = monitor_results.monitor_id 
  AND monitors.repairer_id = auth.uid()
));

-- Incidents table
CREATE TABLE public.monitor_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID NOT NULL REFERENCES public.monitors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  notifications_sent JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitor_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can manage their monitor incidents" 
ON public.monitor_incidents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.monitors 
  WHERE monitors.id = monitor_incidents.monitor_id 
  AND monitors.repairer_id = auth.uid()
));

-- Notification channels table
CREATE TABLE public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'webhook', 'slack', 'discord')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can manage their notification channels" 
ON public.notification_channels 
FOR ALL 
USING (repairer_id = auth.uid());

-- Business metrics table (exclusive feature)
CREATE TABLE public.business_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('revenue', 'orders', 'customers', 'satisfaction', 'seo_rank', 'conversion_rate')),
  current_value NUMERIC,
  target_value NUMERIC,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  unit TEXT DEFAULT '',
  data_source TEXT NOT NULL,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can manage their business metrics" 
ON public.business_metrics 
FOR ALL 
USING (repairer_id = auth.uid());

-- Status pages table (exclusive feature)
CREATE TABLE public.status_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  custom_domain TEXT,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  theme_config JSONB DEFAULT '{}',
  monitors_config JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.status_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Repairers can manage their status pages" 
ON public.status_pages 
FOR ALL 
USING (repairer_id = auth.uid());

CREATE POLICY "Anyone can view public status pages" 
ON public.status_pages 
FOR SELECT 
USING (is_public = true AND is_active = true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON public.monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitor_incidents_updated_at BEFORE UPDATE ON public.monitor_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_channels_updated_at BEFORE UPDATE ON public.notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_metrics_updated_at BEFORE UPDATE ON public.business_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_status_pages_updated_at BEFORE UPDATE ON public.status_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_monitors_repairer_id ON public.monitors(repairer_id);
CREATE INDEX idx_monitors_type ON public.monitors(type);
CREATE INDEX idx_monitor_results_monitor_id ON public.monitor_results(monitor_id);
CREATE INDEX idx_monitor_results_checked_at ON public.monitor_results(checked_at);
CREATE INDEX idx_monitor_incidents_monitor_id ON public.monitor_incidents(monitor_id);
CREATE INDEX idx_business_metrics_repairer_id ON public.business_metrics(repairer_id);
CREATE INDEX idx_status_pages_repairer_id ON public.status_pages(repairer_id);
CREATE INDEX idx_status_pages_slug ON public.status_pages(slug);