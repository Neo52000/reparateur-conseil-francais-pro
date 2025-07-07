-- Migration pour synchroniser les fonctionnalités entre admin et plans réparateurs

-- 1. Créer une table pour les fonctionnalités disponibles
CREATE TABLE IF NOT EXISTS public.available_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Créer une table pour lier les plans aux fonctionnalités
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL CHECK (plan_name IN ('Gratuit', 'Basique', 'Premium', 'Enterprise')),
  feature_key TEXT NOT NULL REFERENCES public.available_features(feature_key) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  feature_limit INTEGER, -- Pour les fonctionnalités avec limites (ex: nombre de produits)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_name, feature_key)
);

-- 3. Insérer les fonctionnalités de base depuis les constantes
INSERT INTO public.available_features (feature_key, feature_name, category, description) VALUES
-- Fonctionnalités système
('demo_mode_enabled', 'Mode démo activé', 'Système', 'Active le mode démonstration'),

-- Fonctionnalités de base
('search_brand_model', 'Recherche par marque ET modèle spécifique', 'Base', 'Recherche avancée par marque et modèle'),
('filter_issue_type', 'Filtres par type de panne', 'Base', 'Filtrage des réparateurs par type de problème'),
('geolocation', 'Géolocalisation automatique', 'Base', 'Localisation automatique de l''utilisateur'),
('sorting_advanced', 'Tri par distance, prix, délai ou note', 'Base', 'Options de tri avancées'),

-- Modules POS (€49.90/mois)
('pos_system_enabled', 'Système POS complet', 'POS', 'Accès au système de point de vente'),
('pos_cash_register', 'Caisse enregistreuse NF-525', 'POS', 'Caisse conforme à la réglementation française'),
('pos_inventory_sync', 'Synchronisation inventaire temps réel', 'POS', 'Sync automatique des stocks'),
('pos_appointments_sync', 'Synchronisation rendez-vous bidirectionnelle', 'POS', 'Sync des RDV entre systèmes'),
('pos_repairs_management', 'Gestion réparations centralisée', 'POS', 'Gestion complète des réparations'),
('pos_customer_database', 'Base clients unifiée', 'POS', 'Base de données clients centralisée'),
('pos_billing_integration', 'Facturation intégrée NF-525', 'POS', 'Facturation conforme'),
('pos_offline_mode', 'Mode hors ligne avec synchronisation', 'POS', 'Fonctionnement sans connexion'),

-- Modules E-commerce (€89/mois)
('ecommerce_storefront', 'Boutique en ligne personnalisée', 'E-commerce', 'Site e-commerce sur mesure'),
('ecommerce_product_catalog', 'Catalogue produits synchronisé', 'E-commerce', 'Catalogue sync avec le POS'),
('ecommerce_order_management', 'Gestion commandes e-commerce', 'E-commerce', 'Gestion des commandes en ligne'),
('ecommerce_payment_integration', 'Paiements en ligne Stripe', 'E-commerce', 'Intégration paiements sécurisés'),
('ecommerce_seo_tools', 'Outils SEO et marketing', 'E-commerce', 'Optimisation référencement'),
('ecommerce_custom_domain', 'Sous-domaine personnalisé', 'E-commerce', 'URL personnalisée'),
('ecommerce_analytics', 'Analytics e-commerce avancées', 'E-commerce', 'Statistiques détaillées ventes'),

-- Fonctionnalités client
('client_dashboard', 'Espace client complet avec tableau de bord', 'Client', 'Interface client complète'),
('repair_history', 'Historique des réparations', 'Client', 'Suivi des réparations passées'),
('appointments_management', 'Gestion des rendez-vous', 'Client', 'Prise et gestion de RDV'),
('favorites_system', 'Système de favoris', 'Client', 'Sauvegarde des réparateurs préférés'),

-- Fonctionnalités réparateur
('repairer_dashboard', 'Tableau de bord réparateur complet', 'Réparateur', 'Interface pro complète'),
('orders_management', 'Gestion des commandes avec statuts', 'Réparateur', 'Suivi des commandes'),
('billing_system', 'Système de facturation intégré', 'Réparateur', 'Génération de factures'),
('parts_inventory', 'Gestion des stocks de pièces', 'Réparateur', 'Inventaire des pièces détachées'),

-- Analytics
('performance_stats', 'Statistiques de performance', 'Analytics', 'Métriques de performance'),
('financial_reports', 'Rapports financiers (CA, marge)', 'Analytics', 'Analyses financières'),
('detailed_analytics', 'Analytics détaillé', 'Analytics', 'Analyses approfondies'),

-- Communication
('realtime_notifications', 'Système de notifications en temps réel', 'Communication', 'Notifications instantanées'),
('integrated_chat', 'Chat intégré entre clients et réparateurs', 'Communication', 'Messagerie intégrée'),
('client_support', 'Support client', 'Communication', 'Service client dédié')

ON CONFLICT (feature_key) DO NOTHING;

-- 4. Configuration par défaut des fonctionnalités par plan
INSERT INTO public.plan_features (plan_name, feature_key, enabled, feature_limit) VALUES
-- Plan Gratuit (fonctionnalités de base limitées)
('Gratuit', 'search_brand_model', true, NULL),
('Gratuit', 'filter_issue_type', true, NULL),
('Gratuit', 'geolocation', true, NULL),
('Gratuit', 'demo_mode_enabled', true, NULL),

-- Plan Basique (fonctionnalités de base + quelques extras)
('Basique', 'search_brand_model', true, NULL),
('Basique', 'filter_issue_type', true, NULL),
('Basique', 'geolocation', true, NULL),
('Basique', 'sorting_advanced', true, NULL),
('Basique', 'client_dashboard', true, NULL),
('Basique', 'repair_history', true, 10), -- Limité à 10 réparations
('Basique', 'appointments_management', true, NULL),
('Basique', 'repairer_dashboard', true, NULL),
('Basique', 'performance_stats', true, NULL),

