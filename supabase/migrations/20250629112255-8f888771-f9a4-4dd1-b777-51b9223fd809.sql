
-- Créer la table payments pour gérer les paiements
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_intent_id TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES public.quotes_with_timeline(id),
  repairer_id UUID NOT NULL,
  client_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Montant en centimes
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded
  hold_funds BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leurs propres paiements
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = repairer_id);

-- Politique pour les edge functions
CREATE POLICY "Edge functions can manage payments" 
  ON public.payments 
  FOR ALL 
  USING (true);

-- Index pour les performances
CREATE INDEX idx_payments_payment_intent_id ON public.payments(payment_intent_id);
CREATE INDEX idx_payments_quote_id ON public.payments(quote_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_repairer_id ON public.payments(repairer_id);
