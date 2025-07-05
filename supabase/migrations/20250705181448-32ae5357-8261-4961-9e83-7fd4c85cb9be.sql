-- Phase 4 : Correction et intégration des données de démonstration

-- Données de démonstration pour l'inventaire POS
INSERT INTO pos_inventory_items (repairer_id, sku, name, description, category, brand, cost_price, selling_price, retail_price, current_stock, minimum_stock, is_active, is_trackable)
SELECT 
  id,
  'SCR-IP13-001',
  'Écran iPhone 13',
  'Écran LCD haute qualité pour iPhone 13 avec kit d''outils',
  'Écrans',
  'Apple',
  89.90,
  149.90,
  179.90,
  12,
  5,
  true,
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'BAT-SS21-001',
  'Batterie Samsung Galaxy S21',
  'Batterie lithium-ion originale Samsung Galaxy S21',
  'Batteries',
  'Samsung',
  45.50,
  89.90,
  119.90,
  8,
  3,
  true,
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'VIT-PROT-001',
  'Vitre de Protection Premium',
  'Verre trempé 9H avec applicateur sans bulles',
  'Accessoires',
  'Generic',
  8.50,
  25.00,
  35.00,
  25,
  10,
  true,
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'DIAG-COMP-001',
  'Diagnostic Complet',
  'Diagnostic complet hardware et software',
  'Services',
  'RepairHub',
  0.00,
  35.00,
  45.00,
  999,
  0,
  true,
  false
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'COQ-IP13-001',
  'Coque iPhone 13 Transparente',
  'Coque transparente anti-choc avec protection coins',
  'Accessoires',
  'Generic',
  5.90,
  15.90,
  22.90,
  15,
  5,
  true,
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'CAB-USBC-001',
  'Câble USB-C Rapide',
  'Câble USB-C 3A charge rapide et données 1m',
  'Accessoires',
  'Generic',
  4.50,
  12.50,
  18.50,
  20,
  8,
  true,
  true
FROM profiles WHERE email = 'demo@demo.fr';

-- Données de démonstration pour les produits E-commerce
INSERT INTO ecommerce_products (repairer_id, sku, name, slug, description, price, cost_price, stock_quantity, category, status, manage_stock, stock_status, shipping_required)
SELECT 
  id,
  'SCR-IP13-001',
  'Écran iPhone 13 - Réparation',
  'ecran-iphone-13-reparation',
  'Service de réparation d''écran iPhone 13. Écran LCD haute qualité, installation comprise. Garantie 6 mois.',
  149.90,
  89.90,
  50,
  'Réparations iPhone',
  'published',
  true,
  'in_stock',
  false
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'BAT-SS21-001',
  'Batterie Samsung Galaxy S21 - Réparation',
  'batterie-samsung-s21-reparation',
  'Remplacement de batterie Samsung Galaxy S21. Batterie originale, installation comprise. Garantie 12 mois.',
  89.90,
  45.50,
  30,
  'Réparations Samsung',
  'published',
  true,
  'in_stock',
  false
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'VIT-PROT-001',
  'Vitre de Protection Premium',
  'vitre-protection-premium',
  'Verre trempé 9H ultra-résistant. Protection maximale contre les chocs et rayures. Installation gratuite.',
  25.00,
  8.50,
  100,
  'Accessoires',
  'published',
  true,
  'in_stock',
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'DIAG-COMP-001',
  'Diagnostic Complet Smartphone',
  'diagnostic-complet-smartphone',
  'Diagnostic complet de votre smartphone. Analyse hardware et software approfondie. Rapport détaillé fourni.',
  35.00,
  0.00,
  999,
  'Services',
  'published',
  false,
  'in_stock',
  false
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'KIT-REP-001',
  'Kit de Réparation Universel',
  'kit-reparation-universel',
  'Kit complet d''outils de réparation pour smartphones. Tournevis, ventouses, médiators. Qualité professionnelle.',
  45.00,
  25.00,
  15,
  'Outils',
  'published',
  true,
  'in_stock',
  true
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'COQ-IP13-001',
  'Coque iPhone 13 Transparente Anti-Choc',
  'coque-iphone-13-transparente',
  'Coque transparente ultra-résistante pour iPhone 13. Protection 4 coins renforcée. Compatible MagSafe.',
  15.90,
  5.90,
  50,
  'Coques iPhone',
  'published',
  true,
  'in_stock',
  true
