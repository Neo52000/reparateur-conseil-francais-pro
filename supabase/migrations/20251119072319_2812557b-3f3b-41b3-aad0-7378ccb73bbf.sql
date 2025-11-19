-- =====================================================
-- TABLE 1: quote_messages - Messagerie pour les devis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quote_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'repairer')),
  message_text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_quote_messages_quote_id ON public.quote_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_messages_sender_id ON public.quote_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_quote_messages_created_at ON public.quote_messages(created_at DESC);

-- RLS policies pour quote_messages
ALTER TABLE public.quote_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages from their quotes" ON public.quote_messages;
CREATE POLICY "Users can view messages from their quotes"
ON public.quote_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_messages.quote_id
    AND q.user_id::uuid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Repairers can view messages from assigned quotes" ON public.quote_messages;
CREATE POLICY "Repairers can view messages from assigned quotes"
ON public.quote_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    INNER JOIN public.repairer_profiles rp ON rp.id::text = q.repairer_id
    WHERE q.id = quote_messages.quote_id
    AND rp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.quote_messages;
CREATE POLICY "Authenticated users can create messages"
ON public.quote_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_quote_messages_updated_at ON public.quote_messages;
CREATE TRIGGER update_quote_messages_updated_at
BEFORE UPDATE ON public.quote_messages
FOR EACH ROW
EXECUTE FUNCTION update_ui_updated_at();

-- =====================================================
-- TABLE 2: repair_timeline_events - Suivi des réparations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.repair_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments_with_quotes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'quote_requested', 'quote_sent', 'quote_accepted', 'quote_rejected',
    'appointment_scheduled', 'appointment_confirmed', 'appointment_cancelled',
    'repair_started', 'repair_in_progress', 'repair_completed', 'repair_failed',
    'device_ready', 'device_delivered',
    'payment_pending', 'payment_completed', 'payment_failed'
  )),
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_repair_timeline_quote_id ON public.repair_timeline_events(quote_id);
CREATE INDEX IF NOT EXISTS idx_repair_timeline_appointment_id ON public.repair_timeline_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_repair_timeline_event_type ON public.repair_timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_repair_timeline_created_at ON public.repair_timeline_events(created_at DESC);

-- RLS policies pour repair_timeline_events
ALTER TABLE public.repair_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view timeline events from their quotes" ON public.repair_timeline_events;
CREATE POLICY "Users can view timeline events from their quotes"
ON public.repair_timeline_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = repair_timeline_events.quote_id
    AND q.user_id::uuid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Repairers can view timeline events from assigned quotes" ON public.repair_timeline_events;
CREATE POLICY "Repairers can view timeline events from assigned quotes"
ON public.repair_timeline_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    INNER JOIN public.repairer_profiles rp ON rp.id::text = q.repairer_id
    WHERE q.id = repair_timeline_events.quote_id
    AND rp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can create timeline events" ON public.repair_timeline_events;
CREATE POLICY "Authenticated users can create timeline events"
ON public.repair_timeline_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TABLE 3: repair_reviews - Avis clients
-- =====================================================
CREATE TABLE IF NOT EXISTS public.repair_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments_with_quotes(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  repairer_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT,
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  images JSONB DEFAULT '[]'::jsonb,
  repairer_response TEXT,
  repairer_response_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'hidden', 'flagged')),
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_repair_reviews_quote_id ON public.repair_reviews(quote_id);
CREATE INDEX IF NOT EXISTS idx_repair_reviews_user_id ON public.repair_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_reviews_repairer_id ON public.repair_reviews(repairer_id);
CREATE INDEX IF NOT EXISTS idx_repair_reviews_rating ON public.repair_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_repair_reviews_status ON public.repair_reviews(status);
CREATE INDEX IF NOT EXISTS idx_repair_reviews_created_at ON public.repair_reviews(created_at DESC);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_repair_reviews_updated_at ON public.repair_reviews;
CREATE TRIGGER update_repair_reviews_updated_at
BEFORE UPDATE ON public.repair_reviews
FOR EACH ROW
EXECUTE FUNCTION update_ui_updated_at();

-- RLS policies pour repair_reviews
ALTER TABLE public.repair_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view published reviews" ON public.repair_reviews;
CREATE POLICY "Everyone can view published reviews"
ON public.repair_reviews
FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Users can view their own reviews" ON public.repair_reviews;
CREATE POLICY "Users can view their own reviews"
ON public.repair_reviews
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Repairers can view their reviews" ON public.repair_reviews;
CREATE POLICY "Repairers can view their reviews"
ON public.repair_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.repairer_profiles rp 
    WHERE rp.id::text = repair_reviews.repairer_id 
    AND rp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.repair_reviews;
CREATE POLICY "Authenticated users can create reviews"
ON public.repair_reviews
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id
    AND q.user_id::uuid = auth.uid()
  )
);

DROP POLICY IF EXISTS "Repairers can update their review responses" ON public.repair_reviews;
CREATE POLICY "Repairers can update their review responses"
ON public.repair_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.repairer_profiles rp 
    WHERE rp.id::text = repair_reviews.repairer_id 
    AND rp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.repairer_profiles rp 
    WHERE rp.id::text = repair_reviews.repairer_id 
    AND rp.user_id = auth.uid()
  )
);

-- =====================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.quote_messages IS 'Messages échangés entre clients et réparateurs concernant les devis';
COMMENT ON TABLE public.repair_timeline_events IS 'Événements chronologiques du parcours de réparation (devis → paiement → RDV → réparation)';
COMMENT ON TABLE public.repair_reviews IS 'Avis clients sur les réparations effectuées par les réparateurs';