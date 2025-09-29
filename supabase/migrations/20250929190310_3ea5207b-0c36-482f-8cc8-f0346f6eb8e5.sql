-- ============================================
-- PHASE 1 : INALTÉRABILITÉ ET SÉCURISATION NF203
-- ============================================

-- 1.1 Table de chaînage cryptographique des factures
CREATE TABLE IF NOT EXISTS public.electronic_invoices_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.electronic_invoices(id) ON DELETE CASCADE,
  sequence_number BIGINT NOT NULL,
  previous_hash TEXT,
  current_hash TEXT NOT NULL,
  invoice_data_snapshot JSONB NOT NULL,
  signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  repairer_id UUID NOT NULL,
  UNIQUE(invoice_id),
  UNIQUE(repairer_id, sequence_number)
);

CREATE INDEX idx_chain_repairer_sequence ON public.electronic_invoices_chain(repairer_id, sequence_number DESC);
CREATE INDEX idx_chain_invoice ON public.electronic_invoices_chain(invoice_id);

-- 1.2 Table d'horodatage qualifié NF203
CREATE TABLE IF NOT EXISTS public.nf203_timestamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'credit_note', 'receipt', 'certificate')),
  timestamp_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timestamp_authority TEXT DEFAULT 'internal',
  timestamp_token TEXT,
  hash_algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  document_hash TEXT NOT NULL,
  is_qualified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_nf203_timestamps_document ON public.nf203_timestamps(document_id, document_type);
CREATE INDEX idx_nf203_timestamps_date ON public.nf203_timestamps(timestamp_date);

-- 1.3 Table d'audit trail complet NF203
CREATE TABLE IF NOT EXISTS public.nf203_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'payment', 'credit_note', 'quote', 'receipt', 'certificate')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'send', 'cancel', 'validate', 'archive', 'export')),
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT,
  user_email TEXT,
  before_state JSONB,
  after_state JSONB,
  changes_summary TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_locked BOOLEAN DEFAULT false,
  compliance_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_nf203_audit_entity ON public.nf203_audit_trail(entity_type, entity_id);
CREATE INDEX idx_nf203_audit_user ON public.nf203_audit_trail(user_id);
CREATE INDEX idx_nf203_audit_timestamp ON public.nf203_audit_trail(timestamp DESC);
CREATE INDEX idx_nf203_audit_action ON public.nf203_audit_trail(action);

