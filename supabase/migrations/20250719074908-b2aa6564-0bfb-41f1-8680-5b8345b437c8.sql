
-- Phase 1: Tables pour profils clients POS
CREATE TABLE public.pos_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_number TEXT NOT NULL, -- Numéro client unique par réparateur
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address JSONB, -- Adresse complète structurée
  
  -- Fidélisation et préférences
  loyalty_status TEXT DEFAULT 'standard' CHECK (loyalty_status IN ('standard', 'silver', 'gold', 'platinum')),
  loyalty_points INTEGER DEFAULT 0,
  preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms')),
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Notes et tags
  private_notes TEXT,
  tags TEXT[],
  
  -- Statistiques
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, customer_number)
);

-- Phase 2: Tables pour gestion du personnel
CREATE TABLE public.pos_staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]', -- Array de permissions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, role_name)
);

CREATE TABLE public.pos_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.pos_staff_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(repairer_id, staff_user_id, role_id)
);

-- Phase 3: Configuration des moyens de paiement
CREATE TABLE public.pos_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('cash', 'card', 'mobile_pay', 'bank_transfer', 'check', 'crypto')),
  method_name TEXT NOT NULL, -- Ex: "Stripe Terminal", "Apple Pay", etc.
  configuration JSONB DEFAULT '{}', -- Config spécifique (clés API, etc.)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(repairer_id, method_type, method_name)
);

-- Phase 4: Configuration matérielle
CREATE TABLE public.pos_hardware_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('scanner', 'printer', 'cash_drawer', 'display', 'scale')),
  device_name TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('usb', 'bluetooth', 'wifi', 'serial')),
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_connected TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 5: Queue offline avancée avec priorité
CREATE TABLE public.pos_offline_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('transaction', 'customer_update', 'inventory_update', 'staff_action')),
  operation_data JSONB NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
  
  -- Statut et tentatives
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  error_message TEXT,
  device_id TEXT, -- Identifiant du device qui a créé l'opération
  session_id TEXT -- Identifiant de session POS
);

-- Phase 6: Rapports pré-calculés pour performance
CREATE TABLE public.pos_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  UNIQUE(repairer_id, report_type, date_range_start, date_range_end)
);

-- Enable RLS sur toutes les nouvelles tables
ALTER TABLE public.pos_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_hardware_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_offline_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour les clients POS
CREATE POLICY "Repairers can manage their POS customers" ON public.pos_customers FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les rôles du personnel
CREATE POLICY "Repairers can manage their staff roles" ON public.pos_staff_roles FOR ALL USING (auth.uid() = repairer_id);
CREATE POLICY "Repairers can manage their staff assignments" ON public.pos_staff_assignments FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les moyens de paiement
CREATE POLICY "Repairers can manage their payment methods" ON public.pos_payment_methods FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour la configuration matérielle
CREATE POLICY "Repairers can manage their hardware config" ON public.pos_hardware_config FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les opérations offline
CREATE POLICY "Repairers can manage their offline operations" ON public.pos_offline_operations FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour le cache analytics
CREATE POLICY "Repairers can access their analytics cache" ON public.pos_analytics_cache FOR ALL USING (auth.uid() = repairer_id);

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION public.generate_pos_customer_number(repairer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  customer_number TEXT;
BEGIN
  -- Créer un préfixe basé sur l'année
  prefix := 'C' || TO_CHAR(CURRENT_DATE, 'YY') || '-';
  
  -- Obtenir le compteur pour ce réparateur cette année
  SELECT COALESCE(MAX(
    CASE WHEN customer_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(customer_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.pos_customers 
  WHERE pos_customers.repairer_id = generate_pos_customer_number.repairer_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  customer_number := prefix || LPAD(counter::TEXT, 5, '0');
  
  RETURN customer_number;
END;
$$;

-- Trigger pour générer automatiquement les numéros de client
CREATE OR REPLACE FUNCTION public.auto_generate_pos_customer_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_number IS NULL THEN
    NEW.customer_number := generate_pos_customer_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_pos_customer_number
  BEFORE INSERT ON public.pos_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_pos_customer_number();

-- Triggers pour updated_at
CREATE TRIGGER update_pos_customers_updated_at
  BEFORE UPDATE ON public.pos_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_staff_roles_updated_at
  BEFORE UPDATE ON public.pos_staff_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_payment_methods_updated_at
  BEFORE UPDATE ON public.pos_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_hardware_config_updated_at
  BEFORE UPDATE ON public.pos_hardware_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour vérifier les permissions du personnel
CREATE OR REPLACE FUNCTION public.has_pos_permission(staff_user_id UUID, repairer_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.pos_staff_assignments psa
    JOIN public.pos_staff_roles psr ON psa.role_id = psr.id
    WHERE psa.staff_user_id = has_pos_permission.staff_user_id
      AND psa.repairer_id = has_pos_permission.repairer_id
      AND psa.is_active = true
      AND psr.is_active = true
      AND psr.permissions ? permission_name
  );
$$;

-- Index pour performance
CREATE INDEX idx_pos_customers_repairer_search ON public.pos_customers (repairer_id, first_name, last_name, email);
CREATE INDEX idx_pos_transactions_customer ON public.pos_transactions (customer_id, transaction_date);
CREATE INDEX idx_pos_offline_operations_sync ON public.pos_offline_operations (repairer_id, sync_status, priority, scheduled_sync_at);
CREATE INDEX idx_pos_analytics_cache_lookup ON public.pos_analytics_cache (repairer_id, report_type, date_range_start, date_range_end);
