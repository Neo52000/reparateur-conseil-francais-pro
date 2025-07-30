-- Ajouter les nouveaux modèles identifiés sur Utopya.fr (sans doublons)
DO $$
DECLARE
    samsung_id UUID;
    xiaomi_id UUID;
    apple_id UUID;
    smartphone_id UUID;
    existing_count INTEGER;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO samsung_id FROM brands WHERE name = 'Samsung';
    SELECT id INTO xiaomi_id FROM brands WHERE name = 'Xiaomi';
    SELECT id INTO apple_id FROM brands WHERE name = 'Apple';
    SELECT id INTO smartphone_id FROM device_types WHERE name = 'Smartphone';

    -- Vérifier et ajouter Galaxy A17 5G
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy A17 5G' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy A17 5G', samsung_id, smartphone_id, 'SM-A176',
         6.5, 'Super AMOLED', '["128GB", "256GB"]', 6,
         '["Awesome Black", "Awesome Blue", "Awesome Violet", "Awesome Silver"]',
         '["5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["50MP Triple Camera", "5000mAh Battery", "Water Resistant IP67"]', '2025-03-01', 'Android 15');
    END IF;

    -- Vérifier et ajouter Galaxy S25 FE
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy S25 FE' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy S25 FE', samsung_id, smartphone_id, 'SM-S901',
         6.4, 'AMOLED', '["128GB", "256GB"]', 8,
         '["Phantom Black", "Cream", "Lavender", "Mint"]',
         '["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["50MP Triple Camera", "AI Photo Editing", "Wireless Charging"]', '2025-01-15', 'Android 15');
    END IF;

    -- Vérifier et ajouter Galaxy Z Flip7
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy Z Flip7' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy Z Flip7', samsung_id, smartphone_id, 'SM-F741',
         6.7, 'AMOLED', '["256GB", "512GB"]', 12,
         '["Phantom Black", "Cream", "Lavender", "Mint"]',
         '["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["50MP Dual Camera", "Foldable Display", "Wireless Charging"]', '2025-08-01', 'Android 15');
    END IF;

    -- Vérifier et ajouter Galaxy Z Flip7 FE
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy Z Flip7 FE' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy Z Flip7 FE', samsung_id, smartphone_id, 'SM-F731',
         6.7, 'AMOLED', '["256GB"]', 8,
         '["Phantom Black", "Cream", "Lavender"]',
         '["5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["50MP Dual Camera", "Foldable Display", "Wireless Charging"]', '2025-09-01', 'Android 15');
    END IF;

    -- Vérifier et ajouter Galaxy Z Fold7
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy Z Fold7' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy Z Fold7', samsung_id, smartphone_id, 'SM-F961',
         7.6, 'AMOLED', '["256GB", "512GB", "1TB"]', 16,
         '["Phantom Black", "Phantom Silver", "Phantom Green"]',
         '["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["200MP Triple Camera", "Foldable Display", "S Pen Support"]', '2025-08-01', 'Android 15');
    END IF;

    -- Vérifier et ajouter Galaxy A26 5G
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Galaxy A26 5G' AND brand_id = samsung_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Galaxy A26 5G', samsung_id, smartphone_id, 'SM-A266',
         6.5, 'Super AMOLED', '["128GB", "256GB"]', 6,
         '["Awesome Black", "Awesome Blue", "Awesome White"]',
         '["5G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"]',
         '["50MP Triple Camera", "5000mAh Battery", "Water Resistant"]', '2025-02-01', 'Android 15');
    END IF;

    -- Vérifier et ajouter Redmi Note 14 Pro+ 5G
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'Redmi Note 14 Pro+ 5G' AND brand_id = xiaomi_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('Redmi Note 14 Pro+ 5G', xiaomi_id, smartphone_id, '24116RACCG',
         6.67, 'AMOLED', '["256GB", "512GB"]', 12,
         '["Midnight Black", "Ocean Blue", "Forest Green"]',
         '["5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["200MP Triple Camera", "5100mAh Battery", "120W Charging"]', '2024-12-01', 'Android 14');
    END IF;

    -- Vérifier et ajouter iPhone 16e
    SELECT COUNT(*) INTO existing_count FROM device_models 
    WHERE model_name = 'iPhone 16e' AND brand_id = apple_id;
    
    IF existing_count = 0 THEN
        INSERT INTO device_models (
            model_name, brand_id, device_type_id, model_number,
            screen_size, screen_type, storage_options, ram_gb,
            colors, connectivity, special_features, release_date, operating_system
        ) VALUES 
        ('iPhone 16e', apple_id, smartphone_id, 'A3294',
         6.1, 'OLED', '["128GB", "256GB", "512GB"]', 8,
         '["Black", "White", "Pink", "Green", "Blue"]',
         '["5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"]',
         '["48MP Dual Camera", "Action Button", "Dynamic Island"]', '2025-03-01', 'iOS 18');
    END IF;

    RAISE NOTICE 'Nouveaux modèles ajoutés avec succès depuis Utopya.fr';

END $$;