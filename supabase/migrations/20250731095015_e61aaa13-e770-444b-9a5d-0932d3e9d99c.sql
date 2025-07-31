-- Create UI configuration tables for the enhanced admin interfaces

-- Table for storing UI configurations and themes
CREATE TABLE public.ui_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('plan_visualization', 'repairer_dashboard')),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Table for A/B testing configurations
CREATE TABLE public.ui_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  control_config_id UUID REFERENCES public.ui_configurations(id),
  variant_config_id UUID REFERENCES public.ui_configurations(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  traffic_split NUMERIC NOT NULL DEFAULT 0.5 CHECK (traffic_split >= 0 AND traffic_split <= 1),
  target_audience JSONB DEFAULT '{}',
  success_metrics JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for UI analytics and metrics
CREATE TABLE public.ui_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id UUID REFERENCES public.ui_configurations(id),
  ab_test_id UUID REFERENCES public.ui_ab_tests(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  user_id UUID,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_url TEXT,
  user_agent TEXT,
  device_type TEXT,
  conversion_value NUMERIC,
  metadata JSONB DEFAULT '{}'
);

-- Table for UI themes and design tokens
CREATE TABLE public.ui_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  theme_data JSONB NOT NULL DEFAULT '{}',
  css_variables JSONB DEFAULT '{}',
  tailwind_config JSONB DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  preview_image_url TEXT,
  accessibility_score NUMERIC CHECK (accessibility_score >= 0 AND accessibility_score <= 100)
);

-- Table for configuration templates
CREATE TABLE public.ui_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  description TEXT
);

-- Table for configuration history and versioning
CREATE TABLE public.ui_configuration_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id UUID REFERENCES public.ui_configurations(id),
  version INTEGER NOT NULL,
  configuration_snapshot JSONB NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ui_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_configuration_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for UI configurations
CREATE POLICY "Admins can manage all UI configurations"
ON public.ui_configurations FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view active configurations"
ON public.ui_configurations FOR SELECT
USING (is_active = true OR get_current_user_role() = 'admin');

-- RLS Policies for A/B tests
CREATE POLICY "Admins can manage A/B tests"
ON public.ui_ab_tests FOR ALL
USING (get_current_user_role() = 'admin');

-- RLS Policies for analytics
CREATE POLICY "Admins can manage analytics"
ON public.ui_analytics FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert analytics"
ON public.ui_analytics FOR INSERT
WITH CHECK (true);

-- RLS Policies for themes
CREATE POLICY "Admins can manage themes"
ON public.ui_themes FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view themes"
ON public.ui_themes FOR SELECT
USING (true);

-- RLS Policies for templates
CREATE POLICY "Admins can manage templates"
ON public.ui_templates FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view templates"
ON public.ui_templates FOR SELECT
USING (true);

-- RLS Policies for configuration history
CREATE POLICY "Admins can view configuration history"
ON public.ui_configuration_history FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert configuration history"
ON public.ui_configuration_history FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ui_configurations_type ON public.ui_configurations(type);
CREATE INDEX idx_ui_configurations_active ON public.ui_configurations(is_active);
CREATE INDEX idx_ui_ab_tests_status ON public.ui_ab_tests(status);
CREATE INDEX idx_ui_analytics_timestamp ON public.ui_analytics(timestamp);
CREATE INDEX idx_ui_analytics_config_id ON public.ui_analytics(configuration_id);
CREATE INDEX idx_ui_themes_default ON public.ui_themes(is_default);

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_ui_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ui_configurations_updated_at
  BEFORE UPDATE ON public.ui_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_ui_updated_at();

CREATE TRIGGER update_ui_ab_tests_updated_at
  BEFORE UPDATE ON public.ui_ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_ui_updated_at();

CREATE TRIGGER update_ui_themes_updated_at
  BEFORE UPDATE ON public.ui_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_ui_updated_at();

CREATE TRIGGER update_ui_templates_updated_at
  BEFORE UPDATE ON public.ui_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_ui_updated_at();

-- Function to create configuration history on updates
CREATE OR REPLACE FUNCTION public.create_ui_configuration_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ui_configuration_history (
    configuration_id,
    version,
    configuration_snapshot,
    change_summary,
    changed_by
  ) VALUES (
    OLD.id,
    OLD.version,
    to_jsonb(OLD),
    'Configuration updated',
    auth.uid()
  );
  
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_ui_configuration_history_trigger
  BEFORE UPDATE ON public.ui_configurations
  FOR EACH ROW EXECUTE FUNCTION public.create_ui_configuration_history();

-- Insert default templates
INSERT INTO public.ui_templates (name, category, template_data, description, tags) VALUES
('Default Professional', 'plan_visualization', '{"colorScheme": "professional", "layout": "grid", "animations": true}', 'Template professionnel par défaut', '{"professional", "clean", "default"}'),
('Seasonal Christmas', 'plan_visualization', '{"colorScheme": "christmas", "layout": "grid", "animations": true, "theme": "festive"}', 'Thème de Noël avec couleurs festives', '{"seasonal", "christmas", "festive"}'),
('Summer Promotion', 'plan_visualization', '{"colorScheme": "summer", "layout": "card", "animations": true, "theme": "bright"}', 'Thème estival pour promotions', '{"seasonal", "summer", "promotion"}'),
('Mobile First', 'repairer_dashboard', '{"layout": "mobile", "compactMode": true, "sidebarCollapsed": true}', 'Optimisé pour les appareils mobiles', '{"mobile", "responsive", "compact"}'),
('Desktop Pro', 'repairer_dashboard', '{"layout": "desktop", "compactMode": false, "sidebarExpanded": true}', 'Interface desktop complète', '{"desktop", "professional", "full-featured"}');

-- Insert default theme
INSERT INTO public.ui_themes (name, type, theme_data, is_default, css_variables, description) VALUES
('Default Theme', 'system', 
'{"primaryColor": "#3b82f6", "secondaryColor": "#64748b", "accentColor": "#10b981"}',
true,
'{"--primary": "221 83% 53%", "--secondary": "215 16% 47%", "--accent": "160 84% 39%"}',
'Thème par défaut du système'
);