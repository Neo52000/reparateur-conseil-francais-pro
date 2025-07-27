-- Vérifier et créer les tables manquantes pour le système de réparation

-- Table repair_devices si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.repair_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  device_type_id UUID REFERENCES public.device_types(id),
  brand_id UUID REFERENCES public.brands(id),
  device_model_id UUID REFERENCES public.device_models(id),
  imei_serial TEXT,
  custom_device_info TEXT,
  initial_condition_id UUID REFERENCES public.device_conditions(id),
  current_condition_id UUID REFERENCES public.device_conditions(id),
  pin_code TEXT,
  sim_code TEXT,
  lock_pattern TEXT,
  security_notes TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_notes TEXT,
  initial_diagnosis TEXT,
  estimated_cost NUMERIC,
  estimated_duration_hours INTEGER,
  intake_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  photos TEXT[] DEFAULT '{}',
  accessories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table repair_orders si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.repair_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  repairer_id UUID NOT NULL,
  device_id UUID REFERENCES public.repair_devices(id),
  status TEXT NOT NULL DEFAULT 'diagnostic',
  quote_amount NUMERIC,
  final_amount NUMERIC,
  quote_accepted_at TIMESTAMP WITH TIME ZONE,
  quote_expires_at TIMESTAMP WITH TIME ZONE,
  customer_signature_data TEXT,
  customer_signature_date TIMESTAMP WITH TIME ZONE,
  technician_id UUID,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  technician_notes TEXT,
  internal_notes TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table device_conditions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.device_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer des conditions d'appareil par défaut si elles n'existent pas
INSERT INTO public.device_conditions (name, description, color, is_active)
SELECT * FROM (VALUES
  ('Excellent', 'Appareil comme neuf, aucun défaut visible', '#22c55e', true),
  ('Bon', 'Appareil en bon état, légères traces d''usage', '#84cc16', true),
  ('Moyen', 'Appareil fonctionnel avec défauts esthétiques', '#eab308', true),
  ('Mauvais', 'Appareil endommagé mais réparable', '#f97316', true),
  ('Hors service', 'Appareil non fonctionnel', '#ef4444', true)
) AS conditions(name, description, color, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.device_conditions LIMIT 1
);

-- Activer RLS sur les tables
ALTER TABLE public.repair_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_conditions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour repair_devices
DROP POLICY IF EXISTS "Repairers can manage their own devices" ON public.repair_devices;
CREATE POLICY "Repairers can manage their own devices" ON public.repair_devices
  FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour repair_orders
DROP POLICY IF EXISTS "Repairers can manage their own orders" ON public.repair_orders;
CREATE POLICY "Repairers can manage their own orders" ON public.repair_orders
  FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour device_conditions
DROP POLICY IF EXISTS "Anyone can view active conditions" ON public.device_conditions;
CREATE POLICY "Anyone can view active conditions" ON public.device_conditions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage conditions" ON public.device_conditions;
CREATE POLICY "Admins can manage conditions" ON public.device_conditions
  FOR ALL USING (get_current_user_role() = 'admin');

-- Trigger pour auto-générer les numéros d'ordre
CREATE OR REPLACE FUNCTION public.auto_generate_repair_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_repair_order_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_repair_order_number ON public.repair_orders;
CREATE TRIGGER trigger_auto_generate_repair_order_number
  BEFORE INSERT ON public.repair_orders
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_repair_order_number();