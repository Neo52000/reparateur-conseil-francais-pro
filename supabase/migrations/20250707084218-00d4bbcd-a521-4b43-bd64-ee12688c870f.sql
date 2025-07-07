-- 5. Ajout de quelques alertes de stock bas (données réalistes)
UPDATE pos_inventory_items 
SET current_stock = 2
WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
AND sku = 'IPXR-LCD-BLK';

UPDATE pos_inventory_items 
SET current_stock = 4
WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
AND sku = 'S22-OLED-BLK';

-- 6. Mise à jour des stocks après les ventes (simulation réaliste)
UPDATE pos_inventory_items 
SET current_stock = current_stock - 1
WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
AND sku IN ('IP14-LCD-BLK', 'IP12-BAT');

UPDATE pos_inventory_items 
SET current_stock = current_stock - 2
WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
AND sku = 'COQUE-IP14-SIL';

UPDATE pos_inventory_items 
SET current_stock = current_stock - 3
WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
AND sku = 'VERRE-IP14';