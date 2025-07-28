-- Ajouter le module Certificats d'irréparabilité
INSERT INTO public.optional_modules_config (
  module_id,
  module_name,
  description,
  icon,
  category,
  features,
  color,
  pricing_monthly,
  pricing_yearly,
  available_plans,
  is_active
) VALUES (
  'irreparability_certificates',
  'Certificats d''irréparabilité',
  'Génération de certificats d''irréparabilité conformes au Code de la consommation pour appareils non réparables',
  'FileX',
  'legal_compliance',
  '["Formulaire technique complet", "Génération PDF avec signature numérique", "Archivage dans profil client", "Conformité Code de la consommation", "Journalisation NF525", "Archivage 5 ans obligatoire"]'::jsonb,
  'hsl(var(--destructive))',
  29.90,
  299.00,
  '["pro", "premium", "enterprise"]'::jsonb,
  true
);

-- Table pour les certificats d'irréparabilité
CREATE TABLE public.irreparability_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number TEXT NOT NULL UNIQUE,
  repairer_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_serial_number TEXT,
  device_imei TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(10,2),
  purchase_store TEXT,
  warranty_status TEXT,
  diagnostic_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnostic_description TEXT NOT NULL,
  technical_analysis TEXT NOT NULL,
  repair_impossibility_reason TEXT NOT NULL,
  estimated_repair_cost NUMERIC(10,2),
  replacement_value NUMERIC(10,2),
  certificate_status TEXT NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  digital_signature_hash TEXT,
  insurance_claim_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE,
  nf525_archive_hash TEXT
);

-- Table pour l'archivage NF525 des certificats
CREATE TABLE public.irreparability_nf525_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL,
  repairer_id UUID NOT NULL,
  certificate_data JSONB NOT NULL,
  certificate_html TEXT NOT NULL,
  certificate_hash TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retention_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 years')
);

-- Table pour les diagnostics techniques détaillés
CREATE TABLE public.irreparability_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL,
  component_name TEXT NOT NULL,
  component_state TEXT NOT NULL,
  failure_description TEXT NOT NULL,
  repair_feasibility TEXT NOT NULL,
  spare_parts_availability TEXT,
  estimated_repair_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.irreparability_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irreparability_nf525_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irreparability_diagnostics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for irreparability_certificates
CREATE POLICY "Repairers can view their own certificates" 
ON public.irreparability_certificates 
FOR SELECT 
USING (repairer_id = auth.uid());

CREATE POLICY "Repairers can create their own certificates" 
ON public.irreparability_certificates 
FOR INSERT 
WITH CHECK (repairer_id = auth.uid());

CREATE POLICY "Repairers can update their own certificates" 
ON public.irreparability_certificates 
FOR UPDATE 
USING (repairer_id = auth.uid());

-- RLS Policies for irreparability_nf525_archive
CREATE POLICY "Repairers can view their own archives" 
ON public.irreparability_nf525_archive 
FOR SELECT 
USING (repairer_id = auth.uid());

