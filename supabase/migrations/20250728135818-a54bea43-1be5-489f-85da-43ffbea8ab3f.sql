-- ==========================================
-- MODULE QUALIREPAR - Base de données
-- ==========================================

-- Table des règles d'éligibilité par produit/type
CREATE TABLE public.qualirepar_eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_category TEXT NOT NULL, -- 'smartphone', 'tablet', 'laptop', etc.
  brand TEXT,
  model TEXT,
  min_repair_cost NUMERIC(10,2), -- Coût minimum de réparation pour être éligible
  max_bonus_amount NUMERIC(10,2) NOT NULL, -- Montant maximum du bonus
  eco_organism TEXT NOT NULL, -- 'Ecosystem', 'DEEE', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des dossiers de remboursement QualiRépar
CREATE TABLE public.qualirepar_dossiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_number TEXT NOT NULL UNIQUE, -- Numéro unique du dossier
  repairer_id UUID NOT NULL,
  repair_order_id UUID, -- Lien vers la commande de réparation (si applicable)
  pos_transaction_id UUID, -- Lien vers la transaction POS (si applicable)
  
  -- Informations client
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT NOT NULL,
  client_postal_code TEXT NOT NULL,
  client_city TEXT NOT NULL,
  
  -- Informations produit
  product_category TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_model TEXT NOT NULL,
  product_serial_number TEXT,
  
  -- Détails de la réparation
  repair_description TEXT NOT NULL,
  repair_cost NUMERIC(10,2) NOT NULL,
  repair_date DATE NOT NULL,
  
  -- Informations bonus
  eligibility_rule_id UUID REFERENCES public.qualirepar_eligibility_rules(id),
  requested_bonus_amount NUMERIC(10,2) NOT NULL,
  eco_organism TEXT NOT NULL,
  
  -- Statut et suivi
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready_to_submit', 'submitted', 'processing', 'approved', 'paid', 'rejected'
  submission_date TIMESTAMP WITH TIME ZONE,
  processing_date TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_qualirepar_dossiers_eligibility 
    FOREIGN KEY (eligibility_rule_id) REFERENCES public.qualirepar_eligibility_rules(id)
);

-- Table des documents uploadés
CREATE TABLE public.qualirepar_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL REFERENCES public.qualirepar_dossiers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'invoice', 'proof_of_eligibility', 'device_photo', 'repair_report', 'client_signature'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Données OCR extraites (si applicable)
  ocr_data JSONB,
  is_validated BOOLEAN DEFAULT false,
  validation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des soumissions/envois
