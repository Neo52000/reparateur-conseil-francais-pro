-- Mise à jour des tables pour le workflow complet devis → RDV → paiement

-- Table pour les demandes de devis des clients
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::JSONB,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'sms')),
  client_phone TEXT,
  client_address TEXT,
  estimated_budget NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les devis des réparateurs
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE,
  service_description TEXT NOT NULL,
  parts_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  estimated_duration_hours INTEGER DEFAULT 2,
  warranty_months INTEGER DEFAULT 6,
  terms_conditions TEXT,
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'completed')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les paiements sécurisés avec rétention de fonds
CREATE TABLE IF NOT EXISTS public.secure_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL, -- 1% commission
  commission_rate NUMERIC DEFAULT 0.01,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'requires_capture', 'succeeded', 'canceled', 'failed')),
  payment_method TEXT,
  funds_held BOOLEAN DEFAULT true,
  funds_released_at TIMESTAMP WITH TIME ZONE,
  client_confirmation BOOLEAN DEFAULT false,
  work_completed BOOLEAN DEFAULT false,
  auto_release_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les rendez-vous
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  appointment_type TEXT DEFAULT 'repair' CHECK (appointment_type IN ('diagnostic', 'repair', 'pickup', 'delivery')),
  location_type TEXT DEFAULT 'shop' CHECK (location_type IN ('shop', 'client_home', 'pickup_point')),
  address TEXT,
  client_notes TEXT,
  repairer_notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la messagerie temps réel
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'system')),
  content TEXT,
  attachments JSONB DEFAULT '[]'::JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_unread_count INTEGER DEFAULT 0,
  repairer_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les avis et évaluations
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_photos JSONB DEFAULT '[]'::JSONB,
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS sur toutes les tables
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour quote_requests
CREATE POLICY "Clients can create their own quote requests" ON public.quote_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view their own quote requests" ON public.quote_requests
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Clients can update their own quote requests" ON public.quote_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Politiques RLS pour quotes
CREATE POLICY "Repairers can create quotes for assigned requests" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = repairer_id);

CREATE POLICY "Users can view quotes they're involved in" ON public.quotes
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Repairers can update their own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = repairer_id);

-- Politiques RLS pour secure_payments
CREATE POLICY "Users can view their own payments" ON public.secure_payments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "System can create payments" ON public.secure_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.secure_payments
  FOR UPDATE USING (true);

-- Politiques RLS pour appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Clients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = repairer_id);

-- Politiques RLS pour conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = repairer_id);

-- Politiques RLS pour conversation_messages
CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.conversation_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.conversation_messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politiques RLS pour reviews
CREATE POLICY "Clients can create reviews for their completed quotes" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Everyone can view approved reviews" ON public.reviews
  FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = client_id OR auth.uid() = repairer_id);

CREATE POLICY "Clients can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = client_id);

-- Fonctions utilitaires pour génération de numéros
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  quote_number TEXT;
BEGIN
  quote_number := 'QTE-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('quote_number_seq')::TEXT, 4, '0');
  RETURN quote_number;
END;
$$;

-- Séquence pour les numéros de devis
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Trigger pour auto-génération du numéro de devis
CREATE OR REPLACE FUNCTION auto_generate_quote_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quotes_auto_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_quote_number();

-- Trigger pour mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER quote_requests_updated_at BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER secure_payments_updated_at BEFORE UPDATE ON public.secure_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();