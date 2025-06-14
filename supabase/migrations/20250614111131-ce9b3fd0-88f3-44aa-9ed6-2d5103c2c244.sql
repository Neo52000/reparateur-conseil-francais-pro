
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table for repairers
CREATE TABLE public.repairer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id TEXT NOT NULL, -- Reference to repairer from existing table
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  subscription_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(repairer_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (readable by everyone)
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
FOR SELECT
USING (true);

-- RLS policies for repairer_subscriptions
CREATE POLICY "repairer_subscriptions_select" ON public.repairer_subscriptions
FOR SELECT
USING (user_id = auth.uid() OR true); -- Allow viewing for filtering repairers

CREATE POLICY "repairer_subscriptions_insert" ON public.repairer_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "repairer_subscriptions_update" ON public.repairer_subscriptions
FOR UPDATE
USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, features) VALUES
('Gratuit', 0.00, 0.00, '["Nom de l''entreprise", "Informations floutées"]'),
('Basique', 9.90, 107.28, '["Nom visible", "Adresse visible", "Téléphone visible", "Avis visibles"]'),
('Premium', 14.90, 160.92, '["Nom visible", "Adresse visible", "Téléphone visible", "Avis visibles", "Demande de devis", "Référencement optimisé"]'),
('Enterprise', 34.90, 376.92, '["Nom visible", "Adresse visible", "Téléphone visible", "Avis visibles", "Demande de devis", "Référencement optimisé", "Publicité Facebook", "Réseaux sociaux"]');
