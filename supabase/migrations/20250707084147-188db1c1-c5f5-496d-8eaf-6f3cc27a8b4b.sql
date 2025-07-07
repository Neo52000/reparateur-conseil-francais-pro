-- 4. Articles des transactions
WITH recent_transactions AS (
  SELECT id, transaction_number FROM pos_transactions 
  WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid
  ORDER BY created_at DESC
  LIMIT 3
)
INSERT INTO pos_transaction_items (
  transaction_id, item_type, item_name, item_sku, quantity, unit_price, total_price, tax_rate, discount_amount
)
-- Transaction 1: Changement d'écran iPhone 14
SELECT 
  rt.id, 'product', 'Écran iPhone 14 Noir', 'IP14-LCD-BLK', 1, 120.00, 120.00, 0.20, 0.00
FROM recent_transactions rt 
WHERE rt.transaction_number LIKE '%-001'
AND rt.transaction_number LIKE '%' || TO_CHAR(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD') || '%'

UNION ALL

-- Transaction 2: Changement de batterie iPhone 12
SELECT 
  rt.id, 'service', 'Changement batterie iPhone 12', 'IP12-BAT', 1, 95.00, 95.00, 0.20, 5.00
FROM recent_transactions rt 
WHERE rt.transaction_number LIKE '%-001'
AND rt.transaction_number LIKE '%' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '%'

UNION ALL

-- Transaction 3: Accessoires (2 coques)
SELECT 
  rt.id, 'product', 'Coque iPhone 14 Silicone', 'COQUE-IP14-SIL', 2, 12.00, 24.00, 0.20, 0.00
FROM recent_transactions rt 
WHERE rt.transaction_number LIKE '%-001'
AND rt.transaction_number LIKE '%' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%'

UNION ALL

-- Transaction 3: Accessoires (3 verres trempés)
SELECT 
  rt.id, 'product', 'Verre trempé iPhone 14', 'VERRE-IP14', 3, 8.00, 24.00, 0.20, 0.00
FROM recent_transactions rt 
WHERE rt.transaction_number LIKE '%-001'
AND rt.transaction_number LIKE '%' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%';