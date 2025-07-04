-- =========================================
-- PHASE 2: ARCHITECTURE BASE DE DONNÉES POS & E-COMMERCE (CORRIGÉE)
-- =========================================

-- Table sessions POS (sessions de vente en magasin)
CREATE TABLE public.pos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number TEXT NOT NULL, -- Numéro de session unique par jour
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  cash_drawer_start DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_drawer_end DECIMAL(10,2),
  employee_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index unique pour session par réparateur par jour
CREATE UNIQUE INDEX pos_sessions_unique_daily 
ON public.pos_sessions (repairer_id, session_number, DATE(started_at));

-- Table transactions POS (ventes, réparations, retours)
CREATE TABLE public.pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.pos_sessions(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_number TEXT NOT NULL, -- Numéro de transaction unique
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'repair', 'return', 'refund')),
  customer_id UUID, -- Référence optionnelle au client
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  
  -- Montants
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Paiement
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'check', 'transfer', 'mixed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  payment_details JSONB DEFAULT '{}',
  
  -- Conformité NF-525
  fiscal_receipt_number TEXT UNIQUE,
  fiscal_signature TEXT,
  fiscal_counter INTEGER,
  
  -- Références
  appointment_id UUID, -- Lien avec rendez-vous
  repair_order_id UUID, -- Lien avec ordre de réparation
  
  -- Timestamps
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table items de transaction POS
CREATE TABLE public.pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service', 'repair')),
  item_name TEXT NOT NULL,
  item_sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Détails spécifiques
  product_id UUID, -- Référence produit si applicable
  repair_details JSONB, -- Détails réparation si service
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table inventaire POS synchronisé
CREATE TABLE public.pos_inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  
  -- Prix et coûts
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2) NOT NULL,
  retail_price DECIMAL(10,2),
  
  -- Stock
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER,
  
  -- Localisation
  location TEXT, -- Emplacement physique
  shelf_position TEXT,
  
  -- Attributs
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_trackable BOOLEAN NOT NULL DEFAULT true,
  weight DECIMAL(8,3),
  dimensions JSONB, -- {width, height, depth}
  
  -- Synchronisation
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_source TEXT CHECK (sync_source IN ('pos', 'dashboard', 'ecommerce')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, sku)
);

-- =========================================
-- TABLES E-COMMERCE
-- =========================================

-- Table produits e-commerce
CREATE TABLE public.ecommerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly
  description TEXT,
  short_description TEXT,
  
  -- Prix
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- Prix barré
  cost_price DECIMAL(10,2),
  
  -- Stock (synchronisé avec POS)
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  manage_stock BOOLEAN NOT NULL DEFAULT true,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  
  -- Images et médias
  featured_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Catégorisation
  category TEXT,
  tags TEXT[],
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Attributs physiques
  weight DECIMAL(8,3),
  dimensions JSONB,
  shipping_required BOOLEAN NOT NULL DEFAULT true,
  
  -- Synchronisation
  inventory_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, sku),
  UNIQUE(repairer_id, slug)
);

-- Table commandes e-commerce
CREATE TABLE public.ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  
  -- Client
  customer_id UUID, -- Référence client si compte
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Adresses
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Montants
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Statuts
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  
  -- Paiement
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Livraison
  shipping_method TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table items de commande e-commerce
CREATE TABLE public.ecommerce_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.ecommerce_products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table clients e-commerce
CREATE TABLE public.ecommerce_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Préférences
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Adresses par défaut
  default_billing_address JSONB,
  default_shipping_address JSONB,
  
  -- Statistiques
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, email)
);

-- =========================================
-- TABLES DE SYNCHRONISATION
-- =========================================

-- Log de synchronisation pour traçabilité
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('pos_to_dashboard', 'dashboard_to_pos', 'pos_to_ecommerce', 'ecommerce_to_pos', 'dashboard_to_ecommerce')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'repair', 'inventory', 'customer', 'product', 'order')),
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  
  -- Données
  before_data JSONB,
  after_data JSONB,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed', 'conflict')),
  error_message TEXT,
  
  -- Résolution de conflits
  conflict_resolution TEXT CHECK (conflict_resolution IN ('pos_wins', 'dashboard_wins', 'ecommerce_wins', 'manual')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Queue de synchronisation offline
CREATE TABLE public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'inventory_adjustment', 'customer', 'appointment')),
  entity_data JSONB NOT NULL,
  
  -- Synchronisation
  sync_status TEXT NOT NULL DEFAULT 'queued' CHECK (sync_status IN ('queued', 'syncing', 'synced', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Priorité
  priority INTEGER NOT NULL DEFAULT 1, -- 1=high, 2=medium, 3=low
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =========================================
-- POLITIQUES RLS
-- =========================================

-- Enable RLS sur toutes les tables
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;