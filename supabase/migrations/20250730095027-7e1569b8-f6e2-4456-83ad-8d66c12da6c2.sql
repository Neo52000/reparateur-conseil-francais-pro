-- Ajouter les modèles iPhone manquants inspirés du catalogue Mobilax
-- En s'appuyant sur les ID existants pour Apple et Smartphone

-- Récupérer les IDs pour référence
-- Apple brand_id: 07c05179-908a-4f4d-8340-f12ed8afe836
-- Smartphone device_type_id: 0a8099d9-067a-48eb-b118-bcb196d4ef51

-- Ajouter les modèles iPhone de la série X/XS/XR
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone X', 'A1901', '2017-11-03', 5.8, '2436×1125', 'OLED', 2716, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone XS', 'A2097', '2018-09-21', 5.8, '2436×1125', 'OLED', 2658, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone XS Max', 'A2101', '2018-09-21', 6.5, '2688×1242', 'OLED', 3174, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone XR', 'A2105', '2018-10-26', 6.1, '1792×828', 'LCD', 2942, 'iOS', true);

-- Ajouter les modèles iPhone 11 série
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 11', 'A2221', '2019-09-20', 6.1, '1792×828', 'LCD', 3110, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 11 Pro', 'A2215', '2019-09-20', 5.8, '2436×1125', 'OLED', 3046, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 11 Pro Max', 'A2218', '2019-09-20', 6.5, '2688×1242', 'OLED', 3969, 'iOS', true);

-- Ajouter les modèles iPhone 12 série (Mini et Pro déjà en base)
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 12 Mini', 'A2399', '2020-11-13', 5.4, '2340×1080', 'OLED', 2227, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 12 Pro', 'A2407', '2020-10-23', 6.1, '2532×1170', 'OLED', 2815, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 12 Pro Max', 'A2411', '2020-10-23', 6.7, '2778×1284', 'OLED', 3687, 'iOS', true);

-- Ajouter les modèles iPhone 13 série (iPhone 13 de base déjà en base)
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 13 Mini', 'A2628', '2021-09-24', 5.4, '2340×1080', 'OLED', 2406, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 13 Pro', 'A2636', '2021-09-24', 6.1, '2532×1170', 'OLED', 3095, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 13 Pro Max', 'A2641', '2021-09-24', 6.7, '2778×1284', 'OLED', 4352, 'iOS', true);

-- Ajouter les modèles iPhone 14 série (iPhone 14 et Pro Max déjà en base)
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 14 Plus', 'A2886', '2022-10-07', 6.7, '2778×1284', 'OLED', 4325, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 14 Pro', 'A2892', '2022-09-16', 6.1, '2556×1179', 'OLED', 3200, 'iOS', true);

-- Ajouter les modèles iPhone 15 série (iPhone 15 de base déjà en base)
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 15 Plus', 'A3109', '2023-09-22', 6.7, '2796×1290', 'OLED', 4441, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 15 Pro', 'A3101', '2023-09-22', 6.1, '2556×1179', 'OLED', 3274, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 15 Pro Max', 'A3102', '2023-09-22', 6.7, '2796×1290', 'OLED', 4441, 'iOS', true);

-- Ajouter les modèles iPhone 16 série (nouveaux modèles 2024)
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 16', 'A3288', '2024-09-20', 6.1, '2556×1179', 'OLED', 3561, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 16 Plus', 'A3289', '2024-09-20', 6.7, '2796×1290', 'OLED', 4674, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 16 Pro', 'A3290', '2024-09-20', 6.3, '2622×1206', 'OLED', 3582, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone 16 Pro Max', 'A3291', '2024-09-20', 6.9, '2868×1320', 'OLED', 4685, 'iOS', true);

-- Ajouter les modèles iPhone SE série
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, battery_capacity, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone SE (2ème génération)', 'A2275', '2020-04-24', 4.7, '1334×750', 'LCD', 1821, 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPhone SE (3ème génération)', 'A2782', '2022-03-18', 4.7, '1334×750', 'LCD', 2018, 'iOS', true);

-- Ajouter quelques modèles iPod Touch pour compléter le catalogue Apple mobile
INSERT INTO device_models (brand_id, device_type_id, model_name, model_number, release_date, screen_size, screen_resolution, screen_type, operating_system, is_active) VALUES
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPod Touch (6ème génération)', 'A1574', '2015-07-15', 4.0, '1136×640', 'LCD', 'iOS', true),
('07c05179-908a-4f4d-8340-f12ed8afe836', '0a8099d9-067a-48eb-b118-bcb196d4ef51', 'iPod Touch (7ème génération)', 'A2178', '2019-05-28', 4.0, '1136×640', 'LCD', 'iOS', true);