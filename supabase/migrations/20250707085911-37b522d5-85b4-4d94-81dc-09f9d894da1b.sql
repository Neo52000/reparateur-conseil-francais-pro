-- =========================================
-- MODULE DE RÉPARATION INTÉGRÉ AU POS
-- =========================================

-- Table des types d'appareils (extension du catalogue existant)
CREATE TABLE public.device_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer les conditions d'appareils
INSERT INTO public.device_conditions (name, description, color, icon) VALUES
('Fonctionnel', 'Appareil en parfait état de marche', '#10b981', 'check-circle'),
('Défaillant', 'Appareil avec défauts mais réparable', '#f59e0b', 'alert-triangle'),
('Irréparable', 'Appareil hors service, irréparable', '#ef4444', 'x-circle'),
('Partiellement fonctionnel', 'Certaines fonctions ne marchent pas', '#6366f1', 'help-circle');

-- Table des appareils en réparation
CREATE TABLE public.repair_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations appareil
  device_type_id UUID REFERENCES public.device_types(id),
  brand_id UUID REFERENCES public.brands(id),
  device_model_id UUID REFERENCES public.device_models(id),
  imei_serial TEXT,
  custom_device_info TEXT, -- Si pas dans le catalogue
  
  -- État et condition
  initial_condition_id UUID REFERENCES public.device_conditions(id),
  current_condition_id UUID REFERENCES public.device_conditions(id),
  
  -- Informations client
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_notes TEXT,
  
  -- Diagnostic et évaluation
  initial_diagnosis TEXT,
  estimated_cost DECIMAL(10,2),
  estimated_duration_hours INTEGER,
  
  -- Suivi
  intake_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  photos JSONB DEFAULT '[]', -- URLs des photos avant/après
  accessories JSONB DEFAULT '[]', -- Accessoires fournis
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des ordres de réparation (workflow principal)
CREATE TABLE public.repair_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.repair_devices(id) ON DELETE CASCADE,
  
  -- Statut de la réparation
  status TEXT NOT NULL DEFAULT 'diagnostic' CHECK (status IN (
    'diagnostic',    -- Diagnostic initial
    'quote_pending', -- Devis en attente d'acceptation
    'quote_accepted',-- Devis accepté, en attente de réparation
    'in_progress',   -- Réparation en cours
    'waiting_parts', -- En attente de pièces
    'testing',       -- Tests post-réparation
    'completed',     -- Réparation terminée
    'ready_pickup',  -- Prêt à récupérer
    'delivered',     -- Livré au client
    'cancelled',     -- Annulé
    'warranty_return' -- Retour sous garantie
  )),
  
  -- Informations financières
  quote_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  quote_accepted_at TIMESTAMP WITH TIME ZONE,
  quote_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Signature électronique
  customer_signature_data TEXT, -- Base64 de la signature
  customer_signature_date TIMESTAMP WITH TIME ZONE,
  
  -- Suivi temps
  technician_id UUID REFERENCES auth.users(id),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes techniques
  technician_notes TEXT,
  internal_notes TEXT,
  
  -- Priorité
  priority INTEGER DEFAULT 1, -- 1=normal, 2=urgent, 3=express
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des pièces utilisées dans les réparations
CREATE TABLE public.repair_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES public.repair_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.pos_inventory_items(id),
  
  -- Si pièce pas en stock
  part_name TEXT NOT NULL,
  part_sku TEXT,
  supplier_info TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  
  -- Traçabilité
  serial_numbers TEXT[],
  warranty_months INTEGER DEFAULT 0,
  warranty_start_date DATE,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'ordered', 'received', 'installed')),
  ordered_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  installed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des étapes de réparation (workflow détaillé)
CREATE TABLE public.repair_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES public.repair_orders(id) ON DELETE CASCADE,
  
  step_name TEXT NOT NULL,
  step_description TEXT,
  step_order INTEGER NOT NULL,
  
  -- Temps et statut
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Résultats
  test_results JSONB DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  notes TEXT,
  
  -- Assignation
  assigned_to UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des fournisseurs de pièces détachées
