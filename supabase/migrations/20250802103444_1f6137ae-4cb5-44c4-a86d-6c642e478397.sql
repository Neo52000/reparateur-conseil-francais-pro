-- Phase 4: Tables pour éliminer les simulations restantes

-- Table pour les notifications système temps réel
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les sessions POS
CREATE TABLE public.pos_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  staff_user_id UUID,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  terminal_id TEXT,
  cash_drawer_start NUMERIC DEFAULT 0,
  cash_drawer_end NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les transactions POS
CREATE TABLE public.pos_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.pos_sessions(id),
  repairer_id UUID NOT NULL,
  customer_id UUID,
  transaction_number TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le statut du matériel POS
CREATE TABLE public.pos_hardware_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  device_type TEXT NOT NULL,
  device_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  last_ping TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les reçus POS
CREATE TABLE public.pos_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.pos_transactions(id),
  repairer_id UUID NOT NULL,
  receipt_number TEXT NOT NULL,
  receipt_data JSONB NOT NULL,
  print_status TEXT NOT NULL DEFAULT 'pending',
  printed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les notifications système
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  target_users JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_dismiss_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les tâches de sauvegarde
CREATE TABLE public.backup_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les tâches de synchronisation
CREATE TABLE public.sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID,
  sync_type TEXT NOT NULL,
  source_system TEXT NOT NULL,
  target_system TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  error_message TEXT,
  sync_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_hardware_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- RLS Policies pour POS sessions
CREATE POLICY "Repairers can manage their POS sessions" ON public.pos_sessions
FOR ALL USING (auth.uid() = repairer_id OR auth.uid() = staff_user_id);

-- RLS Policies pour POS transactions
CREATE POLICY "Repairers can manage their POS transactions" ON public.pos_transactions
FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour POS hardware
CREATE POLICY "Repairers can manage their POS hardware" ON public.pos_hardware_status
FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour POS receipts
CREATE POLICY "Repairers can manage their receipts" ON public.pos_receipts
FOR ALL USING (auth.uid() = repairer_id);

-- RLS Policies pour system notifications
CREATE POLICY "Admins can manage system notifications" ON public.system_notifications
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view active system notifications" ON public.system_notifications
FOR SELECT USING (is_active = true);

-- RLS Policies pour backup jobs
CREATE POLICY "Admins can manage backup jobs" ON public.backup_jobs
FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies pour sync jobs
CREATE POLICY "Repairers can view their sync jobs" ON public.sync_jobs
FOR SELECT USING (auth.uid() = repairer_id OR get_current_user_role() = 'admin');

CREATE POLICY "Repairers can create sync jobs" ON public.sync_jobs
FOR INSERT WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "System can manage sync jobs" ON public.sync_jobs
FOR ALL USING (get_current_user_role() = 'admin');

-- Triggers pour updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_sessions_updated_at
BEFORE UPDATE ON public.pos_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_transactions_updated_at
BEFORE UPDATE ON public.pos_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_hardware_status_updated_at
BEFORE UPDATE ON public.pos_hardware_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_notifications_updated_at
BEFORE UPDATE ON public.system_notifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_backup_jobs_updated_at
BEFORE UPDATE ON public.backup_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_jobs_updated_at
BEFORE UPDATE ON public.sync_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des données initiales pour les tests
INSERT INTO public.pos_hardware_status (repairer_id, device_type, device_name, status, last_ping) VALUES
  (gen_random_uuid(), 'printer', 'Zebra GK420t', 'online', now()),
  (gen_random_uuid(), 'scanner', 'Zebra LS2208', 'online', now()),
  (gen_random_uuid(), 'cash_drawer', 'Star CD3-1313', 'online', now()),
  (gen_random_uuid(), 'terminal', 'Square Terminal', 'online', now());

INSERT INTO public.system_notifications (type, title, message, severity, is_active) VALUES
  ('maintenance', 'Maintenance programmée', 'Une maintenance est prévue ce soir de 22h à 2h', 'warning', true),
  ('update', 'Nouvelle version disponible', 'La version 2.1.0 est maintenant disponible', 'info', true),
  ('security', 'Alerte sécurité', 'Veuillez mettre à jour vos mots de passe', 'error', true);