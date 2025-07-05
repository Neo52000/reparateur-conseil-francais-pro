-- Phase 4: Tables manquantes pour les transactions et l'inventaire

-- Table pour les transactions POS
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  transaction_number TEXT NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL NOT NULL DEFAULT 0,
  tax_amount DECIMAL NOT NULL DEFAULT 0,
  discount_amount DECIMAL DEFAULT 0,
  total_amount DECIMAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les commandes e-commerce
CREATE TABLE IF NOT EXISTS public.ecommerce_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  customer_id UUID,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL NOT NULL DEFAULT 0,
  shipping_cost DECIMAL DEFAULT 0,
  tax_amount DECIMAL NOT NULL DEFAULT 0,
  discount_amount DECIMAL DEFAULT 0,
  total_amount DECIMAL NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'inventaire synchronisé entre POS et E-commerce
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  model TEXT,
  cost_price DECIMAL,
  selling_price DECIMAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  max_stock_level INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_service BOOLEAN DEFAULT false,
  barcode TEXT,
  supplier_info JSONB,
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repairer_id, sku)
);

-- Table pour les logs de synchronisation entre modules
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les migrations de données des modules
CREATE TABLE IF NOT EXISTS public.module_data_migrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('pos', 'ecommerce')),
  migration_type TEXT NOT NULL,
  migration_status TEXT NOT NULL DEFAULT 'pending',
  source_data JSONB,
  migrated_data JSONB,
  error_message TEXT,
  records_processed INTEGER DEFAULT 0,
  records_migrated INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_data_migrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour pos_transactions
CREATE POLICY "Admins can view all POS transactions" 
ON public.pos_transactions FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their own transactions" 
ON public.pos_transactions FOR ALL 
USING (auth.uid() = repairer_id);

-- RLS Policies pour ecommerce_orders
CREATE POLICY "Admins can view all e-commerce orders" 
ON public.ecommerce_orders FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their own orders" 
ON public.ecommerce_orders FOR ALL 
USING (auth.uid() = repairer_id);

-- RLS Policies pour inventory_items
CREATE POLICY "Admins can view all inventory" 
ON public.inventory_items FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their own inventory" 
ON public.inventory_items FOR ALL 
USING (auth.uid() = repairer_id);

-- RLS Policies pour sync_logs
CREATE POLICY "Admins can view all sync logs" 
ON public.sync_logs FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their own sync logs" 
ON public.sync_logs FOR SELECT 
USING (auth.uid() = repairer_id);

-- RLS Policies pour module_data_migrations
CREATE POLICY "Admins can manage all migrations" 
ON public.module_data_migrations FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their own migrations" 
ON public.module_data_migrations FOR SELECT 
USING (auth.uid() = repairer_id);

-- Triggers pour updated_at
CREATE TRIGGER update_pos_transactions_updated_at
  BEFORE UPDATE ON public.pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_orders_updated_at
  BEFORE UPDATE ON public.ecommerce_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des données de démonstration pour l'inventaire
INSERT INTO public.inventory_items (repairer_id, sku, name, description, category, selling_price, stock_quantity, is_service) VALUES
(gen_random_uuid(), 'IP14-SCREEN-001', 'Écran iPhone 14', 'Écran LCD de remplacement pour iPhone 14', 'Écrans', 89.99, 25, false),
(gen_random_uuid(), 'SAM-S23-BAT-001', 'Batterie Samsung S23', 'Batterie lithium-ion Samsung Galaxy S23', 'Batteries', 45.50, 15, false),
(gen_random_uuid(), 'REP-DIAG-001', 'Diagnostic téléphone', 'Service de diagnostic complet', 'Services', 25.00, 999, true);

-- Insérer des données de démonstration pour les transactions POS
INSERT INTO public.pos_transactions (repairer_id, transaction_number, customer_name, customer_phone, items, subtotal, tax_amount, total_amount, payment_method, payment_status) VALUES
(gen_random_uuid(), 'TXN-20250705-0001', 'Jean Dupont', '0123456789', '[{"name": "Réparation écran iPhone", "price": 89.99, "qty": 1}]'::jsonb, 89.99, 18.00, 107.99, 'carte', 'completed'),
(gen_random_uuid(), 'TXN-20250705-0002', 'Marie Martin', '0987654321', '[{"name": "Remplacement batterie", "price": 45.50, "qty": 1}]'::jsonb, 45.50, 9.10, 54.60, 'especes', 'completed');

-- Insérer des données de démonstration pour les commandes e-commerce
INSERT INTO public.ecommerce_orders (repairer_id, order_number, customer_email, customer_name, customer_phone, items, subtotal, shipping_cost, tax_amount, total_amount, order_status, payment_status) VALUES
(gen_random_uuid(), 'ORD-20250705-0001', 'client@example.com', 'Pierre Durand', '0123456789', '[{"name": "Coque iPhone 14", "price": 19.99, "qty": 2}]'::jsonb, 39.98, 4.90, 8.98, 53.86, 'processing', 'paid'),
(gen_random_uuid(), 'ORD-20250705-0002', 'marie@example.com', 'Marie Leblanc', '0987654321', '[{"name": "Chargeur Samsung", "price": 24.99, "qty": 1}]'::jsonb, 24.99, 3.90, 5.78, 34.67, 'shipped', 'paid');