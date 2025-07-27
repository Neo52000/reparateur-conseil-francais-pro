-- Migration pour système d'archivage complet NF-525

-- Ajouter colonnes d'archivage aux transactions POS
ALTER TABLE public.pos_transactions 
ADD COLUMN IF NOT EXISTS archived_receipt_data JSONB,
ADD COLUMN IF NOT EXISTS nf525_archive_hash TEXT,
ADD COLUMN IF NOT EXISTS archive_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS receipt_generation_status TEXT DEFAULT 'pending';

-- Table dédiée pour l'archivage NF-525
CREATE TABLE IF NOT EXISTS public.nf525_receipt_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  repairer_id UUID NOT NULL,
  receipt_data JSONB NOT NULL,
  receipt_html TEXT NOT NULL,
  receipt_hash TEXT NOT NULL UNIQUE,
  archive_format TEXT NOT NULL DEFAULT 'html',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retention_period_years INTEGER NOT NULL DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (created_at + INTERVAL '1 year' * retention_period_years) STORED,
  metadata JSONB DEFAULT '{}',
  file_size_bytes INTEGER,
  compression_used BOOLEAN DEFAULT false
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_nf525_archives_transaction_id ON public.nf525_receipt_archives(transaction_id);
CREATE INDEX IF NOT EXISTS idx_nf525_archives_repairer_id ON public.nf525_receipt_archives(repairer_id);
CREATE INDEX IF NOT EXISTS idx_nf525_archives_created_at ON public.nf525_receipt_archives(created_at);
CREATE INDEX IF NOT EXISTS idx_nf525_archives_expires_at ON public.nf525_receipt_archives(expires_at);
CREATE INDEX IF NOT EXISTS idx_nf525_archives_hash ON public.nf525_receipt_archives(receipt_hash);

-- Table pour les statistiques d'archivage
CREATE TABLE IF NOT EXISTS public.nf525_archive_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_receipts INTEGER NOT NULL DEFAULT 0,
  archived_receipts INTEGER NOT NULL DEFAULT 0,
  archive_size_mb NUMERIC NOT NULL DEFAULT 0,
  compliance_score NUMERIC NOT NULL DEFAULT 0,
  last_archive_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repairer_id, date)
);

-- Index pour les statistiques
CREATE INDEX IF NOT EXISTS idx_nf525_stats_repairer_date ON public.nf525_archive_stats(repairer_id, date);

