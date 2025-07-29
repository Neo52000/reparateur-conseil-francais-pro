-- Migration finale d'optimisation et RLS policies manquantes

-- Ajouter RLS policies pour les nouvelles tables e-commerce
ALTER TABLE public.ecommerce_store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_products ENABLE ROW LEVEL SECURITY;

-- Policies pour ecommerce_store_config
CREATE POLICY "Repairers can manage their own store config" 
ON public.ecommerce_store_config 
FOR ALL 
USING (repairer_id = auth.uid()) 
WITH CHECK (repairer_id = auth.uid());

-- Policies pour ecommerce_settings
CREATE POLICY "Repairers can manage their own e-commerce settings" 
ON public.ecommerce_settings 
FOR ALL 
USING (repairer_id = auth.uid()) 
WITH CHECK (repairer_id = auth.uid());

-- Policies pour ecommerce_products
CREATE POLICY "Repairers can manage their own products" 
ON public.ecommerce_products 
FOR ALL 
USING (repairer_id = auth.uid()) 
WITH CHECK (repairer_id = auth.uid());

CREATE POLICY "Public can view active products" 
ON public.ecommerce_products 
FOR SELECT 
USING (is_active = true);

-- Optimisation des index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ecommerce_store_config_repairer_id ON public.ecommerce_store_config(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_settings_repairer_id ON public.ecommerce_settings(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_repairer_id ON public.ecommerce_products(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_sku ON public.ecommerce_products(sku);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_active ON public.ecommerce_products(is_active) WHERE is_active = true;

-- Index pour les performances des profils utilisateurs
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Fonction pour nettoyer le cache obsolète
CREATE OR REPLACE FUNCTION public.cleanup_old_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Cette fonction peut être appelée périodiquement pour nettoyer les caches
  -- Actuellement vide, peut être étendue selon les besoins
  NULL;
END;
$$;

-- Trigger pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux nouvelles tables si elles ont updated_at
CREATE TRIGGER update_ecommerce_store_config_updated_at
    BEFORE UPDATE ON public.ecommerce_store_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_settings_updated_at
    BEFORE UPDATE ON public.ecommerce_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_products_updated_at
    BEFORE UPDATE ON public.ecommerce_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();