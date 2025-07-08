-- Phase 7-12: Créer uniquement les nouvelles tables nécessaires

-- Table du panier (si n'existe pas)
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  product_id UUID REFERENCES ecommerce_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des paramètres Stripe par réparateur (Phase 8)
CREATE TABLE IF NOT EXISTS public.repairer_stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL UNIQUE,
  stripe_account_id TEXT,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT, -- Chiffré côté application
  commission_rate NUMERIC(5,2) DEFAULT 5.00,
  auto_transfer BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table de l'inventaire (Phase 9)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  product_id UUID REFERENCES ecommerce_products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER DEFAULT 1000,
  location TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- Référence à une commande, etc.
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des analytics e-commerce (Phase 10)
CREATE TABLE IF NOT EXISTS public.ecommerce_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des préférences utilisateur (Phase 11)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  favorite_products UUID[],
  recently_viewed UUID[],
  preferred_brands TEXT[],
  preferred_categories TEXT[],
  notification_settings JSONB DEFAULT '{}'::jsonb,
  display_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des notifications (Phase 12)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  repairer_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS pour les nouvelles tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shopping_cart') THEN
    ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their cart" ON shopping_cart FOR ALL USING (
      user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repairer_stripe_config') THEN
    ALTER TABLE repairer_stripe_config ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Repairers can manage their Stripe config" ON repairer_stripe_config FOR ALL USING (
      EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items') THEN
    ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Repairers can manage their inventory" ON inventory_items FOR ALL USING (
      EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements') THEN
    ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Repairers can view stock movements" ON stock_movements FOR SELECT USING (
      EXISTS (SELECT 1 FROM inventory_items WHERE id = inventory_item_id AND EXISTS (
        SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = inventory_items.repairer_id::text
      ))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecommerce_analytics') THEN
    ALTER TABLE ecommerce_analytics ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Repairers can view their analytics" ON ecommerce_analytics FOR SELECT USING (
      EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
      OR get_current_user_role() = 'admin'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences') THEN
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their preferences" ON user_preferences FOR ALL USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (
      user_id = auth.uid() OR repairer_id IN (
        SELECT id::text FROM repairer_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;