-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_ui_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

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
$$ LANGUAGE plpgsql SET search_path = '';

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