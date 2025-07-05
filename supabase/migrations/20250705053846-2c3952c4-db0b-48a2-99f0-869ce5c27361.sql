-- Créer les tables pour la gestion globale des modules POS et E-commerce

-- Table pour les paramètres POS globaux
CREATE TABLE public.global_pos_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Table pour les paramètres E-commerce globaux
CREATE TABLE public.global_ecommerce_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Table pour les templates de configuration
CREATE TABLE public.configuration_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'pos' ou 'ecommerce'
  template_data JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Table pour l'historique des déploiements
CREATE TABLE public.deployment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_type TEXT NOT NULL, -- 'pos', 'ecommerce'
  target_type TEXT NOT NULL, -- 'global', 'repairer', 'selective'
  target_ids TEXT[], -- IDs des réparateurs ciblés si sélectif
  configuration_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'deploying', 'completed', 'failed', 'rolled_back'
  deployed_by UUID REFERENCES auth.users(id),
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  rollback_data JSONB
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.global_pos_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_ecommerce_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les admins uniquement
CREATE POLICY "Only admins can manage global POS settings" 
  ON public.global_pos_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage global ecommerce settings" 
  ON public.global_ecommerce_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage configuration templates" 
  ON public.configuration_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage deployment history" 
  ON public.deployment_history 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Triggers pour updated_at
CREATE TRIGGER update_global_pos_settings_updated_at
  BEFORE UPDATE ON public.global_pos_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_ecommerce_settings_updated_at
  BEFORE UPDATE ON public.global_ecommerce_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuration_templates_updated_at
  BEFORE UPDATE ON public.configuration_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques paramètres par défaut pour POS
INSERT INTO public.global_pos_settings (setting_key, setting_value, description, category) VALUES
('default_currency', '{"currency": "EUR", "symbol": "€"}', 'Devise par défaut pour tous les POS', 'general'),
('tax_rate', '{"rate": 20, "type": "percentage"}', 'Taux de TVA par défaut', 'tax'),
('receipt_template', '{"header": "RepairHub POS", "footer": "Merci de votre visite", "logo": true}', 'Template de reçu par défaut', 'printing'),
('payment_methods', '{"cash": true, "card": true, "mobile": false}', 'Méthodes de paiement autorisées', 'payments'),
('sync_frequency', '{"minutes": 15}', 'Fréquence de synchronisation en minutes', 'sync');

-- Insérer quelques paramètres par défaut pour E-commerce
INSERT INTO public.global_ecommerce_settings (setting_key, setting_value, description, category) VALUES
('default_shipping', '{"free_threshold": 50, "standard_rate": 5.99}', 'Paramètres de livraison par défaut', 'shipping'),
('tax_settings', '{"include_tax": true, "display_tax": true}', 'Paramètres de taxation', 'tax'),
('store_template', '{"theme": "modern", "colors": {"primary": "#3b82f6", "secondary": "#64748b"}}', 'Template de boutique par défaut', 'design'),
('payment_gateways', '{"stripe": true, "paypal": false}', 'Gateways de paiement autorisés', 'payments'),
('product_moderation', '{"auto_approve": false, "require_images": true}', 'Règles de modération des produits', 'moderation');