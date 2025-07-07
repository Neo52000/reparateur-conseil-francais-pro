-- 2. Création d'une session POS pour aujourd'hui
INSERT INTO pos_sessions (
  repairer_id, session_number, session_date, started_at, status, 
  total_amount, total_transactions, cash_drawer_start, employee_name, notes
) VALUES (
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid, 
  'SES-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001', 
  CURRENT_DATE, 
  CURRENT_TIMESTAMP - INTERVAL '4 hours', 
  'active', 
  307.00, 
  3, 
  100.00, 
  'Demo User', 
  'Session de démonstration'
);

-- 3. Quelques transactions d'exemple (historique des 7 derniers jours)
WITH demo_session AS (
  SELECT id FROM pos_sessions 
  WHERE repairer_id = '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid 
  AND session_date = CURRENT_DATE
  LIMIT 1
)
INSERT INTO pos_transactions (
  session_id, repairer_id, transaction_number, transaction_type, customer_name, customer_phone,
  subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, transaction_date
) 
SELECT 
  demo_session.id,
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid,
  'TXN-' || TO_CHAR(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD') || '-001',
  'sale',
  'Martin Dupont',
  '0612345678',
  120.00,
  24.00,
  0.00,
  144.00,
  'card',
  'completed',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM demo_session

UNION ALL

SELECT 
  demo_session.id,
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid,
  'TXN-' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '-001',
  'repair',
  'Sophie Martin',
  '0623456789',
  95.00,
  19.00,
  5.00,
  109.00,
  'cash',
  'completed',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM demo_session

UNION ALL

SELECT 
  demo_session.id,
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid,
  'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001',
  'sale',
  'Pierre Lambert',
  '0634567890',
  45.00,
  9.00,
  0.00,
  54.00,
  'card',
  'completed',
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
FROM demo_session;