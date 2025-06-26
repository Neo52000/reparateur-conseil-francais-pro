
-- Insertion des modèles d'appareils détaillés

-- iPhone (Apple smartphones)
WITH apple_brand AS (SELECT id FROM brands WHERE name = 'Apple'),
     smartphone_type AS (SELECT id FROM device_types WHERE name = 'Smartphone')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  smartphone_type.id,
  apple_brand.id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  'iOS',
  true
FROM apple_brand, smartphone_type, (VALUES
  ('iPhone 15 Pro Max', 'A3108', '2023-09-22', 6.7, '2796x1290', 'OLED', 4441),
  ('iPhone 15 Pro', 'A3107', '2023-09-22', 6.1, '2556x1179', 'OLED', 3274),
  ('iPhone 15', 'A3105', '2023-09-22', 6.1, '2556x1179', 'OLED', 3349),
  ('iPhone 14 Pro Max', 'A2895', '2022-09-16', 6.7, '2796x1290', 'OLED', 4323),
  ('iPhone 14', 'A2882', '2022-09-16', 6.1, '2532x1170', 'OLED', 3279),
  ('iPhone 13', 'A2633', '2021-09-24', 6.1, '2532x1170', 'OLED', 3240),
  ('iPhone 12', 'A2402', '2020-10-23', 6.1, '2532x1170', 'OLED', 2815)
) AS t(model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity);

-- Samsung Galaxy (Samsung smartphones)
WITH samsung_brand AS (SELECT id FROM brands WHERE name = 'Samsung'),
     smartphone_type AS (SELECT id FROM device_types WHERE name = 'Smartphone')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  smartphone_type.id,
  samsung_brand.id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  'Android',
  true
FROM samsung_brand, smartphone_type, (VALUES
  ('Galaxy S24 Ultra', 'SM-S928B', '2024-01-24', 6.8, '3120x1440', 'AMOLED', 5000),
  ('Galaxy S24+', 'SM-S926B', '2024-01-24', 6.7, '3120x1440', 'AMOLED', 4900),
  ('Galaxy S24', 'SM-S921B', '2024-01-24', 6.2, '2340x1080', 'AMOLED', 4000),
  ('Galaxy S23 Ultra', 'SM-S918B', '2023-02-17', 6.8, '3088x1440', 'AMOLED', 5000),
  ('Galaxy A54 5G', 'SM-A546B', '2023-03-24', 6.4, '2340x1080', 'Super AMOLED', 5000)
) AS t(model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity);

-- Autres smartphones (Xiaomi, Google)
WITH xiaomi_brand AS (SELECT id FROM brands WHERE name = 'Xiaomi'),
     google_brand AS (SELECT id FROM brands WHERE name = 'Google'),
     smartphone_type AS (SELECT id FROM device_types WHERE name = 'Smartphone')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  smartphone_type.id,
  brand_id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  operating_system,
  true
FROM smartphone_type, (VALUES
  ((SELECT id FROM brands WHERE name = 'Xiaomi'), 'Xiaomi 14 Ultra', '2401117C', '2024-02-25', 6.73, '3200x1440', 'AMOLED', 5300, 'Android'),
  ((SELECT id FROM brands WHERE name = 'Xiaomi'), 'Redmi Note 13 Pro', '23124RA7EO', '2023-09-21', 6.67, '2712x1220', 'AMOLED', 5100, 'Android'),
  ((SELECT id FROM brands WHERE name = 'Google'), 'Pixel 8 Pro', 'GC3VE', '2023-10-12', 6.7, '2992x1344', 'OLED', 5050, 'Android'),
  ((SELECT id FROM brands WHERE name = 'Google'), 'Pixel 8', 'GX7AS', '2023-10-12', 6.2, '2400x1080', 'OLED', 4575, 'Android')
) AS t(brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system);

-- Nintendo consoles
WITH nintendo_brand AS (SELECT id FROM brands WHERE name = 'Nintendo'),
     console_type AS (SELECT id FROM device_types WHERE name = 'Console de jeux')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  console_type.id,
  nintendo_brand.id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  'Nintendo OS',
  true
