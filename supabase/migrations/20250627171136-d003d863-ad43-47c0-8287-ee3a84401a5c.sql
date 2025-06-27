
-- D'abord, vérifions l'état actuel des types d'appareils
SELECT id, name FROM device_types ORDER BY name;

-- Vérifions les associations actuelles des modèles avec leurs types
SELECT 
  dt.name as device_type,
  b.name as brand,
  dm.model_name,
  dm.device_type_id,
  dm.brand_id
FROM device_models dm
JOIN device_types dt ON dm.device_type_id = dt.id
JOIN brands b ON dm.brand_id = b.id
ORDER BY dt.name, b.name, dm.model_name;

-- Correction des associations : associer tous les modèles de smartphones au bon type "Smartphone"
UPDATE device_models 
SET device_type_id = (SELECT id FROM device_types WHERE name = 'Smartphone')
WHERE brand_id IN (
  SELECT id FROM brands WHERE name IN (
    'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'Oppo', 
    'OnePlus', 'Sony', 'Honor', 'Realme', 'Nokia', 'Motorola'
  )
);

-- S'assurer que les modèles Cat, Wiko, TCL et Asus sont aussi des smartphones
UPDATE device_models 
SET device_type_id = (SELECT id FROM device_types WHERE name = 'Smartphone')
WHERE brand_id IN (
  SELECT id FROM brands WHERE name IN ('Cat', 'Wiko', 'TCL', 'Asus')
);