-- Plan Premium (toutes les fonctionnalités de base + extras)
('Premium', 'search_brand_model', true, NULL),
('Premium', 'filter_issue_type', true, NULL),
('Premium', 'geolocation', true, NULL),
('Premium', 'sorting_advanced', true, NULL),
('Premium', 'client_dashboard', true, NULL),
('Premium', 'repair_history', true, 50), -- Limité à 50 réparations
('Premium', 'appointments_management', true, NULL),
('Premium', 'favorites_system', true, NULL),
('Premium', 'repairer_dashboard', true, NULL),
('Premium', 'orders_management', true, NULL),
('Premium', 'billing_system', true, NULL),
('Premium', 'performance_stats', true, NULL),
('Premium', 'financial_reports', true, NULL),
('Premium', 'realtime_notifications', true, NULL),
('Premium', 'client_support', true, NULL),

-- Plan Enterprise (toutes les fonctionnalités)
('Enterprise', 'search_brand_model', true, NULL),
('Enterprise', 'filter_issue_type', true, NULL),
('Enterprise', 'geolocation', true, NULL),
('Enterprise', 'sorting_advanced', true, NULL),
('Enterprise', 'client_dashboard', true, NULL),
('Enterprise', 'repair_history', true, NULL), -- Illimité
('Enterprise', 'appointments_management', true, NULL),
('Enterprise', 'favorites_system', true, NULL),
('Enterprise', 'repairer_dashboard', true, NULL),
('Enterprise', 'orders_management', true, NULL),
('Enterprise', 'billing_system', true, NULL),
('Enterprise', 'parts_inventory', true, NULL),
('Enterprise', 'performance_stats', true, NULL),
('Enterprise', 'financial_reports', true, NULL),
('Enterprise', 'detailed_analytics', true, NULL),
('Enterprise', 'realtime_notifications', true, NULL),
('Enterprise', 'integrated_chat', true, NULL),
('Enterprise', 'client_support', true, NULL)

ON CONFLICT (plan_name, feature_key) DO NOTHING;

-- 5. Mettre à jour la table subscription_plans pour synchroniser les prix
UPDATE public.subscription_plans SET 
  price_monthly = CASE 
    WHEN name = 'Gratuit' THEN 0.00
    WHEN name = 'Basique' THEN 29.00
    WHEN name = 'Premium' THEN 59.00
    WHEN name = 'Enterprise' THEN 149.00
    ELSE price_monthly
  END,
  price_yearly = CASE 
    WHEN name = 'Gratuit' THEN 0.00
    WHEN name = 'Basique' THEN 290.00
    WHEN name = 'Premium' THEN 590.00
    WHEN name = 'Enterprise' THEN 1490.00
    ELSE price_yearly
  END,
  features = CASE 
    WHEN name = 'Gratuit' THEN '["Profil de base", "Recherche de base", "Support email"]'::jsonb
    WHEN name = 'Basique' THEN '["Profil complet", "Recherche avancée", "Tableau de bord", "Support email", "Analytics de base"]'::jsonb
    WHEN name = 'Premium' THEN '["Tout du plan Basique", "Gestion commandes", "Facturation", "Notifications temps réel", "Support prioritaire"]'::jsonb
    WHEN name = 'Enterprise' THEN '["Tout du plan Premium", "Analytics avancés", "Chat intégré", "API access", "Support dédié"]'::jsonb
    ELSE features
  END;

-- 6. Créer une table pour les prix des modules
CREATE TABLE IF NOT EXISTS public.module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_type TEXT NOT NULL CHECK (module_type IN ('pos', 'ecommerce')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  module_price DECIMAL(10,2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_type, billing_cycle)
);

-- Insérer les prix des modules
INSERT INTO public.module_pricing (module_type, billing_cycle, module_price) VALUES
('pos', 'monthly', 49.90),
('pos', 'yearly', 499.00),
('ecommerce', 'monthly', 89.00),
('ecommerce', 'yearly', 890.00)
ON CONFLICT (module_type, billing_cycle) DO UPDATE SET 
  module_price = EXCLUDED.module_price,
  updated_at = now();

-- 7. Créer des triggers pour maintenir updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les triggers
DROP TRIGGER IF EXISTS update_available_features_updated_at ON public.available_features;
CREATE TRIGGER update_available_features_updated_at 
    BEFORE UPDATE ON public.available_features 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_plan_features_updated_at ON public.plan_features;
CREATE TRIGGER update_plan_features_updated_at 
    BEFORE UPDATE ON public.plan_features 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_pricing_updated_at ON public.module_pricing;
CREATE TRIGGER update_module_pricing_updated_at 
    BEFORE UPDATE ON public.module_pricing 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Activer RLS sur les nouvelles tables
ALTER TABLE public.available_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_pricing ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS
-- Fonctionnalités disponibles - lecture publique
CREATE POLICY "Public can view available features" 
  ON public.available_features FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage available features" 
  ON public.available_features FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Configuration des fonctionnalités par plan - lecture publique, modification admin
CREATE POLICY "Public can view plan features" 
  ON public.plan_features FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage plan features" 
  ON public.plan_features FOR ALL 
  USING (get_current_user_role() = 'admin');

-- Prix des modules - lecture publique, modification admin
CREATE POLICY "Public can view module pricing" 
  ON public.module_pricing FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage module pricing" 
  ON public.module_pricing FOR ALL 
  USING (get_current_user_role() = 'admin');