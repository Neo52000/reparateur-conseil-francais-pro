-- Migration finale - Ajout des index de performance (corrigée)

-- Index pour améliorer les performances des requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_ecommerce_store_config_repairer_id ON public.ecommerce_store_config(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_settings_repairer_id ON public.ecommerce_settings(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_repairer_id ON public.ecommerce_products(repairer_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_products_sku ON public.ecommerce_products(sku);

-- Index pour les performances des profils utilisateurs
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Index pour les requêtes de synchronisation POS/E-commerce  
CREATE INDEX IF NOT EXISTS idx_pos_inventory_items_repairer_id ON public.pos_inventory_items(repairer_id);
CREATE INDEX IF NOT EXISTS idx_pos_inventory_items_sku ON public.pos_inventory_items(sku);