CREATE TABLE public.qualirepar_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL REFERENCES public.qualirepar_dossiers(id) ON DELETE CASCADE,
  submission_method TEXT NOT NULL, -- 'email', 'api', 'manual'
  recipient_email TEXT,
  api_endpoint TEXT,
  
  -- Données de la soumission
  submission_data JSONB NOT NULL,
  response_data JSONB,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  error_message TEXT,
  
  -- Suivi
  tracking_reference TEXT,
  external_reference TEXT, -- Référence fournie par l'éco-organisme
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des remboursements
CREATE TABLE public.qualirepar_reimbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dossier_id UUID NOT NULL REFERENCES public.qualirepar_dossiers(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.qualirepar_submissions(id),
  
  -- Informations du remboursement
  approved_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT, -- 'bank_transfer', 'check', 'credit_note'
  payment_reference TEXT,
  payment_date DATE,
  
  -- Métadonnées
  approval_date DATE NOT NULL,
  processing_delay_days INTEGER,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES POUR PERFORMANCE
-- ==========================================

-- Index pour les règles d'éligibilité
CREATE INDEX idx_eligibility_rules_category ON public.qualirepar_eligibility_rules(product_category, is_active);
CREATE INDEX idx_eligibility_rules_brand_model ON public.qualirepar_eligibility_rules(brand, model) WHERE brand IS NOT NULL;

-- Index pour les dossiers
CREATE INDEX idx_dossiers_repairer ON public.qualirepar_dossiers(repairer_id, status);
CREATE INDEX idx_dossiers_status_date ON public.qualirepar_dossiers(status, created_at);
CREATE INDEX idx_dossiers_eco_organism ON public.qualirepar_dossiers(eco_organism, status);

-- Index pour les documents
CREATE INDEX idx_documents_dossier ON public.qualirepar_documents(dossier_id, document_type);

-- Index pour les soumissions
CREATE INDEX idx_submissions_status ON public.qualirepar_submissions(status, created_at);

-- Index pour les remboursements
CREATE INDEX idx_reimbursements_payment_date ON public.qualirepar_reimbursements(payment_date);

-- ==========================================
-- FONCTIONS UTILITAIRES
-- ==========================================

-- Fonction pour générer un numéro de dossier unique
CREATE OR REPLACE FUNCTION public.generate_qualirepar_dossier_number(repairer_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  prefix TEXT;
  counter INTEGER;
  dossier_number_result TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'QR-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN qd.dossier_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(qd.dossier_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.qualirepar_dossiers qd
  WHERE qd.repairer_id = repairer_uuid
  AND DATE(qd.created_at) = CURRENT_DATE;
  
  dossier_number_result := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN dossier_number_result;
END;
$function$;

-- Trigger pour générer automatiquement le numéro de dossier
CREATE OR REPLACE FUNCTION public.auto_generate_qualirepar_dossier_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.dossier_number IS NULL OR NEW.dossier_number = '' THEN
    NEW.dossier_number := public.generate_qualirepar_dossier_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Appliquer le trigger
CREATE TRIGGER trigger_auto_generate_qualirepar_dossier_number
  BEFORE INSERT ON public.qualirepar_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_qualirepar_dossier_number();

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.qualirepar_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualirepar_reimbursements ENABLE ROW LEVEL SECURITY;

-- Policies pour les règles d'éligibilité
CREATE POLICY "Public can view active eligibility rules"
ON public.qualirepar_eligibility_rules
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage eligibility rules"
ON public.qualirepar_eligibility_rules
FOR ALL
USING (get_current_user_role() = 'admin');

-- Policies pour les dossiers
CREATE POLICY "Repairers can manage their own dossiers"
ON public.qualirepar_dossiers
FOR ALL
USING (repairer_id = auth.uid());

CREATE POLICY "Admins can view all dossiers"
ON public.qualirepar_dossiers
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Policies pour les documents
CREATE POLICY "Repairers can manage documents for their dossiers"
ON public.qualirepar_documents
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.qualirepar_dossiers
  WHERE id = qualirepar_documents.dossier_id
  AND repairer_id = auth.uid()
));

-- Policies pour les soumissions
CREATE POLICY "Repairers can view submissions for their dossiers"
ON public.qualirepar_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.qualirepar_dossiers
  WHERE id = qualirepar_submissions.dossier_id
  AND repairer_id = auth.uid()
));

CREATE POLICY "System can insert submissions"
ON public.qualirepar_submissions
FOR INSERT
WITH CHECK (true);

-- Policies pour les remboursements
CREATE POLICY "Repairers can view reimbursements for their dossiers"
ON public.qualirepar_reimbursements
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.qualirepar_dossiers
  WHERE id = qualirepar_reimbursements.dossier_id
  AND repairer_id = auth.uid()
));

-- ==========================================
-- DONNÉES INITIALES
-- ==========================================

-- Insérer quelques règles d'éligibilité de base
INSERT INTO public.qualirepar_eligibility_rules (
  product_category,
  brand,
  model,
  min_repair_cost,
  max_bonus_amount,
  eco_organism
) VALUES 
('smartphone', NULL, NULL, 25.00, 25.00, 'Ecosystem'),
('smartphone', 'Apple', NULL, 30.00, 25.00, 'Ecosystem'),
('smartphone', 'Samsung', NULL, 25.00, 25.00, 'Ecosystem'),
('tablet', NULL, NULL, 50.00, 45.00, 'Ecosystem'),
('laptop', NULL, NULL, 100.00, 45.00, 'Ecosystem');