-- Phase 1: Infrastructure pour facturation électronique française
-- Conformité réglementaire 2026

-- Table pour les factures électroniques conformes
CREATE TABLE public.electronic_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  repairer_id UUID NOT NULL,
  client_id UUID NOT NULL,
  quote_id UUID,
  
  -- Informations légales obligatoires
  siret_repairer TEXT NOT NULL,
  siret_client TEXT,
  tva_number_repairer TEXT,
  tva_number_client TEXT,
  naf_code TEXT,
  
  -- Montants conformes
  amount_ht NUMERIC NOT NULL,
  amount_ttc NUMERIC NOT NULL,
  tva_rate NUMERIC NOT NULL DEFAULT 20.0,
  tva_amount NUMERIC NOT NULL,
  
  -- Format et conformité
  invoice_type TEXT NOT NULL DEFAULT 'standard', -- standard, avoir, acompte
  format_type TEXT NOT NULL DEFAULT 'factur_x', -- factur_x, chorus_pro
  xml_content TEXT, -- UBL XML pour Factur-X
  pdf_path TEXT,
  
  -- Statuts et traçabilité
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, validated, paid, cancelled
  chorus_pro_status TEXT, -- submitted, accepted, rejected, processed
  chorus_pro_id TEXT,
  
  -- Dates légales
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Signature électronique et archivage légal
  electronic_signature TEXT,
  legal_archive_hash TEXT,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les soumissions Chorus Pro
CREATE TABLE public.chorus_pro_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES electronic_invoices(id),
  submission_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, submitted, accepted, rejected, error
  
  -- Détails de la soumission
  submitted_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les mentions légales réparateurs
CREATE TABLE public.repairer_legal_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL UNIQUE,
  
  -- Informations légales obligatoires
  siret TEXT NOT NULL,
  tva_number TEXT,
  naf_code TEXT,
  legal_form TEXT, -- SARL, SAS, EI, etc.
  capital_social NUMERIC,
  rcs_number TEXT,
  rcs_city TEXT,
  
  -- Informations de facturation
  invoice_prefix TEXT DEFAULT 'FACT',
  next_invoice_number INTEGER DEFAULT 1,
  
  -- Mentions légales
  legal_mentions TEXT,
  payment_terms_days INTEGER DEFAULT 30,
  late_penalty_rate NUMERIC DEFAULT 3.0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les avoirs électroniques
CREATE TABLE public.electronic_credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_note_number TEXT NOT NULL UNIQUE,
  original_invoice_id UUID NOT NULL REFERENCES electronic_invoices(id),
  repairer_id UUID NOT NULL,
  
  amount_ht NUMERIC NOT NULL,
  amount_ttc NUMERIC NOT NULL,
  tva_amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_electronic_invoices_repairer ON electronic_invoices(repairer_id);
CREATE INDEX idx_electronic_invoices_client ON electronic_invoices(client_id);
CREATE INDEX idx_electronic_invoices_number ON electronic_invoices(invoice_number);
CREATE INDEX idx_electronic_invoices_date ON electronic_invoices(invoice_date);
CREATE INDEX idx_chorus_submissions_invoice ON chorus_pro_submissions(invoice_id);

-- RLS Policies
ALTER TABLE public.electronic_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chorus_pro_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairer_legal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electronic_credit_notes ENABLE ROW LEVEL SECURITY;

-- Policies pour les factures électroniques
CREATE POLICY "Repairers can manage their invoices"
ON electronic_invoices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM repairer_profiles 
    WHERE repairer_profiles.user_id = auth.uid() 
    AND repairer_profiles.id = electronic_invoices.repairer_id
  )
);

CREATE POLICY "Clients can view their invoices"
ON electronic_invoices FOR SELECT
USING (client_id = auth.uid());

-- Policies pour Chorus Pro
CREATE POLICY "Repairers can manage chorus submissions"
ON chorus_pro_submissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM electronic_invoices ei
    JOIN repairer_profiles rp ON rp.id = ei.repairer_id
    WHERE ei.id = chorus_pro_submissions.invoice_id
    AND rp.user_id = auth.uid()
  )
);

-- Policies pour les informations légales
CREATE POLICY "Repairers can manage their legal info"
ON repairer_legal_info FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM repairer_profiles 
    WHERE repairer_profiles.user_id = auth.uid() 
    AND repairer_profiles.id = repairer_legal_info.repairer_id
  )
);

-- Policies pour les avoirs
CREATE POLICY "Repairers can manage their credit notes"
ON electronic_credit_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM repairer_profiles 
    WHERE repairer_profiles.user_id = auth.uid() 
    AND repairer_profiles.id = electronic_credit_notes.repairer_id
  )
);

-- Fonction pour générer les numéros de facture
CREATE OR REPLACE FUNCTION generate_invoice_number(repairer_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  legal_info RECORD;
  invoice_number TEXT;
BEGIN
  -- Récupérer les infos légales du réparateur
  SELECT * INTO legal_info 
  FROM public.repairer_legal_info 
  WHERE repairer_id = repairer_uuid;
  
  IF NOT FOUND THEN
    -- Créer des infos par défaut si elles n'existent pas
    INSERT INTO public.repairer_legal_info (repairer_id, siret, invoice_prefix, next_invoice_number)
    VALUES (repairer_uuid, 'TO_CONFIGURE', 'FACT', 1)
    RETURNING * INTO legal_info;
  END IF;
  
  -- Générer le numéro
  invoice_number := legal_info.invoice_prefix || '-' || 
                   TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                   LPAD(legal_info.next_invoice_number::TEXT, 4, '0');
  
  -- Incrémenter le compteur
  UPDATE public.repairer_legal_info 
  SET next_invoice_number = next_invoice_number + 1,
      updated_at = now()
  WHERE repairer_id = repairer_uuid;
  
  RETURN invoice_number;
END;
$$;

-- Trigger pour auto-générer les numéros de facture
CREATE OR REPLACE FUNCTION auto_generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_invoice_number
  BEFORE INSERT ON electronic_invoices
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invoice_number();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_electronic_invoices_updated_at
  BEFORE UPDATE ON electronic_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chorus_submissions_updated_at
  BEFORE UPDATE ON chorus_pro_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repairer_legal_info_updated_at
  BEFORE UPDATE ON repairer_legal_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();