-- ============================================
-- Phase 2: Archivage à valeur probante NF203 (Corrigé)
-- ============================================

-- Table pour l'archivage des documents avec valeur probante
CREATE TABLE IF NOT EXISTS public.nf203_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'credit_note', 'quote', 'receipt')),
  repairer_id UUID NOT NULL,
  archive_date DATE NOT NULL DEFAULT CURRENT_DATE,
  archive_format TEXT NOT NULL CHECK (archive_format IN ('PDF', 'PDF/A-3', 'XML', 'JSON')),
  file_path TEXT,
  file_url TEXT,
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  retention_period INTEGER NOT NULL DEFAULT 10, -- années
  deletion_date DATE, -- calculée par trigger
  archive_status TEXT NOT NULL DEFAULT 'active' CHECK (archive_status IN ('active', 'expired', 'deleted', 'legal_hold')),
  legal_hold BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour calculer automatiquement deletion_date
CREATE OR REPLACE FUNCTION public.set_nf203_deletion_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.deletion_date := NEW.archive_date + (NEW.retention_period || ' years')::INTERVAL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_nf203_deletion_date
  BEFORE INSERT OR UPDATE OF archive_date, retention_period
  ON public.nf203_archives
  FOR EACH ROW
  EXECUTE FUNCTION public.set_nf203_deletion_date();

-- Index pour optimiser les recherches
CREATE INDEX idx_nf203_archives_repairer ON public.nf203_archives(repairer_id);
CREATE INDEX idx_nf203_archives_document ON public.nf203_archives(document_id, document_type);
CREATE INDEX idx_nf203_archives_status ON public.nf203_archives(archive_status);
CREATE INDEX idx_nf203_archives_deletion ON public.nf203_archives(deletion_date) WHERE archive_status = 'active';

-- Table pour la clôture des périodes comptables
CREATE TABLE IF NOT EXISTS public.nf203_period_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  closure_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closure_hash TEXT NOT NULL, -- Hash de tous les documents de la période
  invoice_count INTEGER NOT NULL DEFAULT 0,
  total_ht NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tva NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc NUMERIC(12,2) NOT NULL DEFAULT 0,
  closed_by UUID,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  fec_export_path TEXT,
  fec_generated_at TIMESTAMP WITH TIME ZONE,
  compliance_report JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repairer_id, period_type, period_start, period_end)
);

-- Index pour les clôtures
CREATE INDEX idx_nf203_closures_repairer ON public.nf203_period_closures(repairer_id);
CREATE INDEX idx_nf203_closures_period ON public.nf203_period_closures(period_start, period_end);
CREATE INDEX idx_nf203_closures_locked ON public.nf203_period_closures(is_locked);

