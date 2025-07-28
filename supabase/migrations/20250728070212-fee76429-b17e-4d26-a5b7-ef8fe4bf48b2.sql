-- Ajouter les colonnes manquantes à la table optional_modules_config
ALTER TABLE public.optional_modules_config 
ADD COLUMN IF NOT EXISTS module_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Package',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Module',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS pricing_monthly NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_yearly NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_plans JSONB DEFAULT '["basic", "premium", "enterprise"]'::jsonb;

-- Mettre à jour les données existantes avec des valeurs par défaut
UPDATE public.optional_modules_config 
SET 
  module_name = CASE 
    WHEN id = 'pos' THEN 'POS Avancé'
    WHEN id = 'ecommerce' THEN 'Module E-commerce'
    WHEN id = 'buyback' THEN 'Module Rachat'
    WHEN id = 'ai_diagnostic' THEN 'IA Diagnostic'
    WHEN id = 'monitoring' THEN 'Monitoring Business'
    WHEN id = 'advertising' THEN 'Publicité IA'
    ELSE 'Module'
  END,
  description = CASE 
    WHEN id = 'pos' THEN 'Point de vente complet avec gestion NF-525'
    WHEN id = 'ecommerce' THEN 'Boutique en ligne avec gestion des commandes'
    WHEN id = 'buyback' THEN 'Système de rachat d''appareils avec évaluation IA'
    WHEN id = 'ai_diagnostic' THEN 'Assistant IA pour le pré-diagnostic'
    WHEN id = 'monitoring' THEN 'Surveillance temps réel de votre activité'
    WHEN id = 'advertising' THEN 'Gestion automatisée des campagnes publicitaires'
    ELSE 'Description du module'
  END,
  icon = CASE 
    WHEN id = 'pos' THEN 'Smartphone'
    WHEN id = 'ecommerce' THEN 'ShoppingCart'
    WHEN id = 'buyback' THEN 'Euro'
    WHEN id = 'ai_diagnostic' THEN 'Brain'
    WHEN id = 'monitoring' THEN 'TrendingUp'
    WHEN id = 'advertising' THEN 'Megaphone'
    ELSE 'Package'
  END,
  category = CASE 
    WHEN id = 'pos' THEN 'Système POS'
    WHEN id = 'ecommerce' THEN 'E-commerce'
    WHEN id = 'buyback' THEN 'Rachat'
    WHEN id = 'ai_diagnostic' THEN 'IA'
    WHEN id = 'monitoring' THEN 'Analytics'
    WHEN id = 'advertising' THEN 'Marketing'
    ELSE 'Général'
  END,
  features = CASE 
    WHEN id = 'pos' THEN '["Interface tactile", "Archivage NF-525", "Gestion sessions"]'::jsonb
    WHEN id = 'ecommerce' THEN '["Boutique personnalisée", "Paiements Stripe", "Gestion commandes"]'::jsonb
    WHEN id = 'buyback' THEN '["Évaluation IA", "Grille de prix", "Gestion stocks"]'::jsonb
    WHEN id = 'ai_diagnostic' THEN '["Chatbot Ben", "Pré-diagnostic", "Base de connaissances"]'::jsonb
    WHEN id = 'monitoring' THEN '["Dashboard temps réel", "Alertes", "Métriques business"]'::jsonb
    WHEN id = 'advertising' THEN '["Campagnes auto", "Ciblage intelligent", "ROI optimisé"]'::jsonb
    ELSE '[]'::jsonb
  END,
  pricing_monthly = CASE 
    WHEN id = 'pos' THEN 49.90
    WHEN id = 'ecommerce' THEN 89.00
    WHEN id = 'buyback' THEN 39.00
    WHEN id = 'ai_diagnostic' THEN 0
    WHEN id = 'monitoring' THEN 0
    WHEN id = 'advertising' THEN 79.00
    ELSE 0
  END,
  pricing_yearly = CASE 
    WHEN id = 'pos' THEN 499.00
    WHEN id = 'ecommerce' THEN 890.00
    WHEN id = 'buyback' THEN 390.00
    WHEN id = 'ai_diagnostic' THEN 0
    WHEN id = 'monitoring' THEN 0
    WHEN id = 'advertising' THEN 790.00
    ELSE 0
  END,
  available_plans = CASE 
    WHEN id = 'ai_diagnostic' THEN '["basic", "premium", "enterprise"]'::jsonb
    WHEN id = 'monitoring' THEN '["enterprise"]'::jsonb
    ELSE '["premium", "enterprise"]'::jsonb
  END
WHERE module_name = '';

-- Insérer des modules par défaut s'ils n'existent pas
INSERT INTO public.optional_modules_config (
  id, module_name, description, icon, category, features, pricing_monthly, pricing_yearly, available_plans, is_active
) VALUES 
  ('pos', 'POS Avancé', 'Point de vente complet avec gestion NF-525', 'Smartphone', 'Système POS', 
   '["Interface tactile", "Archivage NF-525", "Gestion sessions"]'::jsonb, 49.90, 499.00, 
   '["premium", "enterprise"]'::jsonb, true),
  ('ecommerce', 'Module E-commerce', 'Boutique en ligne avec gestion des commandes', 'ShoppingCart', 'E-commerce', 
   '["Boutique personnalisée", "Paiements Stripe", "Gestion commandes"]'::jsonb, 89.00, 890.00, 
   '["premium", "enterprise"]'::jsonb, true),
  ('buyback', 'Module Rachat', 'Système de rachat d''appareils avec évaluation IA', 'Euro', 'Rachat', 
   '["Évaluation IA", "Grille de prix", "Gestion stocks"]'::jsonb, 39.00, 390.00, 
   '["premium", "enterprise"]'::jsonb, true),
  ('ai_diagnostic', 'IA Diagnostic', 'Assistant IA pour le pré-diagnostic', 'Brain', 'IA', 
   '["Chatbot Ben", "Pré-diagnostic", "Base de connaissances"]'::jsonb, 0, 0, 
   '["basic", "premium", "enterprise"]'::jsonb, true),
  ('monitoring', 'Monitoring Business', 'Surveillance temps réel de votre activité', 'TrendingUp', 'Analytics', 
   '["Dashboard temps réel", "Alertes", "Métriques business"]'::jsonb, 0, 0, 
   '["enterprise"]'::jsonb, true),
  ('advertising', 'Publicité IA', 'Gestion automatisée des campagnes publicitaires', 'Megaphone', 'Marketing', 
   '["Campagnes auto", "Ciblage intelligent", "ROI optimisé"]'::jsonb, 79.00, 790.00, 
   '["premium", "enterprise"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;