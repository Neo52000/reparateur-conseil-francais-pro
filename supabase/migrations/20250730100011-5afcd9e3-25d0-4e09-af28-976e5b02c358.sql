-- Ajouter les marques manquantes
INSERT INTO brands (name, logo_url) VALUES 
  ('Samsung', 'https://www.samsung.com/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/gnb-desktop-120x32.png'),
  ('Xiaomi', 'https://i01.appmifile.com/webfile/globalimg/7/537557F0-D4EE-17F3-4D15-7CF260B4A377.png'),
  ('Huawei', 'https://consumer.huawei.com/etc/designs/huawei-cbg-site/clientlib-campaign-v4/common-v4/images/logo.svg'),
  ('Honor', 'https://www.honor.com/content/dam/honor/common/logo/honor-logo.svg'),
  ('OPPO', 'https://www.oppo.com/content/dam/oppo/common/mkt/v2-2/navigation-logo-black.png'),
  ('Realme', 'https://www.realme.com/library/clientlibs/realme-v2/images/realme-logo.svg'),
  ('OnePlus', 'https://oasis.opstatics.com/content/dam/oasis/common/logo/1+_Logo_Black.svg'),
  ('Motorola', 'https://motorolaus.vtexassets.com/assets/vtex/assets/vtex.file-manager-graphql/images/4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d___7e5a9c8a5e6a9b8c7d5e3f4a2b1c9d8e.svg'),
  ('Google', 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_160x56dp.png'),
  ('Vivo', 'https://www.vivo.com/etc/designs/vivo-v2/clientlib-site/images/logo.svg'),
  ('Crosscall', 'https://www.crosscall.com/on/demandware.static/Sites-crosscall-Site/-/default/dw47e5f8a8/images/logo/crosscall-logo.svg'),
  ('Blackview', 'https://www.blackview.hk/images/logo.png'),
  ('TCL', 'https://www.tcl.com/content/dam/tcl/logo/TCL_logo_black.svg'),
  ('Nokia', 'https://www.nokia.com/etc/designs/nokia/clientlib-branding/images/nokia-logo.svg'),
  ('Alcatel', 'https://www.alcatel-mobile.com/wp-content/themes/alcatel-2018/images/logo.svg'),
  ('Sony', 'https://www.sony.fr/image/5a47099495b25d78e15295bd7f51e648?fmt=pjpeg&amp;wid=165&amp;bgcolor=FFFFFF&amp;bgc=FFFFFF'),
  ('HTC', 'https://www.htc.com/managed-assets/shared/desktop/img/logo-htc.svg'),
  ('Wiko', 'https://www.wikomobile.com/files/logo.png'),
  ('LG', 'https://gscs.lge.com/images/LG_logo.svg'),
  ('Asus', 'https://www.asus.com/WebsiteNavigation/images/logo.svg'),
  ('BlackBerry', 'https://www.blackberry.com/content/dam/blackberry-com/logos/blackberry-logo-red-RGB.svg'),
  ('Nothing', 'https://nothing.tech/images/logo.svg'),
  ('Caterpillar', 'https://www.cat.com/etc/designs/caterpillar/clientlib-site/images/cat-logo.svg'),
  ('HMD', 'https://hmdglobal.com/themes/custom/hmd_theme/logo.svg')
ON CONFLICT (name) DO NOTHING;

-- Obtenir les IDs des marques
DO $$
DECLARE
    samsung_id UUID;
    xiaomi_id UUID;
    huawei_id UUID;
    honor_id UUID;
    oppo_id UUID;
    realme_id UUID;
    oneplus_id UUID;
    motorola_id UUID;
    google_id UUID;
    vivo_id UUID;
    nokia_id UUID;
    sony_id UUID;
    lg_id UUID;
    smartphone_id UUID;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO samsung_id FROM brands WHERE name = 'Samsung';
    SELECT id INTO xiaomi_id FROM brands WHERE name = 'Xiaomi';
    SELECT id INTO huawei_id FROM brands WHERE name = 'Huawei';
    SELECT id INTO honor_id FROM brands WHERE name = 'Honor';
    SELECT id INTO oppo_id FROM brands WHERE name = 'OPPO';
    SELECT id INTO realme_id FROM brands WHERE name = 'Realme';
    SELECT id INTO oneplus_id FROM brands WHERE name = 'OnePlus';
    SELECT id INTO motorola_id FROM brands WHERE name = 'Motorola';
    SELECT id INTO google_id FROM brands WHERE name = 'Google';
    SELECT id INTO vivo_id FROM brands WHERE name = 'Vivo';
    SELECT id INTO nokia_id FROM brands WHERE name = 'Nokia';
    SELECT id INTO sony_id FROM brands WHERE name = 'Sony';
    SELECT id INTO lg_id FROM brands WHERE name = 'LG';
    SELECT id INTO smartphone_id FROM device_types WHERE name = 'Smartphone';

    -- Ajouter les modèles Samsung Galaxy
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number, 
        screen_size, screen_type, storage_options, ram_options, 
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('Galaxy S24 Ultra', samsung_id, smartphone_id, 'SM-S928', 
     6.8, 'Dynamic AMOLED 2X', '{"256GB", "512GB", "1TB"}', '{"12GB"}',
     '{"Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"S Pen", "200MP Camera", "AI Photo Editing", "Satellite Communication"}', 2024),
    
    ('Galaxy S24+', samsung_id, smartphone_id, 'SM-S926',
     6.7, 'Dynamic AMOLED 2X', '{"256GB", "512GB"}', '{"12GB"}',
     '{"Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "AI Photo Editing", "Wireless Charging"}', 2024),
     
    ('Galaxy S24', samsung_id, smartphone_id, 'SM-S921',
     6.2, 'Dynamic AMOLED 2X', '{"128GB", "256GB", "512GB"}', '{"8GB"}',
     '{"Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "AI Photo Editing", "Wireless Charging"}', 2024),
     
    ('Galaxy S23 Ultra', samsung_id, smartphone_id, 'SM-S918',
     6.8, 'Dynamic AMOLED 2X', '{"256GB", "512GB", "1TB"}', '{"8GB", "12GB"}',
     '{"Phantom Black", "Cream", "Green", "Lavender"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"S Pen", "200MP Camera", "Night Mode", "8K Video"}', 2023),
     
    ('Galaxy A54 5G', samsung_id, smartphone_id, 'SM-A546',
     6.4, 'Super AMOLED', '{"128GB", "256GB"}', '{"6GB", "8GB"}',
     '{"Awesome Graphite", "Awesome Lime", "Awesome Violet", "Awesome White"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "5000mAh Battery", "Water Resistant"}', 2023),
     
    ('Galaxy A34 5G', samsung_id, smartphone_id, 'SM-A346',
     6.6, 'Super AMOLED', '{"128GB", "256GB"}', '{"6GB", "8GB"}',
     '{"Awesome Graphite", "Awesome Lime", "Awesome Violet", "Awesome Silver"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"48MP Triple Camera", "5000mAh Battery", "Water Resistant"}', 2023);

    -- Ajouter les modèles Xiaomi
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('14 Ultra', xiaomi_id, smartphone_id, '2405CPX3DG',
     6.73, 'LTPO AMOLED', '{"512GB", "1TB"}', '{"16GB"}',
     '{"Black", "White", "Olive Green"}',
     '{"5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Leica Quad Camera", "Wireless Charging", "IP68"}', 2024),
     
    ('14', xiaomi_id, smartphone_id, '2311DRK48G',
     6.36, 'AMOLED', '{"256GB", "512GB"}', '{"8GB", "12GB"}',
     '{"Black", "White", "Green", "Pink"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Leica Triple Camera", "4610mAh Battery", "90W Charging"}', 2024),
     
    ('Redmi Note 13 Pro', xiaomi_id, smartphone_id, '23124RA7EO',
     6.67, 'AMOLED', '{"128GB", "256GB", "512GB"}', '{"8GB", "12GB"}',
     '{"Midnight Black", "Ocean Teal", "Aurora Purple"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"200MP Triple Camera", "5100mAh Battery", "67W Charging"}', 2024),
     
    ('POCO F6 Pro', xiaomi_id, smartphone_id, '24069PC21G',
     6.67, 'AMOLED', '{"256GB", "512GB", "1TB"}', '{"12GB", "16GB"}',
     '{"Black", "White", "Yellow"}',
     '{"5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "5000mAh Battery", "120W Charging"}', 2024);

    -- Ajouter les modèles Huawei
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('P60 Pro', huawei_id, smartphone_id, 'ALN-L29',
     6.67, 'OLED', '{"256GB", "512GB"}', '{"8GB", "12GB"}',
     '{"Rococo Pearl", "Emerald Green", "Jet Black"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"}',
     '{"48MP Leica Triple Camera", "4815mAh Battery", "88W Charging"}', 2023),
     
    ('Mate 60 Pro', huawei_id, smartphone_id, 'BNE-L09',
     6.82, 'OLED', '{"256GB", "512GB", "1TB"}', '{"12GB"}',
     '{"Black", "White", "Green", "Purple"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "5000mAh Battery", "88W Charging"}', 2023),
     
    ('Nova 11', huawei_id, smartphone_id, 'GLK-L09',
     6.7, 'OLED', '{"128GB", "256GB", "512GB"}', '{"8GB"}',
     '{"Black", "White", "Green", "Blue"}',
     '{"4G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"}',
     '{"50MP Dual Camera", "4500mAh Battery", "66W Charging"}', 2023);

    -- Ajouter les modèles Honor
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('Magic6 Pro', honor_id, smartphone_id, 'BVL-N09',
     6.8, 'LTPO OLED', '{"256GB", "512GB", "1TB"}', '{"12GB", "16GB"}',
     '{"Black", "Epi Green", "Coral Purple"}',
     '{"5G", "Wi-Fi 7", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "5600mAh Battery", "80W Charging"}', 2024),
     
    ('200 Pro', honor_id, smartphone_id, '0235ALRD',
     6.78, 'OLED', '{"256GB", "512GB"}', '{"12GB"}',
     '{"Black", "White", "Ocean Cyan"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "5200mAh Battery", "100W Charging"}', 2024),
     
    ('90 5G', honor_id, smartphone_id, 'REA-N09',
     6.7, 'AMOLED', '{"256GB", "512GB"}', '{"12GB"}',
     '{"Midnight Black", "Diamond Silver", "Peacock Blue"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"200MP Triple Camera", "5000mAh Battery", "66W Charging"}', 2024);

    -- Ajouter les modèles Google Pixel
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('Pixel 8 Pro', google_id, smartphone_id, 'GC3VE',
     6.7, 'LTPO OLED', '{"128GB", "256GB", "512GB", "1TB"}', '{"12GB"}',
     '{"Obsidian", "Porcelain", "Bay"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "Magic Eraser", "5050mAh Battery"}', 2023),
     
    ('Pixel 8', google_id, smartphone_id, 'GX7AS',
     6.2, 'OLED', '{"128GB", "256GB"}', '{"8GB"}',
     '{"Obsidian", "Hazel", "Rose"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"50MP Dual Camera", "Magic Eraser", "4575mAh Battery"}', 2023),
     
    ('Pixel 7a', google_id, smartphone_id, 'GHL1X',
     6.1, 'OLED', '{"128GB"}', '{"8GB"}',
     '{"Charcoal", "Snow", "Sea", "Coral"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"64MP Dual Camera", "Magic Eraser", "4385mAh Battery"}', 2023);

    -- Ajouter les modèles OnePlus
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('12 Pro', oneplus_id, smartphone_id, 'CPH2583',
     6.82, 'LTPO AMOLED', '{"256GB", "512GB"}', '{"12GB", "16GB"}',
     '{"Silky Black", "Flowy Emerald"}',
     '{"5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Hasselblad Triple Camera", "5400mAh Battery", "100W Charging"}', 2024),
     
    ('12', oneplus_id, smartphone_id, 'CPH2573',
     6.7, 'LTPO AMOLED', '{"256GB", "512GB"}', '{"12GB", "16GB"}',
     '{"Silky Black", "Flowy Emerald"}',
     '{"5G", "Wi-Fi 7", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Hasselblad Triple Camera", "5400mAh Battery", "100W Charging"}', 2024),
     
    ('Nord 4', oneplus_id, smartphone_id, 'CPH2655',
     6.74, 'AMOLED', '{"128GB", "256GB", "512GB"}', '{"8GB", "12GB", "16GB"}',
     '{"Mercurial Silver", "Obsidian Midnight", "Oasis Green"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.4", "NFC", "USB-C"}',
     '{"50MP Dual Camera", "5500mAh Battery", "100W Charging"}', 2024);

    -- Ajouter les modèles Nokia
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('XR21', nokia_id, smartphone_id, 'TA-1586',
     6.49, 'IPS LCD', '{"64GB", "128GB"}', '{"4GB", "6GB"}',
     '{"Pine Green", "Midnight Black"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"64MP Dual Camera", "4800mAh Battery", "IP69K Rating"}', 2023),
     
    ('G60 5G', nokia_id, smartphone_id, 'TA-1505',
     6.58, 'IPS LCD', '{"64GB", "128GB"}', '{"4GB", "6GB"}',
     '{"Pure Black", "Ice Blue"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"}',
     '{"50MP Triple Camera", "4500mAh Battery", "Android One"}', 2022),
     
    ('C32', nokia_id, smartphone_id, 'TA-1449',
     6.52, 'IPS LCD', '{"64GB", "128GB"}', '{"3GB", "4GB"}',
     '{"Charcoal", "Beach"}',
     '{"4G", "Wi-Fi 5", "Bluetooth 5.0", "USB-C"}',
     '{"50MP Dual Camera", "5000mAh Battery", "Android Go"}', 2023);

    -- Ajouter les modèles Sony Xperia
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('1 VI', sony_id, smartphone_id, 'XQ-EC54',
     6.5, 'OLED', '{"256GB", "512GB"}', '{"12GB"}',
     '{"Black", "Platinum Silver", "Scarlet"}',
     '{"5G", "Wi-Fi 6E", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"48MP Triple Camera", "5000mAh Battery", "4K HDR OLED"}', 2024),
     
    ('5 V', sony_id, smartphone_id, 'XQ-DE54',
     6.1, 'OLED', '{"128GB", "256GB"}', '{"8GB"}',
     '{"Black", "Blue", "Pink"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.2", "NFC", "USB-C"}',
     '{"48MP Triple Camera", "5000mAh Battery", "Compact Design"}', 2023),
     
    ('10 V', sony_id, smartphone_id, 'XQ-DC72',
     6.1, 'OLED', '{"128GB"}', '{"8GB"}',
     '{"Black", "White", "Sage Green", "Lavender"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.3", "NFC", "USB-C"}',
     '{"48MP Dual Camera", "5000mAh Battery", "21:9 Display"}', 2023);

    -- Ajouter quelques modèles LG (historiques)
    INSERT INTO device_models (
        model_name, brand_id, device_type_id, model_number,
        screen_size, screen_type, storage_options, ram_options,
        colors, connectivity, special_features, release_year
    ) VALUES 
    ('Wing 5G', lg_id, smartphone_id, 'LM-F100N',
     6.8, 'P-OLED', '{"128GB", "256GB"}', '{"8GB"}',
     '{"Aurora Gray", "Illusion Sky"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.1", "NFC", "USB-C"}',
     '{"64MP Triple Camera", "Swivel Screen", "4000mAh Battery"}', 2020),
     
    ('V60 ThinQ 5G', lg_id, smartphone_id, 'LM-V600',
     6.8, 'P-OLED', '{"128GB", "256GB"}', '{"8GB"}',
     '{"Classy Black", "Classy Blue", "Classy White"}',
     '{"5G", "Wi-Fi 6", "Bluetooth 5.1", "NFC", "USB-C"}',
     '{"64MP Triple Camera", "Dual Screen", "5000mAh Battery"}', 2020);

END $$;