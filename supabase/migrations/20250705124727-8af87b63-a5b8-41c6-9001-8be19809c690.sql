-- Phase 3: Création des tables pour POS et E-commerce

-- Table pour les systèmes POS des réparateurs
CREATE TABLE public.pos_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  system_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan_type TEXT NOT NULL DEFAULT 'basic', -- basic, pro, enterprise
  monthly_revenue DECIMAL DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les boutiques E-commerce des réparateurs
CREATE TABLE public.ecommerce_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  store_name TEXT NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, maintenance
  plan_type TEXT NOT NULL DEFAULT 'basic', -- basic, pro, enterprise
  monthly_orders INTEGER DEFAULT 0,
  monthly_revenue DECIMAL DEFAULT 0,
  conversion_rate DECIMAL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  store_settings JSONB DEFAULT '{}',
  template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les templates E-commerce
CREATE TABLE public.ecommerce_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les analytics temps réel
CREATE TABLE public.admin_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL, -- pos_transaction, ecommerce_order, system_health, etc.
  repairer_id UUID,
  metric_data JSONB NOT NULL DEFAULT '{}',
  value DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.pos_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour pos_systems
CREATE POLICY "Admins can manage all POS systems" 
ON public.pos_systems 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their own POS systems" 
ON public.pos_systems 
FOR SELECT 
USING (auth.uid() = repairer_id);

-- RLS Policies pour ecommerce_stores
CREATE POLICY "Admins can manage all E-commerce stores" 
ON public.ecommerce_stores 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their own stores" 
ON public.ecommerce_stores 
FOR SELECT 
USING (auth.uid() = repairer_id);

-- RLS Policies pour ecommerce_templates
CREATE POLICY "Admins can manage templates" 
ON public.ecommerce_templates 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Everyone can view templates" 
ON public.ecommerce_templates 
FOR SELECT 
USING (true);

-- RLS Policies pour admin_analytics
CREATE POLICY "Admins can manage analytics" 
ON public.admin_analytics 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE TRIGGER update_pos_systems_updated_at
  BEFORE UPDATE ON public.pos_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_stores_updated_at
  BEFORE UPDATE ON public.ecommerce_stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecommerce_templates_updated_at
  BEFORE UPDATE ON public.ecommerce_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des données de démonstration
INSERT INTO public.pos_systems (repairer_id, system_name, status, plan_type, monthly_revenue, total_transactions) VALUES
(gen_random_uuid(), 'TechRepairer Pro POS', 'active', 'pro', 12450, 234),
(gen_random_uuid(), 'Mobile Fix POS', 'active', 'basic', 8900, 187),
(gen_random_uuid(), 'Quick Repair POS', 'active', 'enterprise', 21300, 356);

INSERT INTO public.ecommerce_stores (repairer_id, store_name, domain, status, plan_type, monthly_orders, monthly_revenue, conversion_rate) VALUES  
(gen_random_uuid(), 'TechStore Pro', 'techstore.repairhub.fr', 'active', 'pro', 156, 18400, 4.2),
(gen_random_uuid(), 'Mobile Parts Shop', 'mobileparts.repairhub.fr', 'active', 'basic', 89, 12200, 2.8),
(gen_random_uuid(), 'Repair Components', 'components.repairhub.fr', 'maintenance', 'enterprise', 234, 28900, 5.1);

INSERT INTO public.ecommerce_templates (name, description, category, is_premium) VALUES
('Minimaliste', 'Template épuré pour pièces détachées', 'parts', false),
('Tech Store', 'Design moderne pour magasins tech', 'electronics', true),
('Réparation Pro', 'Template professionnel avec booking', 'services', true);