-- 1.4 Fonction de calcul de hash SHA-256
CREATE OR REPLACE FUNCTION public.calculate_invoice_hash(invoice_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  data_string TEXT;
  hash_result TEXT;
BEGIN
  -- Convertir les données en chaîne canonique
  data_string := invoice_data::text;
  
  -- Calculer le hash SHA-256
  hash_result := encode(digest(data_string, 'sha256'), 'hex');
  
  RETURN hash_result;
END;
$$;

-- 1.5 Fonction de création du chaînage automatique
CREATE OR REPLACE FUNCTION public.create_invoice_chain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_chain RECORD;
  sequence_num BIGINT;
  prev_hash TEXT;
  invoice_snapshot JSONB;
  current_hash TEXT;
BEGIN
  -- Récupérer la dernière entrée de la chaîne pour ce réparateur
  SELECT * INTO last_chain
  FROM public.electronic_invoices_chain
  WHERE repairer_id = NEW.repairer_id
  ORDER BY sequence_number DESC
  LIMIT 1;
  
  -- Déterminer le numéro de séquence
  IF last_chain IS NULL THEN
    sequence_num := 1;
    prev_hash := NULL;
  ELSE
    sequence_num := last_chain.sequence_number + 1;
    prev_hash := last_chain.current_hash;
  END IF;
  
  -- Créer un snapshot des données de la facture
  invoice_snapshot := jsonb_build_object(
    'invoice_id', NEW.id,
    'invoice_number', NEW.invoice_number,
    'repairer_id', NEW.repairer_id,
    'client_name', NEW.client_name,
    'total_amount', NEW.total_amount,
    'issue_date', NEW.issue_date,
    'status', NEW.status,
    'sequence_number', sequence_num,
    'previous_hash', prev_hash
  );
  
  -- Calculer le hash actuel
  current_hash := public.calculate_invoice_hash(invoice_snapshot);
  
  -- Insérer dans la chaîne
  INSERT INTO public.electronic_invoices_chain (
    invoice_id,
    sequence_number,
    previous_hash,
    current_hash,
    invoice_data_snapshot,
    repairer_id
  ) VALUES (
    NEW.id,
    sequence_num,
    prev_hash,
    current_hash,
    invoice_snapshot,
    NEW.repairer_id
  );
  
  -- Créer l'horodatage
  INSERT INTO public.nf203_timestamps (
    document_id,
    document_type,
    document_hash,
    hash_algorithm
  ) VALUES (
    NEW.id,
    'invoice',
    current_hash,
    'SHA-256'
  );
  
  -- Créer l'entrée d'audit
  INSERT INTO public.nf203_audit_trail (
    entity_type,
    entity_id,
    action,
    user_id,
    after_state,
    compliance_metadata
  ) VALUES (
    'invoice',
    NEW.id,
    'create',
    NEW.repairer_id,
    invoice_snapshot,
    jsonb_build_object(
      'chain_sequence', sequence_num,
      'hash', current_hash,
      'previous_hash', prev_hash,
      'nf203_compliant', true
    )
  );
  
  RETURN NEW;
END;
$$;

-- 1.6 Trigger pour chaînage automatique des factures
DROP TRIGGER IF EXISTS trigger_create_invoice_chain ON public.electronic_invoices;
CREATE TRIGGER trigger_create_invoice_chain
AFTER INSERT ON public.electronic_invoices
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_chain();

-- 1.7 Fonction de vérification de l'intégrité de la chaîne
CREATE OR REPLACE FUNCTION public.verify_chain_integrity(repairer_uuid UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  total_invoices BIGINT,
  broken_links INTEGER,
  first_error_sequence BIGINT,
  error_details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chain_record RECORD;
  previous_record RECORD;
  broken_count INTEGER := 0;
  first_error BIGINT := NULL;
  error_msg TEXT := '';
  total_count BIGINT;
BEGIN
  -- Compter le total
  SELECT COUNT(*) INTO total_count
  FROM public.electronic_invoices_chain
  WHERE electronic_invoices_chain.repairer_id = repairer_uuid;
  
  -- Parcourir la chaîne
  previous_record := NULL;
  FOR chain_record IN
    SELECT *
    FROM public.electronic_invoices_chain
    WHERE electronic_invoices_chain.repairer_id = repairer_uuid
    ORDER BY sequence_number ASC
  LOOP
    -- Vérifier le premier élément
    IF chain_record.sequence_number = 1 THEN
      IF chain_record.previous_hash IS NOT NULL THEN
        broken_count := broken_count + 1;
        IF first_error IS NULL THEN
          first_error := chain_record.sequence_number;
          error_msg := 'First invoice should have NULL previous_hash';
        END IF;
      END IF;
    ELSE
      -- Vérifier le chaînage
      IF previous_record IS NOT NULL THEN
        IF chain_record.previous_hash != previous_record.current_hash THEN
          broken_count := broken_count + 1;
          IF first_error IS NULL THEN
            first_error := chain_record.sequence_number;
            error_msg := format('Hash mismatch at sequence %s', chain_record.sequence_number);
          END IF;
        END IF;
      END IF;
    END IF;
    
    -- Vérifier le hash actuel
    IF public.calculate_invoice_hash(chain_record.invoice_data_snapshot) != chain_record.current_hash THEN
      broken_count := broken_count + 1;
      IF first_error IS NULL THEN
        first_error := chain_record.sequence_number;
        error_msg := format('Invalid current hash at sequence %s', chain_record.sequence_number);
      END IF;
    END IF;
    
    previous_record := chain_record;
  END LOOP;
  
  RETURN QUERY SELECT 
    (broken_count = 0),
    total_count,
    broken_count,
    first_error,
    CASE WHEN broken_count = 0 THEN 'Chain integrity verified' ELSE error_msg END;
END;
$$;

-- 1.8 RLS Policies pour electronic_invoices_chain
ALTER TABLE public.electronic_invoices_chain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers view their own chain"
ON public.electronic_invoices_chain
FOR SELECT
USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

-- Seul le système peut insérer (via trigger)
CREATE POLICY "System inserts chain"
ON public.electronic_invoices_chain
FOR INSERT
WITH CHECK (false);

-- Aucune modification ou suppression autorisée (inaltérabilité)
CREATE POLICY "No updates on chain"
ON public.electronic_invoices_chain
FOR UPDATE
USING (false);

CREATE POLICY "No deletes on chain"
ON public.electronic_invoices_chain
FOR DELETE
USING (false);

-- 1.9 RLS Policies pour nf203_timestamps
ALTER TABLE public.nf203_timestamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timestamps"
ON public.nf203_timestamps
FOR SELECT
USING (true);

CREATE POLICY "System inserts timestamps"
ON public.nf203_timestamps
FOR INSERT
WITH CHECK (true);

-- 1.10 RLS Policies pour nf203_audit_trail
ALTER TABLE public.nf203_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their audit trail"
ON public.nf203_audit_trail
FOR SELECT
USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "System inserts audit trail"
ON public.nf203_audit_trail
FOR INSERT
WITH CHECK (true);

-- Aucune modification après création (inaltérabilité)
CREATE POLICY "No updates on audit"
ON public.nf203_audit_trail
FOR UPDATE
USING (false);

-- Seuls les admins peuvent supprimer après période de rétention
CREATE POLICY "Admins can delete old audit"
ON public.nf203_audit_trail
FOR DELETE
USING (get_current_user_role() = 'admin' AND timestamp < now() - interval '10 years');