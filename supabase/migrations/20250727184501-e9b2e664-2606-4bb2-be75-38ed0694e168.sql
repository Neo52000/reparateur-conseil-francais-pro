-- Phase 2: Tables pour le module publicitaire IA
CREATE TABLE public.ai_campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('text', 'image', 'video', 'carousel')),
  creative_style TEXT NOT NULL CHECK (creative_style IN ('technique', 'proximite', 'urgence', 'humour', 'premium')),
  template_data JSONB NOT NULL DEFAULT '{}',
  ai_model TEXT DEFAULT 'mistral',
  generation_prompt TEXT,
  performance_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.zapier_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  trigger_events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 3: Tables pour e-commerce et POS amélioré
CREATE TABLE public.store_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#10B981',
  font_family TEXT DEFAULT 'Inter',
  custom_css TEXT,
  theme_settings JSONB DEFAULT '{}',
  domain_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment', 'transfer'
  reference_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.ai_campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zapier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ai_campaign_templates
CREATE POLICY "Repairers manage own templates" ON public.ai_campaign_templates
  FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour zapier_integrations
CREATE POLICY "Repairers manage own Zapier integrations" ON public.zapier_integrations
  FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour store_customizations
CREATE POLICY "Repairers manage own store customizations" ON public.store_customizations
  FOR ALL USING (repairer_id = auth.uid());

-- Politiques RLS pour audit_logs
CREATE POLICY "Repairers view own audit logs" ON public.audit_logs
  FOR SELECT USING (repairer_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour inventory_movements
CREATE POLICY "Repairers manage own inventory movements" ON public.inventory_movements
  FOR ALL USING (repairer_id = auth.uid());

-- Triggers pour updated_at
CREATE TRIGGER update_ai_campaign_templates_updated_at
  BEFORE UPDATE ON public.ai_campaign_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zapier_integrations_updated_at
  BEFORE UPDATE ON public.zapier_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_customizations_updated_at
  BEFORE UPDATE ON public.store_customizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_ai_campaign_templates_repairer ON public.ai_campaign_templates(repairer_id);
CREATE INDEX idx_zapier_integrations_repairer ON public.zapier_integrations(repairer_id);
CREATE INDEX idx_store_customizations_repairer ON public.store_customizations(repairer_id);
CREATE INDEX idx_audit_logs_repairer_created ON public.audit_logs(repairer_id, created_at DESC);
CREATE INDEX idx_inventory_movements_repairer_product ON public.inventory_movements(repairer_id, product_sku);