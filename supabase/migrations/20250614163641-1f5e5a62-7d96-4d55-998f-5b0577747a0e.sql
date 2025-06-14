
-- Table notifications (pour envoyer notifications ciblées)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Table notification_settings (préférences par utilisateur)
CREATE TABLE public.notification_settings (
  user_id UUID PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Table referrals (parrainage de base)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reward_claimed BOOLEAN DEFAULT FALSE,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can see own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

-- Table parts_catalog (catalogue des pièces détachées)
CREATE TABLE public.parts_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  part_number TEXT,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table parts_inventory (stock de réparation)
CREATE TABLE public.parts_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  part_id UUID NOT NULL REFERENCES public.parts_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repairer can manage own inventory" ON public.parts_inventory
  FOR ALL USING (auth.uid() = repairer_id) WITH CHECK (auth.uid() = repairer_id);

-- Table parts_orders (commandes de pièces)
CREATE TABLE public.parts_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  part_id UUID NOT NULL REFERENCES public.parts_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.parts_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repairer can manage own orders" ON public.parts_orders
  FOR ALL USING (auth.uid() = repairer_id) WITH CHECK (auth.uid() = repairer_id);

-- Table ai_pre_diagnostic_chats (chatbot IA)
CREATE TABLE public.ai_pre_diagnostic_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active'
);
ALTER TABLE public.ai_pre_diagnostic_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can access own ai chats" ON public.ai_pre_diagnostic_chats
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_pre_diagnostic_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.ai_pre_diagnostic_chats(id),
  sender TEXT NOT NULL, -- 'user' ou 'ai'
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table time_slots (disponibilités pour réservations)
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repairer can manage own time slots" ON public.time_slots
  FOR ALL USING (auth.uid() = repairer_id) WITH CHECK (auth.uid() = repairer_id);

-- Table booking_rules (règles personnalisées de réservation)
CREATE TABLE public.booking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  rule JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.booking_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Repairer can manage own booking rules" ON public.booking_rules
  FOR ALL USING (auth.uid() = repairer_id) WITH CHECK (auth.uid() = repairer_id);

-- Table analytics_events (pour analytics avancés, logs d’événement)
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sees own events" ON public.analytics_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pour le temps réel sur notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Pour le temps réel sur parts_orders
ALTER TABLE public.parts_orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parts_orders;