FROM profiles WHERE email = 'demo@demo.fr';

-- Données de démonstration pour les clients E-commerce
INSERT INTO ecommerce_customers (repairer_id, email, first_name, last_name, phone, marketing_consent, email_verified, total_orders, total_spent)
SELECT 
  id,
  'marie.dubois@email.fr',
  'Marie',
  'Dubois',
  '0123456789',
  true,
  true,
  3,
  245.70
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'pierre.martin@email.fr',
  'Pierre',
  'Martin',
  '0987654321',
  false,
  true,
  1,
  89.90
FROM profiles WHERE email = 'demo@demo.fr'
UNION ALL
SELECT 
  id,
  'sophie.bernard@email.fr',
  'Sophie',
  'Bernard',
  '0555123456',
  true,
  true,
  2,
  174.90
FROM profiles WHERE email = 'demo@demo.fr';

-- Créer une boutique de démonstration
INSERT INTO ecommerce_stores (repairer_id, store_name, domain, status, plan_type, monthly_orders, monthly_revenue, conversion_rate, store_settings)
SELECT 
  id,
  'RepairHub Demo Store',
  'demo-repairhub.repairhub.fr',
  'active',
  'pro',
  47,
  3240.50,
  3.2,
  jsonb_build_object(
    'theme', 'modern',
    'colors', jsonb_build_object('primary', '#3b82f6', 'secondary', '#64748b'),
    'currency', 'EUR',
    'shipping', jsonb_build_object('free_threshold', 50, 'standard_rate', 5.99),
    'tax_rate', 20.0,
    'payment_methods', jsonb_build_object('stripe', true, 'paypal', true)
  )
FROM profiles WHERE email = 'demo@demo.fr';

-- Créer un système POS de démonstration
INSERT INTO pos_systems (repairer_id, system_name, status, plan_type, monthly_revenue, total_transactions, settings)
SELECT 
  id,
  'RepairHub POS Demo',
  'active',
  'pro',
  2847.50,
  156,
  jsonb_build_object(
    'currency', jsonb_build_object('code', 'EUR', 'symbol', '€'),
    'tax_rate', 20.0,
    'receipt_template', jsonb_build_object(
      'header', 'RepairHub Demo',
      'footer', 'Merci de votre visite !',
      'show_logo', true
    ),
    'fiscal_compliance', jsonb_build_object(
      'nf525_enabled', true,
      'certification_number', 'NF525-DEMO-001'
    )
  )
FROM profiles WHERE email = 'demo@demo.fr';

-- Créer des commandes de démonstration
INSERT INTO ecommerce_orders (repairer_id, order_number, customer_email, customer_name, customer_phone, subtotal, tax_amount, total_amount, order_status, payment_status, payment_method, created_at)
SELECT 
  p.id,
  'ORD-20250105-001',
  'marie.dubois@email.fr',
  'Marie Dubois',
  '0123456789',
  149.90,
  29.98,
  179.88,
  'processing',
  'paid',
  'card',
  NOW() - INTERVAL '2 days'
FROM profiles p WHERE p.email = 'demo@demo.fr'
UNION ALL
SELECT 
  p.id,
  'ORD-20250104-001',
  'pierre.martin@email.fr',
  'Pierre Martin',
  '0987654321',
  89.90,
  17.98,
  107.88,
  'completed',
  'paid',
  'paypal',
  NOW() - INTERVAL '3 days'
FROM profiles p WHERE p.email = 'demo@demo.fr'
UNION ALL
SELECT 
  p.id,
  'ORD-20250103-001',
  'sophie.bernard@email.fr',
  'Sophie Bernard',
  '0555123456',
  70.90,
  14.18,
  85.08,
  'shipped',
  'paid',
  'card',
  NOW() - INTERVAL '5 days'
FROM profiles p WHERE p.email = 'demo@demo.fr';