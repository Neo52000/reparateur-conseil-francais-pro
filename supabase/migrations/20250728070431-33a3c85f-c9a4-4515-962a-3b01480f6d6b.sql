-- Ajouter les colonnes manquantes à la table optional_modules_config
ALTER TABLE public.optional_modules_config 
ADD COLUMN IF NOT EXISTS module_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Package',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Module',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';

-- Convertir available_plans d'ARRAY vers JSONB avec la bonne syntaxe
ALTER TABLE public.optional_modules_config 
ALTER COLUMN available_plans TYPE JSONB USING to_jsonb(available_plans);

-- Mettre à jour les données existantes avec des valeurs par défaut
UPDATE public.optional_modules_config 
SET 
  module_name = CASE 
    WHEN module_id = 'pos' THEN 'POS Avancé'
    WHEN module_id = 'ecommerce' THEN 'Module E-commerce'
    WHEN module_id = 'buyback' THEN 'Module Rachat'
    WHEN module_id = 'ai_diagnostic' THEN 'IA Diagnostic'
    WHEN module_id = 'monitoring' THEN 'Monitoring Business'
    WHEN module_id = 'advertising' THEN 'Publicité IA'
    ELSE 'Module'
  END,
  description = CASE 
    WHEN module_id = 'pos' THEN 'Point de vente complet avec gestion NF-525'
    WHEN module_id = 'ecommerce' THEN 'Boutique en ligne avec gestion des commandes'
    WHEN module_id = 'buyback' THEN 'Système de rachat d''appareils avec évaluation IA'
    WHEN module_id = 'ai_diagnostic' THEN 'Assistant IA pour le pré-diagnostic'
    WHEN module_id = 'monitoring' THEN 'Surveillance temps réel de votre activité'
    WHEN module_id = 'advertising' THEN 'Gestion automatisée des campagnes publicitaires'
    ELSE 'Description du module'
  END,
  icon = CASE 
    WHEN module_id = 'pos' THEN 'Smartphone'
    WHEN module_id = 'ecommerce' THEN 'ShoppingCart'
    WHEN module_id = 'buyback' THEN 'Euro'
    WHEN module_id = 'ai_diagnostic' THEN 'Brain'
    WHEN module_id = 'monitoring' THEN 'TrendingUp'
    WHEN module_id = 'advertising' THEN 'Megaphone'
    ELSE 'Package'
  END,
  category = CASE 
    WHEN module_id = 'pos' THEN 'Système POS'
    WHEN module_id = 'ecommerce' THEN 'E-commerce'
    WHEN module_id = 'buyback' THEN 'Rachat'
    WHEN module_id = 'ai_diagnostic' THEN 'IA'
    WHEN module_id = 'monitoring' THEN 'Analytics'
    WHEN module_id = 'advertising' THEN 'Marketing'
    ELSE 'Général'
  END,
  features = CASE 
    WHEN module_id = 'pos' THEN '["Interface tactile", "Archivage NF-525", "Gestion sessions"]'::jsonb
    WHEN module_id = 'ecommerce' THEN '["Boutique personnalisée", "Paiements Stripe", "Gestion commandes"]'::jsonb
    WHEN module_id = 'buyback' THEN '["Évaluation IA", "Grille de prix", "Gestion stocks"]'::jsonb
    WHEN module_id = 'ai_diagnostic' THEN '["Chatbot Ben", "Pré-diagnostic", "Base de connaissances"]'::jsonb
    WHEN module_id = 'monitoring' THEN '["Dashboard temps réel", "Alertes", "Métriques business"]'::jsonb
    WHEN module_id = 'advertising' THEN '["Campagnes auto", "Ciblage intelligent", "ROI optimisé"]'::jsonb
    ELSE '[]'::jsonb
  END,
  pricing_monthly = CASE 
    WHEN module_id = 'pos' THEN 49.90
    WHEN module_id = 'ecommerce' THEN 89.00
    WHEN module_id = 'buyback' THEN 39.00
    WHEN module_id = 'ai_diagnostic' THEN 0
    WHEN module_id = 'monitoring' THEN 0
    WHEN module_id = 'advertising' THEN 79.00
    ELSE 0
  END,
  pricing_yearly = CASE 
    WHEN module_id = 'pos' THEN 499.00
    WHEN module_id = 'ecommerce' THEN 890.00
    WHEN module_id = 'buyback' THEN 390.00
    WHEN module_id = 'ai_diagnostic' THEN 0
    WHEN module_id = 'monitoring' THEN 0
    WHEN module_id = 'advertising' THEN 790.00
    ELSE 0
  END,
  available_plans = CASE 
    WHEN module_id = 'ai_diagnostic' THEN '["basic", "premium", "enterprise"]'::jsonb
    WHEN module_id = 'monitoring' THEN '["enterprise"]'::jsonb
    ELSE '["premium", "enterprise"]'::jsonb
  END,
  color = CASE 
    WHEN module_id = 'pos' THEN 'blue'
    WHEN module_id = 'ecommerce' THEN 'blue'
    WHEN module_id = 'buyback' THEN 'green'
    WHEN module_id = 'ai_diagnostic' THEN 'purple'
    WHEN module_id = 'monitoring' THEN 'orange'
    WHEN module_id = 'advertising' THEN 'red'
    ELSE 'blue'
  END
WHERE module_name = '';

-- Insérer des modules par défaut s'ils n'existent pas
INSERT INTO public.optional_modules_config (
  module_id, module_name, description, icon, category, features, pricing_monthly, pricing_yearly, available_plans, is_active, color
) VALUES 
  ('pos', 'POS Avancé', 'Point de vente complet avec gestion NF-525', 'Smartphone', 'Système POS', 
   '["Interface tactile", "Archivage NF-525", "Gestion sessions"]'::jsonb, 49.90, 499.00, 
   '["premium", "enterprise"]'::jsonb, true, 'blue'),
  ('ecommerce', 'Module E-commerce', 'Boutique en ligne avec gestion des commandes', 'ShoppingCart', 'E-commerce', 
   '["Boutique personnalisée", "Paiements Stripe", "Gestion commandes"]'::jsonb, 89.00, 890.00, 
   '["premium", "enterprise"]'::jsonb, true, 'blue'),
  ('buyback', 'Module Rachat', 'Système de rachat d''appareils avec évaluation IA', 'Euro', 'Rachat', 
   '["Évaluation IA", "Grille de prix", "Gestion stocks"]'::jsonb, 39.00, 390.00, 
   '["premium", "enterprise"]'::jsonb, true, 'green'),
  ('ai_diagnostic', 'IA Diagnostic', 'Assistant IA pour le pré-diagnostic', 'Brain', 'IA', 
   '["Chatbot Ben", "Pré-diagnostic", "Base de connaissances"]'::jsonb, 0, 0, 
   '["basic", "premium", "enterprise"]'::jsonb, true, 'purple'),
  ('monitoring', 'Monitoring Business', 'Surveillance temps réel de votre activité', 'TrendingUp', 'Analytics', 
   '["Dashboard temps réel", "Alertes", "Métriques business"]'::jsonb, 0, 0, 
   '["enterprise"]'::jsonb, true, 'orange'),
  ('advertising', 'Publicité IA', 'Gestion automatisée des campagnes publicitaires', 'Megaphone', 'Marketing', 
   '["Campagnes auto", "Ciblage intelligent", "ROI optimisé"]'::jsonb, 79.00, 790.00, 
   '["premium", "enterprise"]'::jsonb, true, 'red')
ON CONFLICT (module_id) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  features = EXCLUDED.features,
  color = EXCLUDED.color;