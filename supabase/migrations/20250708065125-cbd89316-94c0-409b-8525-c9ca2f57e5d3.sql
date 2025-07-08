-- Phase 7: Tables pour l'e-commerce intégré

-- Table des produits e-commerce
CREATE TABLE public.ecommerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock',
  is_on_sale BOOLEAN DEFAULT false,
  is_free_shipping BOOLEAN DEFAULT false,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(repairer_id, sku)
);

-- Table du panier
CREATE TABLE public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  product_id UUID REFERENCES ecommerce_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des commandes e-commerce
CREATE TABLE public.ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  repairer_id UUID NOT NULL,
  customer_id UUID,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  stripe_session_id TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des paramètres Stripe par réparateur (Phase 8)
CREATE TABLE public.repairer_stripe_config (
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
CREATE TABLE public.inventory_items (
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
CREATE TABLE public.stock_movements (
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
CREATE TABLE public.ecommerce_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des préférences utilisateur (Phase 11)
CREATE TABLE public.user_preferences (
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
CREATE TABLE public.notifications (
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

-- Enable RLS
ALTER TABLE ecommerce_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairer_stripe_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Produits: visibles par tous, modifiables par le réparateur propriétaire
CREATE POLICY "Products are viewable by everyone" ON ecommerce_products FOR SELECT USING (is_active = true);
CREATE POLICY "Repairers can manage their products" ON ecommerce_products FOR ALL USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
);

-- Panier: visible et modifiable par l'utilisateur
CREATE POLICY "Users can manage their cart" ON shopping_cart FOR ALL USING (
  user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
);

-- Commandes: visibles par le client et le réparateur
CREATE POLICY "Customers can view their orders" ON ecommerce_orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Repairers can view orders for their products" ON ecommerce_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
);

-- Config Stripe: accessible uniquement par le réparateur propriétaire
CREATE POLICY "Repairers can manage their Stripe config" ON repairer_stripe_config FOR ALL USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
);

-- Inventaire: accessible par le réparateur propriétaire
CREATE POLICY "Repairers can manage their inventory" ON inventory_items FOR ALL USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
);

-- Mouvements de stock: visibles par le réparateur
CREATE POLICY "Repairers can view stock movements" ON stock_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM inventory_items WHERE id = inventory_item_id AND EXISTS (
    SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = inventory_items.repairer_id::text
  ))
);

-- Analytics: accessibles par le réparateur et les admins
CREATE POLICY "Repairers can view their analytics" ON ecommerce_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id::text = repairer_id::text)
  OR get_current_user_role() = 'admin'
);

-- Préférences: accessibles par l'utilisateur propriétaire
CREATE POLICY "Users can manage their preferences" ON user_preferences FOR ALL USING (user_id = auth.uid());

-- Notifications: visibles par l'utilisateur destinataire
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (
  user_id = auth.uid() OR repairer_id IN (
    SELECT id::text FROM repairer_profiles WHERE user_id = auth.uid()
  )
);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ecommerce_products_updated_at BEFORE UPDATE ON ecommerce_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ecommerce_orders_updated_at BEFORE UPDATE ON ecommerce_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_repairer_stripe_config_updated_at BEFORE UPDATE ON repairer_stripe_config FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();