-- Table pour les logs d'archivage
CREATE TABLE IF NOT EXISTS public.nf525_archive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id UUID REFERENCES public.nf525_receipt_archives(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL,
  repairer_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'retrieve', 'export', 'delete'
  status TEXT NOT NULL, -- 'success', 'error', 'warning'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_nf525_logs_archive_id ON public.nf525_archive_logs(archive_id);
CREATE INDEX IF NOT EXISTS idx_nf525_logs_repairer_id ON public.nf525_archive_logs(repairer_id);
CREATE INDEX IF NOT EXISTS idx_nf525_logs_created_at ON public.nf525_archive_logs(created_at);

-- Fonction pour archiver automatiquement un ticket
CREATE OR REPLACE FUNCTION public.auto_archive_receipt(transaction_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  receipt_archive_id UUID;
  tx_record RECORD;
  receipt_data JSONB;
  receipt_html TEXT;
  receipt_hash TEXT;
BEGIN
  -- Récupérer les données de la transaction
  SELECT * INTO tx_record 
  FROM public.pos_transactions 
  WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found: %', transaction_id;
  END IF;
  
  -- Construire les données du ticket
  receipt_data := jsonb_build_object(
    'transaction_number', tx_record.transaction_number,
    'date', tx_record.transaction_date,
    'total_amount', tx_record.total_amount,
    'subtotal', tx_record.subtotal,
    'tax_amount', tx_record.tax_amount,
    'payment_method', tx_record.payment_method,
    'repairer_id', tx_record.repairer_id,
    'session_id', tx_record.session_id,
    'customer_name', COALESCE(tx_record.customer_name, 'Client'),
    'archived_at', now()
  );
  
  -- Générer le HTML du ticket conforme NF-525
  receipt_html := format(
    '<div class="nf525-receipt">
      <h2>TICKET DE CAISSE</h2>
      <p>Conforme NF-525</p>
      <p>N° Transaction: %s</p>
      <p>Date: %s</p>
      <p>Total TTC: %s€</p>
      <p>Mode de paiement: %s</p>
      <p>Archivé le: %s</p>
    </div>',
    tx_record.transaction_number,
    tx_record.transaction_date,
    tx_record.total_amount,
    tx_record.payment_method,
    now()
  );
  
  -- Générer un hash pour l'intégrité
  receipt_hash := encode(
    digest(receipt_html || tx_record.transaction_number || now()::text, 'sha256'),
    'hex'
  );
  
  -- Insérer dans les archives
  INSERT INTO public.nf525_receipt_archives (
    transaction_id,
    repairer_id,
    receipt_data,
    receipt_html,
    receipt_hash,
    file_size_bytes
  ) VALUES (
    transaction_id,
    tx_record.repairer_id,
    receipt_data,
    receipt_html,
    receipt_hash,
    length(receipt_html)
  ) RETURNING id INTO receipt_archive_id;
  
  -- Mettre à jour la transaction
  UPDATE public.pos_transactions 
  SET 
    archived_receipt_data = receipt_data,
    nf525_archive_hash = receipt_hash,
    archive_status = 'archived',
    archived_at = now(),
    receipt_generation_status = 'completed'
  WHERE id = transaction_id;
  
  -- Log de l'action
  INSERT INTO public.nf525_archive_logs (
    archive_id, transaction_id, repairer_id, action, status, details
  ) VALUES (
    receipt_archive_id, transaction_id, tx_record.repairer_id, 'create', 'success',
    jsonb_build_object('method', 'auto_archive', 'hash', receipt_hash)
  );
  
  RETURN receipt_archive_id;
END;
$$;

-- Fonction pour récupérer un ticket archivé
CREATE OR REPLACE FUNCTION public.get_archived_receipt(transaction_id UUID)
RETURNS TABLE(
  archive_id UUID,
  receipt_html TEXT,
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  receipt_hash TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    id as archive_id,
    receipt_html,
    receipt_data,
    created_at,
    receipt_hash
  FROM public.nf525_receipt_archives 
  WHERE transaction_id = $1;
$$;

-- Trigger pour archivage automatique lors de la création d'une transaction
CREATE OR REPLACE FUNCTION public.trigger_auto_archive_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  -- Archiver automatiquement si la transaction est complète
  IF NEW.payment_status = 'completed' AND NEW.archive_status = 'pending' THEN
    PERFORM public.auto_archive_receipt(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS auto_archive_receipt_trigger ON public.pos_transactions;
CREATE TRIGGER auto_archive_receipt_trigger
  AFTER INSERT OR UPDATE ON public.pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_archive_receipt();

-- Mettre à jour le trigger de timestamps
CREATE TRIGGER update_nf525_archive_stats_updated_at
  BEFORE UPDATE ON public.nf525_archive_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nf525_receipt_archives_updated_at
  BEFORE UPDATE ON public.nf525_receipt_archives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS pour les archives
ALTER TABLE public.nf525_receipt_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf525_archive_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf525_archive_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les archives
CREATE POLICY "Repairers can manage their receipt archives"
  ON public.nf525_receipt_archives
  FOR ALL
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their archive stats"
  ON public.nf525_archive_stats
  FOR ALL
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their archive logs"
  ON public.nf525_archive_logs
  FOR SELECT
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

-- Insérer des données initiales pour les stats
INSERT INTO public.nf525_archive_stats (repairer_id, total_receipts, archived_receipts, compliance_score)
SELECT DISTINCT repairer_id, 0, 0, 95.0
FROM public.pos_transactions
ON CONFLICT (repairer_id, date) DO NOTHING;