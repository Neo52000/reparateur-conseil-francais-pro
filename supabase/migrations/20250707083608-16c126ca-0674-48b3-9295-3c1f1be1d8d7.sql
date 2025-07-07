-- Ajout de données factices pour le réparateur démo (demo@demo.fr)
-- ID utilisateur: 370c5b16-ae21-46eb-8b4c-960984cb5ab4

-- 1. Articles d'inventaire POS - Pièces détachées iPhone
INSERT INTO pos_inventory_items (
  repairer_id, sku, name, description, category, brand, 
  cost_price, selling_price, retail_price, current_stock, minimum_stock, maximum_stock,
  location, shelf_position, is_active, is_trackable, weight
) VALUES 
-- Écrans iPhone
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP14-LCD-BLK', 'Écran iPhone 14 Noir', 'Écran LCD original iPhone 14 avec tactile', 'Écrans', 'Apple', 85.00, 120.00, 150.00, 15, 5, 50, 'Magasin Principal', 'A1-001', true, true, 0.2),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP13-LCD-BLK', 'Écran iPhone 13 Noir', 'Écran LCD original iPhone 13 avec tactile', 'Écrans', 'Apple', 75.00, 110.00, 140.00, 12, 5, 50, 'Magasin Principal', 'A1-002', true, true, 0.2),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP12-LCD-BLK', 'Écran iPhone 12 Noir', 'Écran LCD original iPhone 12 avec tactile', 'Écrans', 'Apple', 65.00, 95.00, 120.00, 20, 5, 50, 'Magasin Principal', 'A1-003', true, true, 0.2),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IPXR-LCD-BLK', 'Écran iPhone XR Noir', 'Écran LCD compatible iPhone XR', 'Écrans', 'Compatible', 45.00, 70.00, 90.00, 8, 3, 30, 'Magasin Principal', 'A1-004', true, true, 0.18),

-- Batteries iPhone
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP14-BAT', 'Batterie iPhone 14', 'Batterie Li-ion 3279mAh iPhone 14', 'Batteries', 'Apple', 25.00, 45.00, 60.00, 25, 10, 100, 'Magasin Principal', 'B1-001', true, true, 0.05),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP13-BAT', 'Batterie iPhone 13', 'Batterie Li-ion 3240mAh iPhone 13', 'Batteries', 'Apple', 22.00, 40.00, 55.00, 30, 10, 100, 'Magasin Principal', 'B1-002', true, true, 0.05),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'IP12-BAT', 'Batterie iPhone 12', 'Batterie Li-ion 2815mAh iPhone 12', 'Batteries', 'Apple', 20.00, 35.00, 50.00, 18, 8, 80, 'Magasin Principal', 'B1-003', true, true, 0.05),

-- Écrans Samsung
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'S23-OLED-BLK', 'Écran Samsung S23 Noir', 'Écran OLED original Samsung Galaxy S23', 'Écrans', 'Samsung', 95.00, 140.00, 180.00, 10, 3, 30, 'Magasin Principal', 'A2-001', true, true, 0.15),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'S22-OLED-BLK', 'Écran Samsung S22 Noir', 'Écran OLED original Samsung Galaxy S22', 'Écrans', 'Samsung', 85.00, 125.00, 160.00, 8, 3, 25, 'Magasin Principal', 'A2-002', true, true, 0.15),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'S21-OLED-BLK', 'Écran Samsung S21 Noir', 'Écran OLED original Samsung Galaxy S21', 'Écrans', 'Samsung', 75.00, 110.00, 140.00, 12, 4, 30, 'Magasin Principal', 'A2-003', true, true, 0.15),

-- Batteries Samsung
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'S23-BAT', 'Batterie Samsung S23', 'Batterie Li-ion 3900mAh Galaxy S23', 'Batteries', 'Samsung', 18.00, 32.00, 45.00, 22, 8, 60, 'Magasin Principal', 'B2-001', true, true, 0.06),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'S22-BAT', 'Batterie Samsung S22', 'Batterie Li-ion 3700mAh Galaxy S22', 'Batteries', 'Samsung', 16.00, 28.00, 40.00, 15, 8, 60, 'Magasin Principal', 'B2-002', true, true, 0.06),

-- Coques et protections
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'COQUE-IP14-SIL', 'Coque iPhone 14 Silicone', 'Coque de protection silicone iPhone 14', 'Accessoires', 'Generic', 3.50, 12.00, 18.00, 50, 20, 200, 'Magasin Principal', 'C1-001', true, true, 0.03),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'VERRE-IP14', 'Verre trempé iPhone 14', 'Protection écran verre trempé iPhone 14', 'Accessoires', 'Generic', 1.50, 8.00, 12.00, 80, 30, 300, 'Magasin Principal', 'C1-002', true, true, 0.01),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'COQUE-S23-SIL', 'Coque Samsung S23 Silicone', 'Coque de protection silicone Galaxy S23', 'Accessoires', 'Generic', 3.00, 11.00, 16.00, 35, 15, 150, 'Magasin Principal', 'C2-001', true, true, 0.03),

-- Outils et consommables
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'TOOL-SCREWSET', 'Kit tournevis précision', 'Kit de tournevis de précision pour réparation', 'Outils', 'Generic', 8.00, 25.00, 35.00, 10, 3, 20, 'Atelier', 'D1-001', true, false, 0.2),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'ADHES-DOUBLE', 'Adhésif double face', 'Adhésif double face pour écrans', 'Consommables', 'Generic', 2.00, 5.00, 8.00, 45, 20, 100, 'Atelier', 'D1-002', true, true, 0.01),
('370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 'ALCOOL-ISO', 'Alcool isopropylique 99%', 'Alcool isopropylique pour nettoyage 500ml', 'Consommables', 'Generic', 3.50, 8.00, 12.00, 12, 5, 30, 'Atelier', 'D1-003', true, true, 0.5);