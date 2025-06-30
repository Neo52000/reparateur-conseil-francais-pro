
-- Créer la table des factures
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  quote_id UUID REFERENCES quotes_with_timeline(id),
  appointment_id UUID REFERENCES appointments_with_quotes(id),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des lignes de facture
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK (item_type IN ('service', 'part', 'labor', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des garanties
CREATE TABLE public.warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  quote_id UUID REFERENCES quotes_with_timeline(id),
  repair_type TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  warranty_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  warranty_end_date DATE NOT NULL,
  warranty_duration_days INTEGER NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'claimed', 'void')),
  terms_conditions TEXT,
  claim_description TEXT,
  claim_date TIMESTAMP WITH TIME ZONE,
  claim_status TEXT CHECK (claim_status IN ('pending', 'approved', 'rejected', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des critères d'avis
CREATE TABLE public.review_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des avis clients
CREATE TABLE public.client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  quote_id UUID REFERENCES quotes_with_timeline(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  criteria_ratings JSONB NOT NULL DEFAULT '{}',
  comment TEXT,
  pros TEXT,
  cons TEXT,
  would_recommend BOOLEAN,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  moderation_notes TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les critères d'avis par défaut
INSERT INTO public.review_criteria (name, description, display_order) VALUES
('quality', 'Qualité de la réparation', 1),
('speed', 'Rapidité du service', 2),
('price', 'Rapport qualité-prix', 3),
('communication', 'Qualité de la communication', 4),
('professionalism', 'Professionnalisme', 5);

-- Activer RLS sur toutes les tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les factures
CREATE POLICY "Clients can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Repairers can view invoices for their services" ON public.invoices
  FOR SELECT USING (auth.uid() = repairer_id);
CREATE POLICY "Admins can view all invoices" ON public.invoices
  FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour les lignes de facture
CREATE POLICY "Users can view invoice items for their invoices" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.client_id = auth.uid() OR invoices.repairer_id = auth.uid())
    )
  );
CREATE POLICY "Admins can view all invoice items" ON public.invoice_items
  FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour les garanties
CREATE POLICY "Clients can view their own warranties" ON public.warranties
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can update their warranty claims" ON public.warranties
  FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Repairers can view warranties for their services" ON public.warranties
  FOR SELECT USING (auth.uid() = repairer_id);
CREATE POLICY "Admins can manage all warranties" ON public.warranties
  FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour les critères d'avis
CREATE POLICY "Anyone can view active review criteria" ON public.review_criteria
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage review criteria" ON public.review_criteria
  FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour les avis clients
CREATE POLICY "Clients can view and create their own reviews" ON public.client_reviews
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can insert their own reviews" ON public.client_reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their pending reviews" ON public.client_reviews
  FOR UPDATE USING (auth.uid() = client_id AND status = 'pending');
CREATE POLICY "Repairers can view approved reviews about them" ON public.client_reviews
  FOR SELECT USING (auth.uid() = repairer_id AND status = 'approved');
CREATE POLICY "Admins can manage all reviews" ON public.client_reviews
  FOR ALL USING (get_current_user_role() = 'admin');

-- Créer les triggers pour updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranties_updated_at
  BEFORE UPDATE ON public.warranties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_reviews_updated_at
  BEFORE UPDATE ON public.client_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Créer des index pour les performances
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_repairer_id ON public.invoices(repairer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_warranties_client_id ON public.warranties(client_id);
CREATE INDEX idx_warranties_repairer_id ON public.warranties(repairer_id);
CREATE INDEX idx_warranties_status ON public.warranties(status);
CREATE INDEX idx_client_reviews_client_id ON public.client_reviews(client_id);
CREATE INDEX idx_client_reviews_repairer_id ON public.client_reviews(repairer_id);
CREATE INDEX idx_client_reviews_status ON public.client_reviews(status);
