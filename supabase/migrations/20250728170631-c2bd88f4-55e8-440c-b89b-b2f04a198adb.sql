-- Créer table de configuration des boutiques e-commerce
CREATE TABLE IF NOT EXISTS public.ecommerce_store_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_description TEXT,
  store_url TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  theme_settings JSONB DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer table des paramètres e-commerce
CREATE TABLE IF NOT EXISTS public.ecommerce_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_methods JSONB DEFAULT '["stripe", "click_collect"]',
  shipping_zones JSONB DEFAULT '["local"]',
  tax_rate NUMERIC(5,2) DEFAULT 20.0,
  minimum_order_amount NUMERIC(10,2) DEFAULT 0,
  shipping_rates JSONB DEFAULT '{}',
  return_policy TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecommerce_store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_settings ENABLE ROW LEVEL SECURITY;

-- Policies pour ecommerce_store_config
CREATE POLICY "Repairers can manage their own store config" 
ON public.ecommerce_store_config 
FOR ALL 
USING (repairer_id = auth.uid());

-- Policies pour ecommerce_settings
CREATE POLICY "Repairers can manage their own ecommerce settings" 
ON public.ecommerce_settings 
FOR ALL 
USING (repairer_id = auth.uid());

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ecommerce_store_config_updated_at
    BEFORE UPDATE ON public.ecommerce_store_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_settings_updated_at
    BEFORE UPDATE ON public.ecommerce_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();