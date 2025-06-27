
-- Ajouter les marques manquantes (en évitant les doublons)
INSERT INTO public.brands (name) VALUES
('Realme'),
('Honor'),
('Nokia'),
('Motorola'),
('Asus'),
('Cat'),
('Wiko'),
('TCL')
ON CONFLICT (name) DO NOTHING;

-- Récupérer l'ID du type "Smartphone" pour les modèles
WITH smartphone_type AS (
  SELECT id as smartphone_type_id FROM device_types WHERE name = 'Smartphone'
),
brand_ids AS (
  SELECT 
    id,
    name,
    CASE name
      WHEN 'Apple' THEN 'apple'
      WHEN 'Samsung' THEN 'samsung'
      WHEN 'Xiaomi' THEN 'xiaomi'
      WHEN 'Huawei' THEN 'huawei'
      WHEN 'Google' THEN 'google'
      WHEN 'Oppo' THEN 'oppo'
      WHEN 'OnePlus' THEN 'oneplus'
      WHEN 'Sony' THEN 'sony'
      WHEN 'Honor' THEN 'honor'
      WHEN 'Realme' THEN 'realme'
      WHEN 'Nokia' THEN 'nokia'
      WHEN 'Motorola' THEN 'motorola'
      WHEN 'Asus' THEN 'asus'
      WHEN 'Cat' THEN 'cat'
      WHEN 'Wiko' THEN 'wiko'
      WHEN 'TCL' THEN 'tcl'
    END as brand_key
  FROM brands
)
-- Insérer tous les modèles de smartphones
INSERT INTO public.device_models (device_type_id, brand_id, model_name, is_active) 
SELECT 
  st.smartphone_type_id,
  b.id,
  models.model_name,
  true
FROM smartphone_type st
CROSS JOIN (
  -- Apple models
  SELECT (SELECT id FROM brand_ids WHERE name = 'Apple') as brand_id, 'iPhone XS' as model_name
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone XS Max'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone XR'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 11'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 11 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 11 Pro Max'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone SE (2020)'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 12'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 12 mini'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 12 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 12 Pro Max'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 13'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 13 mini'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 13 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 13 Pro Max'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 14'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 14 Plus'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 14 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 14 Pro Max'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 15'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 15 Plus'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 15 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Apple'), 'iPhone 15 Pro Max'
  
  -- Samsung models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S9'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S9+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Note 9'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy A8 (2018)'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S10'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S10+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Note 10'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy A50'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S20'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S20+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S20 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Note 20'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Note 20 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Z Flip'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S21'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S21+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S21 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Z Fold 3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S22'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S22+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S22 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Z Flip 4'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S23'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S23+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S23 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy Z Fold 5'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S24'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S24+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Samsung'), 'Galaxy S24 Ultra'
  
  -- Xiaomi models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Mi Mix 3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 6 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Mi 9'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 8 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Mi 10 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 9'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Mi 11 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 10 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), '12 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 11 Pro+'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), '13 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), 'Redmi Note 12'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Xiaomi'), '14 Ultra'
  
  -- Huawei models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'P20 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'Mate 20 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'P Smart'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'P30 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'Mate 30 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Huawei'), 'P40 Pro'
  
  -- Google models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 3 XL'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 4'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 4a'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 5'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 6'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 6 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 7'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 7 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 8'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Google'), 'Pixel 8 Pro'
  
  -- Oppo models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Oppo'), 'Reno 2'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Oppo'), 'Find X2 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Oppo'), 'Find X3 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Oppo'), 'Find X5 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Oppo'), 'Find X6 Pro'
  
  -- OnePlus models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '6T'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '7 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '8 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '9 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '10 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '11'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'OnePlus'), '12'
  
  -- Sony models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia XZ3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 1 II'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 5 II'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 1 III'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 5 III'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 1 IV'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Sony'), 'Xperia 1 V'
  
  -- Honor models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Honor'), 'View 20'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Honor'), '9X'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Honor'), 'Magic 4 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Honor'), 'Magic 5 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Honor'), 'Magic 6 Pro'
  
  -- Realme models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Realme'), 'GT Master Edition'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Realme'), 'GT Neo 3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Realme'), '11 Pro+'
  
  -- Nokia models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Nokia'), '8.1'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Nokia'), '9 PureView'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Nokia'), 'G60'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Nokia'), 'X30'
  
  -- Motorola models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Motorola'), 'Edge 20 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Motorola'), 'Edge 30 Ultra'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Motorola'), 'Razr 40 Ultra'
  
  -- Asus models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Asus'), 'Zenfone 6'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Asus'), 'ROG Phone 5'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Asus'), 'Zenfone 9'
  
  -- Cat models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Cat'), 'S62 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Cat'), 'S75'
  
  -- Wiko models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Wiko'), 'View 3'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Wiko'), 'Power U30'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'Wiko'), 'T60'
  
  -- TCL models
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'TCL'), '10 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'TCL'), '20 Pro'
  UNION ALL SELECT (SELECT id FROM brand_ids WHERE name = 'TCL'), '30+'
) as models
JOIN brands b ON b.id = models.brand_id
ON CONFLICT (brand_id, model_name) DO NOTHING;
