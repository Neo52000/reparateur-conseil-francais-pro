-- Migration finale - Ajout des index de performance uniquement

-- Index pour améliorer les performances des requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ecommerce_store_config_repairer_id ON public.ecommerce_store_config(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_settings_repairer_id ON public.ecommerce_settings(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_repairer_id ON public.ecommerce_products(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_sku ON public.ecommerce_products(sku);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_active ON public.ecommerce_products(is_active) WHERE is_active = true;

-- Index pour les performances des profils utilisateurs
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Index pour les requêtes de synchronisation POS/E-commerce  
CREATE INDEX IF NOT EXISTS idx_pos_inventory_items_repairer_id ON public.pos_inventory_items(repairer_id);
CREATE INDEX IF NOT EXISTS idx_pos_inventory_items_sku ON public.pos_inventory_items(sku);

-- Fonction utilitaire pour nettoyer le cache (à utiliser plus tard si nécessaire)
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