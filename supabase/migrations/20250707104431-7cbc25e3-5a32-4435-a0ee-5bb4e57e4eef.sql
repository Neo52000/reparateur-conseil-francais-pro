-- Ajout du pricing manquant pour les modules e-commerce dans la migration
INSERT INTO public.module_pricing (module_type, billing_cycle, module_price) VALUES
('ecommerce', 'yearly', 890.00)
ON CONFLICT (module_type, billing_cycle) DO UPDATE SET 
  module_price = EXCLUDED.module_price,
  updated_at = now();

-- Ajout des fonctionnalités des modules dans les plans
INSERT INTO public.plan_features (plan_name, feature_key, enabled) VALUES
-- Modules POS pour les plans Premium et Enterprise
('Premium', 'pos_system_enabled', true),
('Premium', 'pos_cash_register', true),
('Premium', 'pos_inventory_sync', true),
('Enterprise', 'pos_system_enabled', true),
('Enterprise', 'pos_cash_register', true),
('Enterprise', 'pos_inventory_sync', true),
('Enterprise', 'pos_appointments_sync', true),
('Enterprise', 'pos_repairs_management', true),
('Enterprise', 'pos_customer_database', true),
('Enterprise', 'pos_billing_integration', true),
('Enterprise', 'pos_offline_mode', true),

-- Modules E-commerce pour le plan Enterprise
('Enterprise', 'ecommerce_storefront', true),
('Enterprise', 'ecommerce_product_catalog', true),
('Enterprise', 'ecommerce_order_management', true),
('Enterprise', 'ecommerce_payment_integration', true),
('Enterprise', 'ecommerce_seo_tools', true),
('Enterprise', 'ecommerce_custom_domain', true),
('Enterprise', 'ecommerce_analytics', true)

ON CONFLICT (plan_name, feature_key) DO NOTHING;

-- Activer le realtime sur les tables importantes pour la synchronisation
ALTER PUBLICATION supabase_realtime ADD TABLE subscription_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE module_pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE plan_features;

-- Définir REPLICA IDENTITY FULL pour capturer toutes les données lors des mises à jour
ALTER TABLE subscription_plans REPLICA IDENTITY FULL;
ALTER TABLE module_pricing REPLICA IDENTITY FULL;
ALTER TABLE plan_features REPLICA IDENTITY FULL;