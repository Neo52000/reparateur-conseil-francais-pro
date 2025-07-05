-- Créer la table des templates e-commerce et POS
CREATE TABLE public.ecommerce_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ecommerce',
  template_type TEXT NOT NULL DEFAULT 'theme',
  template_data JSONB NOT NULL DEFAULT '{}',
  preview_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.ecommerce_templates ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Admins can manage all templates"
ON public.ecommerce_templates
FOR ALL
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view active templates"
ON public.ecommerce_templates
FOR SELECT
USING (is_active = true);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_ecommerce_templates_updated_at
  BEFORE UPDATE ON public.ecommerce_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques templates de démonstration
INSERT INTO public.ecommerce_templates (name, description, category, template_type, template_data, is_premium) VALUES
('Thème Moderne E-commerce', 'Thème moderne et responsive pour boutiques e-commerce', 'ecommerce', 'theme', '{"colors": {"primary": "#007bff", "secondary": "#6c757d"}, "layout": "modern", "features": ["responsive", "seo-optimized"]}', true),
('Layout POS Classique', 'Interface utilisateur classique pour systèmes POS', 'pos', 'layout', '{"sidebar": true, "theme": "light", "shortcuts": ["F1", "F2", "F3"]}', false),
('Widget Panier Avancé', 'Widget de panier avec fonctionnalités avancées', 'ecommerce', 'widget', '{"animations": true, "auto_save": true, "quick_checkout": true}', true),
('Composant Facturation', 'Composant de facturation pour POS', 'pos', 'component', '{"tax_calculation": true, "discount_support": true, "multi_payment": true}', false);