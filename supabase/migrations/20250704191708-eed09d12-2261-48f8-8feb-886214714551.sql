-- Ajouter les modules POS et E-commerce pour le compte demo
INSERT INTO public.module_subscriptions (
  repairer_id, 
  module_type, 
  billing_cycle, 
  module_price, 
  module_active, 
  activated_at, 
  payment_status
) VALUES 
(
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid,
  'pos',
  'monthly',
  49.90,
  true,
  now(),
  'active'
),
(
  '370c5b16-ae21-46eb-8b4c-960984cb5ab4'::uuid,
  'ecommerce',
  'monthly',
  89.00,
  true,
  now(),
  'active'
);