-- Fonction pour calculer le hash d'une période
CREATE OR REPLACE FUNCTION public.calculate_period_hash(
  repairer_uuid UUID,
  start_date DATE,
  end_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  period_data TEXT;
  hash_result TEXT;
BEGIN
  -- Concaténer tous les hashes des factures de la période
  SELECT string_agg(eic.current_hash, '' ORDER BY eic.sequence_number)
  INTO period_data
  FROM public.electronic_invoices_chain eic
  INNER JOIN public.electronic_invoices ei ON ei.id = eic.invoice_id
  WHERE ei.repairer_id = repairer_uuid
    AND ei.invoice_date::DATE BETWEEN start_date AND end_date;
  
  -- Calculer le hash SHA-256 de la période
  IF period_data IS NOT NULL THEN
    hash_result := encode(digest(period_data, 'sha256'), 'hex');
  ELSE
    hash_result := encode(digest('empty_period', 'sha256'), 'hex');
  END IF;
  
  RETURN hash_result;
END;
$$;

-- Fonction pour vérifier si une période peut être clôturée
CREATE OR REPLACE FUNCTION public.can_close_period(
  repairer_uuid UUID,
  start_date DATE,
  end_date DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
  invoice_count INTEGER;
  all_chained BOOLEAN;
  has_anomalies BOOLEAN;
BEGIN
  -- Vérifier le nombre de factures
  SELECT COUNT(*) INTO invoice_count
  FROM public.electronic_invoices
  WHERE repairer_id = repairer_uuid
    AND invoice_date::DATE BETWEEN start_date AND end_date;
  
  -- Vérifier que toutes les factures sont chaînées
  SELECT (COUNT(DISTINCT ei.id) = COUNT(DISTINCT eic.invoice_id)) INTO all_chained
  FROM public.electronic_invoices ei
  LEFT JOIN public.electronic_invoices_chain eic ON ei.id = eic.invoice_id
  WHERE ei.repairer_id = repairer_uuid
    AND ei.invoice_date::DATE BETWEEN start_date AND end_date;
  
  -- Vérifier l'intégrité de la chaîne
  SELECT (broken_links > 0) INTO has_anomalies
  FROM public.verify_chain_integrity(repairer_uuid);
  
  -- Construire le résultat
  result := jsonb_build_object(
    'can_close', (invoice_count > 0 AND all_chained AND NOT has_anomalies),
    'invoice_count', invoice_count,
    'all_chained', all_chained,
    'has_anomalies', has_anomalies,
    'period_start', start_date,
    'period_end', end_date
  );
  
  RETURN result;
END;
$$;

-- Fonction pour clôturer une période
CREATE OR REPLACE FUNCTION public.close_accounting_period(
  repairer_uuid UUID,
  period_type_param TEXT,
  start_date DATE,
  end_date DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  closure_id UUID;
  period_hash TEXT;
  inv_count INTEGER;
  sum_ht NUMERIC;
  sum_tva NUMERIC;
  sum_ttc NUMERIC;
  can_close_result JSONB;
BEGIN
  -- Vérifier les permissions
  IF auth.uid() != repairer_uuid AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only the repairer or admin can close periods';
  END IF;
  
  -- Vérifier si la période peut être clôturée
  can_close_result := public.can_close_period(repairer_uuid, start_date, end_date);
  
  IF NOT (can_close_result->>'can_close')::BOOLEAN THEN
    RAISE EXCEPTION 'Cannot close period: %', can_close_result->>'reason';
  END IF;
  
  -- Calculer le hash de la période
  period_hash := public.calculate_period_hash(repairer_uuid, start_date, end_date);
  
  -- Calculer les totaux
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount_ht), 0),
    COALESCE(SUM(tva_amount), 0),
    COALESCE(SUM(amount_ttc), 0)
  INTO inv_count, sum_ht, sum_tva, sum_ttc
  FROM public.electronic_invoices
  WHERE repairer_id = repairer_uuid
    AND invoice_date::DATE BETWEEN start_date AND end_date;
  
  -- Créer la clôture
  INSERT INTO public.nf203_period_closures (
    repairer_id,
    period_type,
    period_start,
    period_end,
    closure_hash,
    invoice_count,
    total_ht,
    total_tva,
    total_ttc,
    closed_by,
    is_locked,
    compliance_report
  ) VALUES (
    repairer_uuid,
    period_type_param,
    start_date,
    end_date,
    period_hash,
    inv_count,
    sum_ht,
    sum_tva,
    sum_ttc,
    auth.uid(),
    TRUE,
    can_close_result
  ) RETURNING id INTO closure_id;
  
  -- Logger l'événement
  INSERT INTO public.nf203_audit_trail (
    entity_type,
    entity_id,
    action,
    user_id,
    after_state,
    compliance_metadata
  ) VALUES (
    'period_closure',
    closure_id::TEXT,
    'close_period',
    auth.uid(),
    jsonb_build_object(
      'period_type', period_type_param,
      'period_start', start_date,
      'period_end', end_date,
      'invoice_count', inv_count,
      'total_ttc', sum_ttc
    ),
    jsonb_build_object(
      'closure_hash', period_hash,
      'nf203_compliant', true
    )
  );
  
  RETURN closure_id;
END;
$$;

-- RLS Policies pour nf203_archives
ALTER TABLE public.nf203_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their archives"
ON public.nf203_archives FOR SELECT
USING (repairer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Repairers can create archives"
ON public.nf203_archives FOR INSERT
WITH CHECK (repairer_id = auth.uid());

CREATE POLICY "System can update archive status"
ON public.nf203_archives FOR UPDATE
USING (repairer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- RLS Policies pour nf203_period_closures
ALTER TABLE public.nf203_period_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can view their closures"
ON public.nf203_period_closures FOR SELECT
USING (repairer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Repairers can create closures"
ON public.nf203_period_closures FOR INSERT
WITH CHECK (repairer_id = auth.uid());

-- Trigger pour updated_at
CREATE TRIGGER update_nf203_archives_updated_at
  BEFORE UPDATE ON public.nf203_archives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.nf203_archives IS 'Archivage à valeur probante conforme NF203';
COMMENT ON TABLE public.nf203_period_closures IS 'Clôtures de périodes comptables conformes NF203';
COMMENT ON FUNCTION public.calculate_period_hash IS 'Calcule le hash cryptographique d''une période comptable';
COMMENT ON FUNCTION public.can_close_period IS 'Vérifie si une période peut être clôturée selon NF203';
COMMENT ON FUNCTION public.close_accounting_period IS 'Clôture une période comptable avec verrouillage NF203';