FROM nintendo_brand, console_type, (VALUES
  ('Nintendo Switch OLED', 'HEG-001', '2021-10-08', 7.0, '1280x720', 'OLED', 4310),
  ('Nintendo Switch', 'HAC-001', '2017-03-03', 6.2, '1280x720', 'LCD', 4310),
  ('Nintendo Switch Lite', 'HDH-001', '2019-09-20', 5.5, '1280x720', 'LCD', 3570),
  ('Nintendo 3DS XL', 'SPR-001', '2012-07-28', 4.88, '800x240', 'LCD', 1750)
) AS t(model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity);

-- Autres consoles
WITH console_type AS (SELECT id FROM device_types WHERE name = 'Console de jeux')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  console_type.id,
  brand_id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  operating_system,
  true
FROM console_type, (VALUES
  ((SELECT id FROM brands WHERE name = 'Sony'), 'PlayStation Portal', 'CFI-G001', '2023-11-15', 8.0, '1920x1080', 'LCD', 4370, 'PlayStation OS'),
  ((SELECT id FROM brands WHERE name = 'Valve'), 'Steam Deck', '1010', '2022-02-25', 7.0, '1280x800', 'LCD', 5313, 'SteamOS'),
  ((SELECT id FROM brands WHERE name = 'Asus'), 'ROG Ally', 'RC71L', '2023-06-13', 7.0, '1920x1080', 'LCD', 4020, 'Windows 11')
) AS t(brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system);

-- Apple Watches
WITH apple_brand AS (SELECT id FROM brands WHERE name = 'Apple'),
     watch_type AS (SELECT id FROM device_types WHERE name = 'Montre connectée')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  watch_type.id,
  apple_brand.id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  'watchOS',
  true
FROM apple_brand, watch_type, (VALUES
  ('Apple Watch Series 9', 'A2986', '2023-09-22', 1.9, '484x396', 'OLED', 308),
  ('Apple Watch Ultra 2', 'A2986', '2023-09-22', 1.9, '502x410', 'OLED', 564),
  ('Apple Watch SE', 'A2722', '2022-09-16', 1.8, '448x368', 'OLED', 308)
) AS t(model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity);

-- Samsung Galaxy Watches
WITH samsung_brand AS (SELECT id FROM brands WHERE name = 'Samsung'),
     watch_type AS (SELECT id FROM device_types WHERE name = 'Montre connectée')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  watch_type.id,
  samsung_brand.id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  'Wear OS',
  true
FROM samsung_brand, watch_type, (VALUES
  ('Galaxy Watch6 Classic', 'SM-R960', '2023-08-24', 1.5, '480x480', 'AMOLED', 425),
  ('Galaxy Watch6', 'SM-R930', '2023-08-24', 1.5, '480x480', 'AMOLED', 425)
) AS t(model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity);

-- Autres montres
WITH watch_type AS (SELECT id FROM device_types WHERE name = 'Montre connectée')
INSERT INTO device_models (device_type_id, brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active)
SELECT 
  watch_type.id,
  brand_id,
  model_name,
  model_number,
  release_date::date,
  screen_size,
  screen_resolution,
  screen_type,
  battery_capacity,
  operating_system,
  true
FROM watch_type, (VALUES
  ((SELECT id FROM brands WHERE name = 'Garmin'), 'Fenix 7X', '010-02541', '2022-01-18', 1.4, '280x280', 'LCD', 504, 'Garmin OS'),
  ((SELECT id FROM brands WHERE name = 'Garmin'), 'Venu 3', '010-02784', '2023-08-30', 1.4, '454x454', 'AMOLED', 454, 'Garmin OS'),
  ((SELECT id FROM brands WHERE name = 'Google'), 'Pixel Watch 2', 'GBZ4S', '2023-10-12', 1.2, '384x384', 'AMOLED', 306, 'Wear OS'),
  ((SELECT id FROM brands WHERE name = 'Fitbit'), 'Versa 4', 'FB523', '2022-09-23', 1.58, '336x336', 'AMOLED', 336, 'Fitbit OS'),
  ((SELECT id FROM brands WHERE name = 'Amazfit'), 'GTR 4', 'A2174', '2022-09-20', 1.43, '466x466', 'AMOLED', 475, 'Zepp OS'),
  ((SELECT id FROM brands WHERE name = 'Amazfit'), 'Bip 5', 'A2180', '2023-08-24', 1.91, '320x380', 'LCD', 300, 'Zepp OS')
) AS t(brand_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system);

-- Ajout des types de réparations détaillés

