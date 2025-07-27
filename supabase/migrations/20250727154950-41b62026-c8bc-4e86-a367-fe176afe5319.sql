-- Création de la table pour la configuration des modules optionnels
CREATE TABLE public.optional_modules_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  pricing_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  pricing_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_plans TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.optional_modules_config ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins uniquement
CREATE POLICY "Admins can manage optional modules config"
ON public.optional_modules_config
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE TRIGGER update_optional_modules_config_updated_at
  BEFORE UPDATE ON public.optional_modules_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des configurations par défaut
INSERT INTO public.optional_modules_config (module_id, is_active, pricing_monthly, pricing_yearly, available_plans) VALUES
('pos', true, 49.90, 499.00, '{"premium", "enterprise"}'),
('ecommerce', true, 89.00, 890.00, '{"premium", "enterprise"}'),
('buyback', true, 39.00, 390.00, '{"premium", "enterprise"}'),
('ai_diagnostic', true, 0.00, 0.00, '{"basic", "premium", "enterprise"}'),
('monitoring', true, 0.00, 0.00, '{"enterprise"}'),
('advertising', true, 79.00, 790.00, '{"premium", "enterprise"}');