CREATE TABLE public.parts_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address JSONB,
  
  -- Conditions commerciales
  payment_terms TEXT,
  delivery_time_days INTEGER,
  minimum_order DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  
  -- Évaluation
  rating DECIMAL(3,2),
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Métadonnées
  specialties TEXT[], -- Types de pièces
  supported_brands TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des garanties
CREATE TABLE public.repair_warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES public.repair_orders(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type de garantie
  warranty_type TEXT NOT NULL CHECK (warranty_type IN ('parts', 'labor', 'full', 'manufacturer', 'extended')),
  
  -- Durée
  duration_months INTEGER NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  
  -- Couverture
  covered_parts TEXT[],
  coverage_description TEXT,
  terms_conditions TEXT,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'claimed', 'void')),
  
  -- Réclamations
  claims_count INTEGER DEFAULT 0,
  last_claim_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de la base de données technique
CREATE TABLE public.technical_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Catégorisation
  device_type_id UUID REFERENCES public.device_types(id),
  brand_id UUID REFERENCES public.brands(id),
  device_model_id UUID REFERENCES public.device_models(id),
  
  -- Type de contenu
  content_type TEXT NOT NULL CHECK (content_type IN ('manual', 'schematic', 'procedure', 'troubleshooting', 'common_issue')),
  
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  
  -- Fichiers attachés
  attachments JSONB DEFAULT '[]', -- URLs vers fichiers PDF, images, etc.
  
  -- Métadonnées
  tags TEXT[],
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_time_minutes INTEGER,
  
  -- Utilisation
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Authorship
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur toutes les nouvelles tables
ALTER TABLE public.device_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour les conditions d'appareils (public)
CREATE POLICY "Anyone can view device conditions" ON public.device_conditions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage device conditions" ON public.device_conditions FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies pour les appareils en réparation
CREATE POLICY "Repairers can manage their own repair devices" ON public.repair_devices FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les ordres de réparation
CREATE POLICY "Repairers can manage their own repair orders" ON public.repair_orders FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les pièces utilisées
CREATE POLICY "Repairers can manage parts for their repairs" ON public.repair_parts_used 
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.repair_orders 
  WHERE repair_orders.id = repair_parts_used.repair_order_id 
  AND repair_orders.repairer_id = auth.uid()
));

-- RLS Policies pour les étapes de réparation
CREATE POLICY "Repairers can manage steps for their repairs" ON public.repair_steps 
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.repair_orders 
  WHERE repair_orders.id = repair_steps.repair_order_id 
  AND repair_orders.repairer_id = auth.uid()
));

-- RLS Policies pour les fournisseurs
CREATE POLICY "Repairers can manage their own suppliers" ON public.parts_suppliers FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour les garanties
CREATE POLICY "Repairers can manage their own warranties" ON public.repair_warranties FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour la base de connaissances
CREATE POLICY "Everyone can view public knowledge" ON public.technical_knowledge_base FOR SELECT USING (is_public = true);
CREATE POLICY "Creators can manage their own knowledge" ON public.technical_knowledge_base FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all knowledge" ON public.technical_knowledge_base FOR ALL USING (get_current_user_role() = 'admin');

-- Fonction pour générer des numéros d'ordre de réparation
CREATE OR REPLACE FUNCTION public.generate_repair_order_number(repairer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  prefix TEXT;
  counter INTEGER;
  order_number TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN order_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.repair_orders 
  WHERE repair_orders.repairer_id = generate_repair_order_number.repairer_id
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;

-- Trigger pour générer automatiquement les numéros d'ordre
CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_repair_order_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_repair_order_number
  BEFORE INSERT ON public.repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_repair_order_number();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_repair_devices_updated_at
  BEFORE UPDATE ON public.repair_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_orders_updated_at
  BEFORE UPDATE ON public.repair_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_steps_updated_at
  BEFORE UPDATE ON public.repair_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parts_suppliers_updated_at
  BEFORE UPDATE ON public.parts_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repair_warranties_updated_at
  BEFORE UPDATE ON public.repair_warranties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technical_knowledge_base_updated_at
  BEFORE UPDATE ON public.technical_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();