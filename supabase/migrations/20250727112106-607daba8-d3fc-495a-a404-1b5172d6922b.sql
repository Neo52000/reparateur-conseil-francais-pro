-- Migration corrigée pour système d'archivage complet NF-525

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
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 years'),
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

-- Table pour les logs d'archivage
CREATE TABLE IF NOT EXISTS public.nf525_archive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_id UUID REFERENCES public.nf525_receipt_archives(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL,
  repairer_id UUID NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);

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
  SELECT * INTO tx_record FROM public.pos_transactions WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found: %', transaction_id;
  END IF;
  
  receipt_data := jsonb_build_object(
    'transaction_number', tx_record.transaction_number,
    'date', tx_record.transaction_date,
    'total_amount', tx_record.total_amount,
    'subtotal', tx_record.subtotal,
    'tax_amount', tx_record.tax_amount,
    'payment_method', tx_record.payment_method,
    'archived_at', now()
  );
  
  receipt_html := format(
    '<div class="nf525-receipt"><h2>TICKET DE CAISSE</h2><p>Conforme NF-525</p><p>N° %s</p><p>Date: %s</p><p>Total: %s€</p></div>',
    tx_record.transaction_number,
    tx_record.transaction_date,
    tx_record.total_amount
  );
  
  receipt_hash := encode(digest(receipt_html || tx_record.transaction_number, 'sha256'), 'hex');
  
  INSERT INTO public.nf525_receipt_archives (
    transaction_id, repairer_id, receipt_data, receipt_html, receipt_hash, file_size_bytes
  ) VALUES (
    transaction_id, tx_record.repairer_id, receipt_data, receipt_html, receipt_hash, length(receipt_html)
  ) RETURNING id INTO receipt_archive_id;
  
  UPDATE public.pos_transactions 
  SET archived_receipt_data = receipt_data, nf525_archive_hash = receipt_hash, 
      archive_status = 'archived', archived_at = now(), receipt_generation_status = 'completed'
  WHERE id = transaction_id;
  
  RETURN receipt_archive_id;
END;
$$;

-- Trigger pour archivage automatique
CREATE OR REPLACE FUNCTION public.trigger_auto_archive_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND NEW.archive_status = 'pending' THEN
    PERFORM public.auto_archive_receipt(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_archive_receipt_trigger ON public.pos_transactions;
CREATE TRIGGER auto_archive_receipt_trigger
  AFTER INSERT OR UPDATE ON public.pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_auto_archive_receipt();

-- RLS
ALTER TABLE public.nf525_receipt_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf525_archive_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nf525_archive_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairers can manage their receipt archives"
  ON public.nf525_receipt_archives FOR ALL
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can manage their archive stats"
  ON public.nf525_archive_stats FOR ALL
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can view their archive logs"
  ON public.nf525_archive_logs FOR SELECT
  USING (repairer_id = auth.uid() OR get_current_user_role() = 'admin');