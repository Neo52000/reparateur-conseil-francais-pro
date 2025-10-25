-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SHOPIFY STORES TABLE (Multi-tenant per repairer)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopify_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Shopify Store Info
  shop_domain TEXT UNIQUE NOT NULL, -- xxx.myshopify.com
  access_token TEXT, -- Encrypted in production
  storefront_access_token TEXT,
  
  -- Store Status
  store_status TEXT NOT NULL DEFAULT 'sandbox' CHECK (store_status IN ('sandbox', 'development', 'active', 'suspended', 'claimed')),
  is_development_store BOOLEAN DEFAULT true,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Store Configuration
  store_name TEXT,
  store_email TEXT,
  store_currency TEXT DEFAULT 'EUR',
  store_timezone TEXT DEFAULT 'Europe/Paris',
  
  -- Platform Commission (3% default)
  commission_rate NUMERIC(5,2) DEFAULT 3.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  
  -- Shopify Plan Info
  shopify_plan_name TEXT,
  shopify_plan_display_name TEXT,
  
  -- Sync Settings
  auto_sync_inventory BOOLEAN DEFAULT true,
  auto_sync_orders BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  shopify_store_id BIGINT, -- Shopify's internal store ID
  setup_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shopify_stores
CREATE INDEX idx_shopify_stores_repairer ON public.shopify_stores(repairer_id);
CREATE INDEX idx_shopify_stores_status ON public.shopify_stores(store_status);
CREATE INDEX idx_shopify_stores_domain ON public.shopify_stores(shop_domain);

-- RLS Policies for shopify_stores
ALTER TABLE public.shopify_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their own Shopify stores"
  ON public.shopify_stores FOR SELECT
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can insert their own Shopify stores"
  ON public.shopify_stores FOR INSERT
  WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Repairers can update their own Shopify stores"
  ON public.shopify_stores FOR UPDATE
  USING (auth.uid() = repairer_id);

CREATE POLICY "Admins can view all Shopify stores"
  ON public.shopify_stores FOR SELECT
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all Shopify stores"
  ON public.shopify_stores FOR UPDATE
  USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- SHOPIFY WEBHOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopify_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.shopify_stores(id) ON DELETE CASCADE,
  
  -- Webhook Info
  webhook_topic TEXT NOT NULL, -- orders/create, products/update, etc.
  webhook_id TEXT, -- Shopify's webhook ID
  
  -- Webhook Data
  payload JSONB NOT NULL,
  headers JSONB,
  
  -- Processing Status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shopify_webhooks
CREATE INDEX idx_shopify_webhooks_store ON public.shopify_webhooks(store_id);
CREATE INDEX idx_shopify_webhooks_topic ON public.shopify_webhooks(webhook_topic);
CREATE INDEX idx_shopify_webhooks_status ON public.shopify_webhooks(processing_status);
CREATE INDEX idx_shopify_webhooks_created ON public.shopify_webhooks(created_at DESC);

-- RLS Policies for shopify_webhooks
ALTER TABLE public.shopify_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their store webhooks"
  ON public.shopify_webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopify_stores 
      WHERE shopify_stores.id = shopify_webhooks.store_id 
      AND shopify_stores.repairer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all webhooks"
  ON public.shopify_webhooks FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- SHOPIFY ORDER COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopify_order_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.shopify_stores(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Shopify Order Info
  shopify_order_id BIGINT NOT NULL,
  shopify_order_number TEXT,
  shopify_order_name TEXT, -- #1001
  
  -- Financial Data
  order_total_amount NUMERIC(10,2) NOT NULL,
  order_currency TEXT DEFAULT 'EUR',
  
  -- Commission Calculation
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  repairer_net_amount NUMERIC(10,2) NOT NULL,
  
  -- Payment Status
  commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'calculated', 'paid', 'disputed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  
  -- Order Details
  customer_email TEXT,
  order_items JSONB,
  order_fulfillment_status TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(store_id, shopify_order_id)
);

-- Indexes for shopify_order_commissions
CREATE INDEX idx_shopify_commissions_store ON public.shopify_order_commissions(store_id);
CREATE INDEX idx_shopify_commissions_repairer ON public.shopify_order_commissions(repairer_id);
CREATE INDEX idx_shopify_commissions_status ON public.shopify_order_commissions(commission_status);
CREATE INDEX idx_shopify_commissions_created ON public.shopify_order_commissions(created_at DESC);

-- RLS Policies for shopify_order_commissions
ALTER TABLE public.shopify_order_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their own commissions"
  ON public.shopify_order_commissions FOR SELECT
  USING (auth.uid() = repairer_id);

