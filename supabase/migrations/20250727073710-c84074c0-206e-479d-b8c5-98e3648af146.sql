-- Créer les tables pour les modules métier avancés

-- Table pour le programme de fidélité
CREATE TABLE public.loyalty_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  program_name TEXT NOT NULL DEFAULT 'Programme Fidélité',
  points_per_euro NUMERIC DEFAULT 1.0,
  welcome_bonus INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les points de fidélité des clients
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier_level TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(repairer_id, customer_email)
);

-- Table pour l'historique des transactions de points
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID NOT NULL REFERENCES public.loyalty_points(id),
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'bonus', 'expired'
  points_amount INTEGER NOT NULL,
  description TEXT,
  order_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les campagnes marketing automatisées
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'email', 'sms', 'notification'
  trigger_type TEXT NOT NULL, -- 'after_purchase', 'birthday', 'abandoned_cart', 'loyalty_tier'
  trigger_conditions JSONB DEFAULT '{}',
  message_template TEXT NOT NULL,
  subject_template TEXT,
  is_active BOOLEAN DEFAULT true,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les garanties étendues
CREATE TABLE public.warranty_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  repair_order_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  device_info TEXT NOT NULL,
  warranty_type TEXT NOT NULL, -- 'standard', 'extended', 'premium'
  warranty_duration_months INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  warranty_conditions JSONB DEFAULT '{}',
  claim_history JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'claimed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les abonnements et facturation récurrente
CREATE TABLE public.subscription_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'maintenance', 'protection', 'support'
  billing_frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled', 'past_due'
  next_billing_date DATE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les prévisions IA et analytics
CREATE TABLE public.ai_forecasting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id),
  forecast_type TEXT NOT NULL, -- 'sales', 'inventory', 'customer_behavior'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  predicted_values JSONB NOT NULL,
  confidence_score NUMERIC,
  actual_values JSONB DEFAULT '{}',
  accuracy_score NUMERIC,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la gestion multi-magasins
CREATE TABLE public.multi_location_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_repairer_id UUID NOT NULL REFERENCES auth.users(id),
  location_name TEXT NOT NULL,
  location_address TEXT,
  location_phone TEXT,
  location_email TEXT,
  manager_user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les transferts inter-magasins
CREATE TABLE public.inter_store_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID NOT NULL REFERENCES public.multi_location_settings(id),
  to_location_id UUID NOT NULL REFERENCES public.multi_location_settings(id),
  transfer_type TEXT NOT NULL, -- 'inventory', 'customer', 'order'
  item_reference TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_transit', 'completed', 'cancelled'
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.loyalty_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_forecasting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_location_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inter_store_transfers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre aux réparateurs de gérer leurs propres données
CREATE POLICY "Repairers can manage their loyalty program" ON public.loyalty_program
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their loyalty points" ON public.loyalty_points
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their loyalty transactions" ON public.loyalty_transactions
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their marketing campaigns" ON public.marketing_campaigns
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their warranties" ON public.warranty_management
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their subscriptions" ON public.subscription_billing
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can view their forecasting" ON public.ai_forecasting
  FOR ALL USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can manage their locations" ON public.multi_location_settings
  FOR ALL USING (parent_repairer_id = auth.uid() OR manager_user_id = auth.uid());

CREATE POLICY "Users can manage transfers for their locations" ON public.inter_store_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.multi_location_settings 
      WHERE (id = from_location_id OR id = to_location_id) 
      AND (parent_repairer_id = auth.uid() OR manager_user_id = auth.uid())
    )
  );