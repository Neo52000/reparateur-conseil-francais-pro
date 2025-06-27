
-- Supprimer les tables si elles existent déjà (pour nettoyer)
DROP TABLE IF EXISTS appointments_with_quotes CASCADE;
DROP TABLE IF EXISTS repairer_availability CASCADE;
DROP TABLE IF EXISTS notifications_system CASCADE;
DROP TABLE IF EXISTS quotes_with_timeline CASCADE;

-- Table pour les devis avec gestion des timers
CREATE TABLE quotes_with_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id),
  repairer_id UUID NOT NULL, -- Changé en UUID au lieu de TEXT
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  repair_type TEXT NOT NULL,
  issue_description TEXT,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired')),
  
  -- Timer fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  repairer_response_deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  client_acceptance_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Quote details (filled by repairer)
  estimated_price NUMERIC(10,2),
  repair_duration TEXT,
  warranty_info TEXT,
  repairer_notes TEXT,
  quoted_at TIMESTAMP WITH TIME ZONE,
  
  -- Client response
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  client_response_notes TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le système de notifications
CREATE TABLE notifications_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'repairer')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('quote_request', 'quote_response', 'quote_accepted', 'quote_rejected', 'quote_expired', 'appointment_booked')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_quote_id UUID REFERENCES quotes_with_timeline(id),
  related_appointment_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les créneaux de rendez-vous des réparateurs
CREATE TABLE repairer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les rendez-vous avec les devis
CREATE TABLE appointments_with_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes_with_timeline(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  repairer_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  client_notes TEXT,
  repairer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_quotes_timeline_status ON quotes_with_timeline(status);
CREATE INDEX idx_quotes_timeline_repairer ON quotes_with_timeline(repairer_id);
CREATE INDEX idx_quotes_timeline_client ON quotes_with_timeline(client_id);
CREATE INDEX idx_quotes_timeline_deadlines ON quotes_with_timeline(repairer_response_deadline, client_acceptance_deadline);
CREATE INDEX idx_notifications_user ON notifications_system(user_id, is_read);
CREATE INDEX idx_repairer_availability ON repairer_availability(repairer_id, day_of_week);
CREATE INDEX idx_appointments_date ON appointments_with_quotes(appointment_date);

-- RLS Policies
ALTER TABLE quotes_with_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_with_quotes ENABLE ROW LEVEL SECURITY;

-- Policies pour quotes_with_timeline
CREATE POLICY "Users can view their own quotes" ON quotes_with_timeline
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = repairer_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

CREATE POLICY "Clients can create quotes" ON quotes_with_timeline
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Repairers can update their quotes" ON quotes_with_timeline
  FOR UPDATE USING (
    auth.uid() = repairer_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

-- Policies pour notifications_system
CREATE POLICY "Users can view their own notifications" ON notifications_system
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications_system
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour repairer_availability
CREATE POLICY "Repairers can manage their availability" ON repairer_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

CREATE POLICY "Anyone can view repairer availability" ON repairer_availability
  FOR SELECT USING (true);

-- Policies pour appointments_with_quotes
CREATE POLICY "Users can view their appointments" ON appointments_with_quotes
  FOR SELECT USING (
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

CREATE POLICY "Clients can create appointments" ON appointments_with_quotes
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their appointments" ON appointments_with_quotes
  FOR UPDATE USING (
    auth.uid() = client_id OR
    EXISTS (SELECT 1 FROM repairer_profiles WHERE user_id = auth.uid() AND id = repairer_id)
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_timeline_updated_at BEFORE UPDATE ON quotes_with_timeline FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_repairer_availability_updated_at BEFORE UPDATE ON repairer_availability FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments_with_quotes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
