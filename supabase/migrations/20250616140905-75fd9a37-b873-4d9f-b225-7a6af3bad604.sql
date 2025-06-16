
-- Ajouter une colonne pour tracker les préférences du popup d'upgrade
ALTER TABLE repairer_subscriptions 
ADD COLUMN popup_dismissed_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN popup_never_show BOOLEAN DEFAULT FALSE;

-- Créer une fonction pour attribuer automatiquement le plan gratuit
CREATE OR REPLACE FUNCTION assign_free_plan_to_repairer(user_email TEXT, user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Insérer un abonnement gratuit par défaut
  INSERT INTO repairer_subscriptions (
    repairer_id,
    email,
    user_id,
    subscription_tier,
    billing_cycle,
    subscribed,
    created_at,
    updated_at
  ) VALUES (
    user_id::TEXT,
    user_email,
    user_id,
    'free',
    'monthly',
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;