CREATE POLICY "Admins can view all commissions"
  ON public.shopify_order_commissions FOR SELECT
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update commissions"
  ON public.shopify_order_commissions FOR UPDATE
  USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- SHOPIFY POS LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopify_pos_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.shopify_stores(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Shopify Location Info
  shopify_location_id BIGINT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'France',
  zip_code TEXT,
  
  -- Location Settings
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  
  -- POS Hardware
  has_pos_hardware BOOLEAN DEFAULT false,
  pos_device_name TEXT,
  pos_device_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shopify_pos_locations
CREATE INDEX idx_shopify_pos_locations_store ON public.shopify_pos_locations(store_id);
CREATE INDEX idx_shopify_pos_locations_repairer ON public.shopify_pos_locations(repairer_id);
CREATE INDEX idx_shopify_pos_locations_active ON public.shopify_pos_locations(is_active);

-- RLS Policies for shopify_pos_locations
ALTER TABLE public.shopify_pos_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their POS locations"
  ON public.shopify_pos_locations FOR SELECT
  USING (auth.uid() = repairer_id);

CREATE POLICY "Repairers can manage their POS locations"
  ON public.shopify_pos_locations FOR ALL
  USING (auth.uid() = repairer_id);

CREATE POLICY "Admins can view all POS locations"
  ON public.shopify_pos_locations FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- SHOPIFY SYNC LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopify_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.shopify_stores(id) ON DELETE CASCADE,
  
  -- Sync Info
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'inventory', 'orders', 'customers', 'full')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('shopify_to_platform', 'platform_to_shopify', 'bidirectional')),
  
  -- Sync Results
  sync_status TEXT DEFAULT 'in_progress' CHECK (sync_status IN ('in_progress', 'completed', 'failed', 'partial')),
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  items_synced INTEGER DEFAULT 0,
  
  -- Details
  error_details JSONB,
  sync_summary JSONB,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for shopify_sync_logs
CREATE INDEX idx_shopify_sync_logs_store ON public.shopify_sync_logs(store_id);
CREATE INDEX idx_shopify_sync_logs_type ON public.shopify_sync_logs(sync_type);
CREATE INDEX idx_shopify_sync_logs_status ON public.shopify_sync_logs(sync_status);

-- RLS Policies for shopify_sync_logs
ALTER TABLE public.shopify_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their sync logs"
  ON public.shopify_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopify_stores 
      WHERE shopify_stores.id = shopify_sync_logs.store_id 
      AND shopify_stores.repairer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all sync logs"
  ON public.shopify_sync_logs FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate Shopify commission
CREATE OR REPLACE FUNCTION public.calculate_shopify_commission(
  order_total NUMERIC,
  commission_rate_param NUMERIC
) RETURNS TABLE (
  commission_amount NUMERIC,
  platform_fee NUMERIC,
  repairer_net_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND((order_total * commission_rate_param / 100)::NUMERIC, 2) as commission_amount,
    ROUND((order_total * commission_rate_param / 100)::NUMERIC, 2) as platform_fee,
    ROUND((order_total - (order_total * commission_rate_param / 100))::NUMERIC, 2) as repairer_net_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if repairer has Shopify module access
CREATE OR REPLACE FUNCTION public.has_shopify_ecommerce_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_module_access(user_id, 'ecommerce');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_shopify_pos_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_module_access(user_id, 'pos');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Trigger to update updated_at on shopify_stores
CREATE OR REPLACE FUNCTION public.update_shopify_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopify_stores_updated_at
BEFORE UPDATE ON public.shopify_stores
FOR EACH ROW
EXECUTE FUNCTION public.update_shopify_stores_updated_at();

-- Trigger to update updated_at on shopify_order_commissions
CREATE TRIGGER shopify_commissions_updated_at
BEFORE UPDATE ON public.shopify_order_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on shopify_pos_locations
CREATE TRIGGER shopify_pos_locations_updated_at
BEFORE UPDATE ON public.shopify_pos_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ADMIN VIEWS
-- =====================================================

-- View for admin Shopify stores overview
CREATE OR REPLACE VIEW public.admin_shopify_stores_overview AS
SELECT 
  ss.id,
  ss.repairer_id,
  p.email as repairer_email,
  COALESCE(p.first_name || ' ' || p.last_name, p.email) as repairer_name,
  ss.shop_domain,
  ss.store_status,
  ss.store_name,
  ss.claimed_at,
  ss.commission_rate,
  ss.created_at,
  COUNT(DISTINCT soc.id) as total_orders,
  COALESCE(SUM(soc.order_total_amount), 0) as total_revenue,
  COALESCE(SUM(soc.commission_amount), 0) as total_commissions
FROM public.shopify_stores ss
LEFT JOIN public.profiles p ON ss.repairer_id = p.id
LEFT JOIN public.shopify_order_commissions soc ON ss.id = soc.store_id
GROUP BY ss.id, p.email, p.first_name, p.last_name;

-- Grant access to admin view
GRANT SELECT ON public.admin_shopify_stores_overview TO authenticated;

COMMENT ON TABLE public.shopify_stores IS 'Multi-tenant Shopify stores - one per repairer';
COMMENT ON TABLE public.shopify_webhooks IS 'Shopify webhook events for processing';
COMMENT ON TABLE public.shopify_order_commissions IS 'Platform commissions from Shopify orders';
COMMENT ON TABLE public.shopify_pos_locations IS 'Shopify POS physical locations per repairer';
COMMENT ON TABLE public.shopify_sync_logs IS 'Synchronization logs between platform and Shopify';