CREATE POLICY "System can insert archives" 
ON public.irreparability_nf525_archive 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for irreparability_diagnostics
CREATE POLICY "Repairers can manage diagnostics for their certificates" 
ON public.irreparability_diagnostics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.irreparability_certificates 
  WHERE id = certificate_id AND repairer_id = auth.uid()
));

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number(repairer_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  prefix TEXT;
  counter INTEGER;
  certificate_number_result TEXT;
BEGIN
  -- Créer un préfixe basé sur la date
  prefix := 'CERT-IRR-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-';
  
  -- Obtenir le compteur du jour pour ce réparateur
  SELECT COALESCE(MAX(
    CASE WHEN ic.certificate_number LIKE prefix || '%' 
    THEN CAST(SUBSTRING(ic.certificate_number FROM LENGTH(prefix) + 1) AS INTEGER)
    ELSE 0 END
  ), 0) + 1 INTO counter
  FROM public.irreparability_certificates ic
  WHERE ic.repairer_id = repairer_uuid
  AND DATE(ic.created_at) = CURRENT_DATE;
  
  certificate_number_result := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN certificate_number_result;
END;
$function$;

-- Trigger to auto-generate certificate number
CREATE OR REPLACE FUNCTION public.auto_generate_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := public.generate_certificate_number(NEW.repairer_id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER auto_generate_irreparability_certificate_number
  BEFORE INSERT ON public.irreparability_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_certificate_number();

-- Function to auto-archive certificate
CREATE OR REPLACE FUNCTION public.auto_archive_certificate(certificate_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  archive_id UUID;
  cert_record RECORD;
  certificate_data JSONB;
  certificate_html TEXT;
  certificate_hash TEXT;
BEGIN
  SELECT * INTO cert_record FROM public.irreparability_certificates WHERE id = certificate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Certificate not found: %', certificate_id;
  END IF;
  
  certificate_data := jsonb_build_object(
    'certificate_number', cert_record.certificate_number,
    'diagnostic_date', cert_record.diagnostic_date,
    'client_name', cert_record.client_name,
    'device_info', jsonb_build_object(
      'brand', cert_record.device_brand,
      'model', cert_record.device_model,
      'serial', cert_record.device_serial_number
    ),
    'diagnostic_description', cert_record.diagnostic_description,
    'archived_at', now()
  );
  
  certificate_html := format(
    '<div class="nf525-certificate"><h2>CERTIFICAT D''IRREPARABILITE</h2><p>Conforme Code de la consommation</p><p>N° %s</p><p>Date: %s</p><p>Client: %s</p><p>Appareil: %s %s</p></div>',
    cert_record.certificate_number,
    cert_record.diagnostic_date,
    cert_record.client_name,
    cert_record.device_brand,
    cert_record.device_model
  );
  
  certificate_hash := encode(digest(certificate_html || cert_record.certificate_number, 'sha256'), 'hex');
  
  INSERT INTO public.irreparability_nf525_archive (
    certificate_id, repairer_id, certificate_data, certificate_html, certificate_hash, file_size_bytes
  ) VALUES (
    certificate_id, cert_record.repairer_id, certificate_data, certificate_html, certificate_hash, length(certificate_html)
  ) RETURNING id INTO archive_id;
  
  UPDATE public.irreparability_certificates 
  SET archived_at = now(), nf525_archive_hash = certificate_hash
  WHERE id = certificate_id;
  
  RETURN archive_id;
END;
$function$;

-- Amélioration des tables de rachat existantes pour conformité Code pénal
-- Ajouter des colonnes manquantes à la table pos_buyback_transactions si elle existe
DO $$ 
BEGIN
  -- Vérifier si la table existe et ajouter les colonnes nécessaires
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pos_buyback_transactions') THEN
    -- Ajouter les colonnes de conformité légale
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_buyback_transactions' AND column_name = 'seller_identity_verified') THEN
      ALTER TABLE public.pos_buyback_transactions 
      ADD COLUMN seller_identity_verified BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN seller_id_type TEXT,
      ADD COLUMN seller_id_number TEXT,
      ADD COLUMN seller_address TEXT,
      ADD COLUMN seller_birth_date DATE,
      ADD COLUMN seller_birth_place TEXT,
      ADD COLUMN invoice_pdf_url TEXT,
      ADD COLUMN police_logbook_exported BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN police_logbook_export_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN retention_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 years');
    END IF;
  END IF;
END $$;

-- Table d'archivage pour le livre de police numérique
CREATE TABLE IF NOT EXISTS public.digital_police_logbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'buyback',
  transaction_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  seller_identity JSONB NOT NULL,
  product_description JSONB NOT NULL,
  purchase_amount NUMERIC(10,2) NOT NULL,
  exported_to_police BOOLEAN NOT NULL DEFAULT false,
  export_date TIMESTAMP WITH TIME ZONE,
  retention_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 years'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_police_logbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their own logbook" 
ON public.digital_police_logbook 
FOR SELECT 
USING (repairer_id = auth.uid());

CREATE POLICY "System can insert logbook entries" 
ON public.digital_police_logbook 
FOR INSERT 
WITH CHECK (true);