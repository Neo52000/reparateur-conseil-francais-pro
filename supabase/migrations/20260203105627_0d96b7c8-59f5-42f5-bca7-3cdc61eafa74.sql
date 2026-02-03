-- Create profile_templates table for storing repairer profile templates
CREATE TABLE public.profile_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  preview_image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read, admins can manage (using user_roles table)
CREATE POLICY "Anyone can view profile templates"
  ON public.profile_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage profile templates"
  ON public.profile_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_profile_templates_updated_at
  BEFORE UPDATE ON public.profile_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default template
CREATE UNIQUE INDEX idx_profile_templates_single_default 
  ON public.profile_templates (is_default) 
  WHERE is_default = true;

-- Insert default template with all widgets
INSERT INTO public.profile_templates (name, description, is_default, widgets, theme_data) VALUES (
  'Template Standard',
  'Template par défaut avec tous les widgets disponibles',
  true,
  '[
    {"id": "widget-header", "type": "header", "name": "En-tête", "icon": "User", "order": 0, "isVisible": true, "visibilityRules": {"minPlan": "Gratuit", "blurIfNotAllowed": false, "hideIfNotAllowed": false}, "styles": {}},
    {"id": "widget-about", "type": "about", "name": "À propos", "icon": "FileText", "order": 1, "isVisible": true, "visibilityRules": {"minPlan": "Visibilité", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Visibilité pour voir la présentation"}, "styles": {}},
    {"id": "widget-contact", "type": "contact", "name": "Contact", "icon": "Phone", "order": 2, "isVisible": true, "visibilityRules": {"minPlan": "Visibilité", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Visibilité pour voir les coordonnées"}, "styles": {}},
    {"id": "widget-photos", "type": "photos", "name": "Photos", "icon": "Image", "order": 3, "isVisible": true, "visibilityRules": {"minPlan": "Visibilité", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Visibilité pour voir les photos"}, "styles": {}},
    {"id": "widget-hours", "type": "hours", "name": "Horaires", "icon": "Clock", "order": 4, "isVisible": true, "visibilityRules": {"minPlan": "Visibilité", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Visibilité pour voir les horaires"}, "styles": {}},
    {"id": "widget-services", "type": "services", "name": "Services", "icon": "Wrench", "order": 5, "isVisible": true, "visibilityRules": {"minPlan": "Gratuit", "blurIfNotAllowed": false, "hideIfNotAllowed": false}, "styles": {}},
    {"id": "widget-pricing", "type": "pricing", "name": "Tarifs", "icon": "Euro", "order": 6, "isVisible": true, "visibilityRules": {"minPlan": "Pro", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Pro pour voir la grille tarifaire"}, "styles": {}},
    {"id": "widget-certifications", "type": "certifications", "name": "Certifications", "icon": "Award", "order": 7, "isVisible": true, "visibilityRules": {"minPlan": "Gratuit", "blurIfNotAllowed": false, "hideIfNotAllowed": false}, "styles": {}},
    {"id": "widget-map", "type": "map", "name": "Carte", "icon": "MapPin", "order": 8, "isVisible": true, "visibilityRules": {"minPlan": "Pro", "blurIfNotAllowed": true, "hideIfNotAllowed": false, "customMessage": "Passez au plan Pro pour voir la carte"}, "styles": {}},
    {"id": "widget-reviews", "type": "reviews", "name": "Avis", "icon": "Star", "order": 9, "isVisible": true, "visibilityRules": {"minPlan": "Gratuit", "blurIfNotAllowed": false, "hideIfNotAllowed": false}, "styles": {}}
  ]'::jsonb,
  '{"primaryColor": "217 91% 60%", "accentColor": "142 76% 36%", "fontFamily": "Inter", "spacing": "normal"}'::jsonb
);