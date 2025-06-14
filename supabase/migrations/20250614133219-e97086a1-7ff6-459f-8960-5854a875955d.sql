
-- Mettre à jour le profil pour être administrateur
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'reine.elie@gmail.com';

-- Insérer le profil s'il n'existe pas
INSERT INTO profiles (id, email, first_name, last_name, role)
SELECT 
  'e84addbf-ede8-4e3c-8548-af3c4bd4c54f'::uuid,
  'reine.elie@gmail.com',
  'Reine',
  'Elie',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'reine.elie@gmail.com'
);

-- Créer un plan d'abonnement premium
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, stripe_price_id_monthly, stripe_price_id_yearly)
VALUES (
  'Premium',
  34.90,
  349.00,
  '["Recherche avancée", "Chat illimité", "Analyse détaillée", "Support prioritaire"]'::jsonb,
  'price_premium_monthly',
  'price_premium_yearly'
) ON CONFLICT DO NOTHING;

-- Créer un abonnement pour le réparateur test
INSERT INTO repairer_subscriptions (
  repairer_id, 
  email, 
  subscription_tier, 
  billing_cycle, 
  subscribed, 
  subscription_end
) VALUES (
  'test-repairer-001',
  'reine.elie@gmail.com',
  'premium',
  'monthly',
  true,
  (NOW() + INTERVAL '1 month')
) ON CONFLICT (repairer_id) DO UPDATE SET
  subscription_tier = 'premium',
  subscribed = true,
  subscription_end = (NOW() + INTERVAL '1 month');
