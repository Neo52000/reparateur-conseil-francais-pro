
-- Create quotes table for online quote requests
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id TEXT,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT CHECK (status IN ('pending', 'responded', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  estimated_price DECIMAL(10,2),
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create appointments table for booking system
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing grid table
CREATE TABLE public.pricing_grid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  average_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_brand, device_model, issue_type)
);

-- Create chat messages table for real-time communication
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'repairer')) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) DEFAULT 'text',
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create repair tracking table
CREATE TABLE public.repair_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  repairer_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('received', 'diagnosed', 'parts_ordered', 'in_repair', 'testing', 'completed', 'ready_pickup')) NOT NULL,
  status_message TEXT,
  estimated_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repairer_id TEXT NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotes
CREATE POLICY "Users can view their own quotes" ON public.quotes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create quotes" ON public.quotes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quotes" ON public.quotes
FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON public.appointments
FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for pricing grid (public read access)
CREATE POLICY "Anyone can view pricing grid" ON public.pricing_grid
FOR SELECT USING (true);

-- RLS policies for chat messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages
FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can create messages" ON public.chat_messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS policies for repair tracking
CREATE POLICY "Anyone can view repair tracking" ON public.repair_tracking
FOR SELECT USING (true);

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insert sample pricing data
INSERT INTO public.pricing_grid (device_brand, device_model, issue_type, min_price, max_price, average_price) VALUES
('iPhone', '14 Pro', 'Écran cassé', 89.90, 149.90, 119.90),
('iPhone', '14 Pro', 'Batterie', 69.90, 89.90, 79.90),
('iPhone', '13', 'Écran cassé', 79.90, 139.90, 109.90),
('iPhone', '13', 'Batterie', 59.90, 79.90, 69.90),
('Samsung', 'Galaxy S23', 'Écran cassé', 99.90, 159.90, 129.90),
('Samsung', 'Galaxy S23', 'Batterie', 69.90, 89.90, 79.90),
('Samsung', 'Galaxy S22', 'Écran cassé', 89.90, 149.90, 119.90),
('Samsung', 'Galaxy S22', 'Batterie', 59.90, 79.90, 69.90);