-- Types de réparations pour écran
WITH screen_category AS (SELECT id FROM repair_categories WHERE name = 'Écran')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  screen_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM screen_category, (VALUES
  ('Remplacement écran LCD/OLED complet', 'Remplacement complet de l''écran avec vitre tactile intégrée', 'Moyen', 45, 90),
  ('Remplacement vitre tactile seule', 'Remplacement uniquement de la couche tactile (plus technique)', 'Difficile', 90, 60),
  ('Réparation pixels morts', 'Tentative de réparation des pixels défaillants', 'Expert', 30, 30),
  ('Remplacement écran Nintendo Switch', 'Remplacement écran console Nintendo Switch', 'Difficile', 120, 90),
  ('Remplacement écran 3DS', 'Remplacement écran Nintendo 3DS/3DS XL', 'Expert', 150, 90),
  ('Remplacement écran montre connectée', 'Remplacement écran pour montres intelligentes', 'Expert', 90, 60)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Types de réparations pour batterie
WITH battery_category AS (SELECT id FROM repair_categories WHERE name = 'Batterie')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  battery_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM battery_category, (VALUES
  ('Remplacement batterie smartphone', 'Remplacement batterie pour téléphones portables', 'Facile', 30, 180),
  ('Remplacement batterie console portable', 'Remplacement batterie consoles portables', 'Moyen', 60, 120),
  ('Remplacement batterie montre', 'Remplacement batterie montres connectées', 'Difficile', 45, 90),
  ('Réparation problème de charge', 'Diagnostic et réparation des problèmes de charge', 'Moyen', 60, 90),
  ('Calibrage batterie', 'Recalibrage du système de gestion batterie', 'Facile', 15, 30)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Types de réparations pour audio
WITH audio_category AS (SELECT id FROM repair_categories WHERE name = 'Audio')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  audio_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM audio_category, (VALUES
  ('Remplacement haut-parleur principal', 'Remplacement du haut-parleur interne principal', 'Moyen', 40, 90),
  ('Remplacement haut-parleur externe', 'Remplacement du haut-parleur externe/sonnerie', 'Moyen', 35, 90),
  ('Remplacement microphone', 'Remplacement du microphone principal', 'Moyen', 30, 90),
  ('Réparation jack audio console', 'Réparation prise jack 3.5mm console', 'Moyen', 45, 90),
  ('Nettoyage grille audio', 'Nettoyage des grilles haut-parleur/micro', 'Facile', 15, 30)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Types de réparations pour connectique
WITH connectivity_category AS (SELECT id FROM repair_categories WHERE name = 'Connectique')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  connectivity_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM connectivity_category, (VALUES
  ('Remplacement port USB-C', 'Remplacement connecteur USB-C de charge', 'Difficile', 75, 90),
  ('Remplacement port Lightning', 'Remplacement connecteur Lightning Apple', 'Difficile', 70, 90),
  ('Remplacement jack audio 3.5mm', 'Remplacement prise jack audio', 'Moyen', 45, 90),
  ('Réparation port charge console', 'Réparation port de charge console portable', 'Difficile', 90, 90),
  ('Nettoyage port de charge', 'Nettoyage en profondeur du port de charge', 'Facile', 10, 15)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Types de réparations pour manettes (consoles)
WITH gamepad_category AS (SELECT id FROM repair_categories WHERE name = 'Manettes')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  gamepad_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM gamepad_category, (VALUES
  ('Remplacement joystick analogique', 'Remplacement stick analogique manette', 'Moyen', 45, 90),
  ('Réparation Joy-Con drift', 'Réparation dérive Joy-Con Nintendo Switch', 'Moyen', 60, 90),
  ('Nettoyage ventilateur', 'Nettoyage système de ventilation', 'Facile', 30, 30),
  ('Remplacement ventilateur', 'Remplacement ventilateur console', 'Moyen', 60, 90),
  ('Changement pâte thermique', 'Renouvellement pâte thermique processeur', 'Moyen', 45, 60)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Types de réparations pour bracelets (montres)
WITH strap_category AS (SELECT id FROM repair_categories WHERE name = 'Bracelet')
INSERT INTO repair_types (category_id, name, description, difficulty_level, estimated_time_minutes, warranty_days, is_active)
SELECT 
  strap_category.id,
  name,
  description,
  difficulty_level,
  estimated_time_minutes,
  warranty_days,
  true
FROM strap_category, (VALUES
  ('Remplacement bracelet sport', 'Remplacement bracelet silicone/sport', 'Facile', 5, 30),
  ('Remplacement bracelet cuir', 'Remplacement bracelet en cuir', 'Facile', 5, 30),
  ('Remplacement bracelet métal', 'Remplacement bracelet en métal/acier', 'Facile', 10, 60),
  ('Calibrage capteur cardiaque', 'Calibrage et test capteur cardio', 'Moyen', 30, 30),
  ('Test pression étanchéité', 'Test de résistance à l''eau', 'Moyen', 30, 30),
  ('Remplacement joints montre', 'Remplacement joints d''étanchéité', 'Difficile', 60, 90)
) AS t(name, description, difficulty_level, estimated_time_minutes, warranty_days);

-- Ajout des prix exemples pour les modèles populaires
-- iPhone 15 Pro Max
WITH iphone15promax AS (SELECT id FROM device_models WHERE model_name = 'iPhone 15 Pro Max'),
     screen_repair AS (SELECT id FROM repair_types WHERE name = 'Remplacement écran LCD/OLED complet'),
     battery_repair AS (SELECT id FROM repair_types WHERE name = 'Remplacement batterie smartphone')
INSERT INTO repair_prices (device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, is_available, notes)
SELECT 
  device_model_id,
  repair_type_id,
  price_eur,
  part_price_eur,
  labor_price_eur,
  true,
  notes
FROM (VALUES
  ((SELECT id FROM device_models WHERE model_name = 'iPhone 15 Pro Max'), (SELECT id FROM repair_types WHERE name = 'Remplacement écran LCD/OLED complet'), 349.99, 289.99, 60.00, 'Écran original Apple avec True Tone'),
  ((SELECT id FROM device_models WHERE model_name = 'iPhone 15 Pro Max'), (SELECT id FROM repair_types WHERE name = 'Remplacement batterie smartphone'), 89.99, 69.99, 20.00, 'Batterie certifiée avec outils spécialisés')
) AS t(device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, notes);

-- iPhone 15 Pro
INSERT INTO repair_prices (device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, is_available, notes)
SELECT 
  device_model_id,
  repair_type_id,
  price_eur,
  part_price_eur,
  labor_price_eur,
  true,
  notes
FROM (VALUES
  ((SELECT id FROM device_models WHERE model_name = 'iPhone 15 Pro'), (SELECT id FROM repair_types WHERE name = 'Remplacement écran LCD/OLED complet'), 299.99, 249.99, 50.00, 'Écran original Apple'),
  ((SELECT id FROM device_models WHERE model_name = 'iPhone 15 Pro'), (SELECT id FROM repair_types WHERE name = 'Remplacement batterie smartphone'), 79.99, 59.99, 20.00, 'Batterie haute qualité')
) AS t(device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, notes);

-- Samsung Galaxy S24 Ultra
INSERT INTO repair_prices (device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, is_available, notes)
SELECT 
  device_model_id,
  repair_type_id,
  price_eur,
  part_price_eur,
  labor_price_eur,
  true,
  notes
FROM (VALUES
  ((SELECT id FROM device_models WHERE model_name = 'Galaxy S24 Ultra'), (SELECT id FROM repair_types WHERE name = 'Remplacement écran LCD/OLED complet'), 279.99, 229.99, 50.00, 'Écran AMOLED original Samsung'),
  ((SELECT id FROM device_models WHERE model_name = 'Galaxy S24 Ultra'), (SELECT id FROM repair_types WHERE name = 'Remplacement batterie smartphone'), 69.99, 49.99, 20.00, 'Batterie OEM Samsung')
) AS t(device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, notes);

-- Samsung Galaxy S24
INSERT INTO repair_prices (device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, is_available, notes)
SELECT 
  device_model_id,
  repair_type_id,
  price_eur,
  part_price_eur,
  labor_price_eur,
  true,
  notes
FROM (VALUES
  ((SELECT id FROM device_models WHERE model_name = 'Galaxy S24'), (SELECT id FROM repair_types WHERE name = 'Remplacement écran LCD/OLED complet'), 189.99, 149.99, 40.00, 'Écran AMOLED compatible'),
  ((SELECT id FROM device_models WHERE model_name = 'Galaxy S24'), (SELECT id FROM repair_types WHERE name = 'Remplacement batterie smartphone'), 59.99, 39.99, 20.00, 'Batterie compatible haute qualité')
) AS t(device_model_id, repair_type_id, price_eur, part_price_eur, labor_price_eur, notes);
