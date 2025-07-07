-- Ajouter les feature flags manquants pour les modules POS et E-commerce
INSERT INTO public.feature_flags_by_plan (plan_name, feature_key, enabled) VALUES
-- Modules POS - désactivés pour Gratuit et Basique, activés pour Premium et Enterprise
('Gratuit', 'pos_system_enabled', false),
('Basique', 'pos_system_enabled', false),
('Premium', 'pos_system_enabled', true),
('Enterprise', 'pos_system_enabled', true),

-- Modules E-commerce - désactivés pour Gratuit et Basique, activés pour Premium et Enterprise
('Gratuit', 'ecommerce_system_enabled', false),
('Basique', 'ecommerce_system_enabled', false),
('Premium', 'ecommerce_system_enabled', true),
('Enterprise', 'ecommerce_system_enabled', true),

-- Fonctionnalités additionnelles POS pour Enterprise
('Enterprise', 'pos_advanced_features', true),
('Enterprise', 'pos_inventory_management', true),
('Enterprise', 'pos_reporting_advanced', true),

-- Fonctionnalités additionnelles E-commerce pour Enterprise  
('Enterprise', 'ecommerce_advanced_features', true),
('Enterprise', 'ecommerce_seo_tools', true),
('Enterprise', 'ecommerce_analytics_advanced', true)

ON CONFLICT (plan_name, feature_key) DO UPDATE SET 
  enabled = EXCLUDED.enabled,
  updated_at = now();