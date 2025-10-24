-- Table pour les commissions dynamiques par paliers
CREATE TABLE IF NOT EXISTS public.commission_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL,
  min_monthly_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_monthly_revenue DECIMAL(10,2),
  commission_rate DECIMAL(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour tracker les commissions par transaction
CREATE TABLE IF NOT EXISTS public.transaction_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  transaction_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  tier_applied UUID REFERENCES public.commission_tiers(id),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les notifications push
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('repair_update', 'quote_received', 'appointment_confirmed', 'payment_completed', 'message_received', 'review_request')),
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les métriques admin en temps réel
CREATE TABLE IF NOT EXISTS public.admin_metrics_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  total_repairers INTEGER DEFAULT 0,
  active_repairers INTEGER DEFAULT 0,
  total_quotes INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commissions DECIMAL(12,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_quote_value DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Table pour les webhooks Stripe
CREATE TABLE IF NOT EXISTS public.stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les paliers de commission par défaut
INSERT INTO public.commission_tiers (tier_name, min_monthly_revenue, max_monthly_revenue, commission_rate, description) VALUES
  ('Bronze', 0, 1000, 15.00, 'Nouveau réparateur - Commission standard'),
  ('Silver', 1000, 5000, 12.00, 'Réparateur confirmé - Commission réduite'),
  ('Gold', 5000, 10000, 10.00, 'Réparateur expert - Commission préférentielle'),
  ('Platinum', 10000, NULL, 8.00, 'Partenaire premium - Commission minimale')
ON CONFLICT DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_transaction_commissions_repairer ON public.transaction_commissions(repairer_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_transaction_commissions_status ON public.transaction_commissions(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON public.push_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_push_notifications_created ON public.push_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event ON public.stripe_webhooks(stripe_event_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_commission_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commission_tiers_updated_at
  BEFORE UPDATE ON public.commission_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_tiers_updated_at();

-- Fonction pour calculer la commission selon le CA mensuel du réparateur
CREATE OR REPLACE FUNCTION calculate_repairer_commission(repairer_uuid UUID, transaction_amount DECIMAL)
RETURNS TABLE(commission_rate DECIMAL, commission_amount DECIMAL, tier_id UUID, tier_name TEXT) AS $$
DECLARE
  monthly_revenue DECIMAL;
  current_tier RECORD;
BEGIN
  -- Calculer le CA mensuel du réparateur (30 derniers jours)
  SELECT COALESCE(SUM(transaction_amount), 0) INTO monthly_revenue
  FROM public.transaction_commissions
  WHERE repairer_id = repairer_uuid
    AND payment_date >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'paid';
  
  -- Trouver le palier approprié
  SELECT * INTO current_tier
  FROM public.commission_tiers
  WHERE is_active = true
    AND min_monthly_revenue <= monthly_revenue
    AND (max_monthly_revenue IS NULL OR max_monthly_revenue > monthly_revenue)
  ORDER BY min_monthly_revenue DESC
  LIMIT 1;
  
  -- Si aucun palier trouvé, utiliser le palier Bronze par défaut
  IF current_tier IS NULL THEN
    SELECT * INTO current_tier
    FROM public.commission_tiers
    WHERE tier_name = 'Bronze' AND is_active = true
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT 
    current_tier.commission_rate,
    ROUND((transaction_amount * current_tier.commission_rate / 100)::NUMERIC, 2),
    current_tier.id,
    current_tier.tier_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les métriques admin quotidiennes
CREATE OR REPLACE FUNCTION refresh_admin_metrics()
RETURNS void AS $$
DECLARE
  today_metrics RECORD;
BEGIN
  -- Calculer les métriques du jour
  SELECT 
    COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'client') as total_users,
    COUNT(DISTINCT rp.id) as total_repairers,
    COUNT(DISTINCT rp.id) FILTER (WHERE rp.is_available = true) as active_repairers,
    COUNT(DISTINCT q.id) as total_quotes,
    COUNT(DISTINCT a.id) as total_appointments,
    COALESCE(SUM(pay.amount), 0) as total_revenue,
    COALESCE(SUM(tc.commission_amount), 0) as total_commissions,
    CASE 
      WHEN COUNT(DISTINCT q.id) > 0 
      THEN ROUND((COUNT(DISTINCT a.id)::DECIMAL / COUNT(DISTINCT q.id) * 100)::NUMERIC, 2)
      ELSE 0 
    END as conversion_rate,
    CASE 
      WHEN COUNT(DISTINCT q.id) > 0 
      THEN ROUND((COALESCE(SUM(q.estimated_price), 0) / COUNT(DISTINCT q.id))::NUMERIC, 2)
      ELSE 0 
    END as avg_quote_value
  INTO today_metrics
  FROM public.profiles p
  FULL OUTER JOIN public.repairer_profiles rp ON true
  FULL OUTER JOIN public.quotes_with_timeline q ON true
  FULL OUTER JOIN public.appointments a ON true
  FULL OUTER JOIN public.payments pay ON pay.created_at::DATE = CURRENT_DATE
  FULL OUTER JOIN public.transaction_commissions tc ON tc.payment_date::DATE = CURRENT_DATE;
  
  -- Insérer ou mettre à jour le snapshot
  INSERT INTO public.admin_metrics_snapshot (
    snapshot_date,
    total_users,
    total_repairers,
    active_repairers,
    total_quotes,
    total_appointments,
    total_revenue,
    total_commissions,
    conversion_rate,
    avg_quote_value
  ) VALUES (
    CURRENT_DATE,
    today_metrics.total_users,
    today_metrics.total_repairers,
    today_metrics.active_repairers,
    today_metrics.total_quotes,
    today_metrics.total_appointments,
    today_metrics.total_revenue,
    today_metrics.total_commissions,
    today_metrics.conversion_rate,
    today_metrics.avg_quote_value
  )
  ON CONFLICT (snapshot_date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    total_repairers = EXCLUDED.total_repairers,
    active_repairers = EXCLUDED.active_repairers,
    total_quotes = EXCLUDED.total_quotes,
    total_appointments = EXCLUDED.total_appointments,
    total_revenue = EXCLUDED.total_revenue,
    total_commissions = EXCLUDED.total_commissions,
    conversion_rate = EXCLUDED.conversion_rate,
    avg_quote_value = EXCLUDED.avg_quote_value,
    created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.commission_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_metrics_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout voir/modifier
CREATE POLICY "Admins manage commission tiers" ON public.commission_tiers FOR ALL USING (public.get_current_user_role() = 'admin');
CREATE POLICY "Admins view all commissions" ON public.transaction_commissions FOR SELECT USING (public.get_current_user_role() = 'admin');
CREATE POLICY "Admins view metrics" ON public.admin_metrics_snapshot FOR SELECT USING (public.get_current_user_role() = 'admin');
CREATE POLICY "Admins manage webhooks" ON public.stripe_webhooks FOR ALL USING (public.get_current_user_role() = 'admin');

-- Réparateurs voient leurs propres commissions
CREATE POLICY "Repairers view own commissions" ON public.transaction_commissions FOR SELECT USING (repairer_id = auth.uid());

-- Users voient leurs propres notifications
CREATE POLICY "Users view own notifications" ON public.push_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.push_notifications FOR UPDATE USING (user_id = auth.uid());