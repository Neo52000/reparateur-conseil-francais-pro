
-- Créer les tables pour le chatbot IA conversationnel

-- Table pour stocker les conversations du chatbot
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT DEFAULT 'anonymous',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'escalated')),
  context JSONB DEFAULT '{}',
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les messages du chatbot
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'system')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'diagnostic', 'quote', 'appointment', 'image', 'voice')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la base de connaissances d'entraînement
CREATE TABLE chatbot_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  intent TEXT NOT NULL,
  training_text TEXT NOT NULL,
  response_template TEXT NOT NULL,
  confidence_threshold NUMERIC(3,2) DEFAULT 0.8,
  device_type TEXT,
  brand TEXT,
  model TEXT,
  repair_type TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les analytics du chatbot
CREATE TABLE chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, metric_type)
);

-- Table pour la configuration du chatbot
CREATE TABLE chatbot_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Table pour le feedback et l'apprentissage
CREATE TABLE chatbot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversations(id),
  message_id UUID REFERENCES chatbot_messages(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'suggestion')),
  feedback_text TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_feedback ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les conversations
CREATE POLICY "Users can view their own conversations" ON chatbot_conversations
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create conversations" ON chatbot_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own conversations" ON chatbot_conversations
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- Politiques pour les messages
CREATE POLICY "Users can view messages from their conversations" ON chatbot_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM chatbot_conversations 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Anyone can create messages" ON chatbot_messages
  FOR INSERT WITH CHECK (true);

-- Politiques pour les admins sur toutes les tables
CREATE POLICY "Admins have full access to training data" ON chatbot_training_data
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins have full access to analytics" ON chatbot_analytics
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins have full access to configuration" ON chatbot_configuration
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins have full access to feedback" ON chatbot_feedback
  FOR ALL USING (get_current_user_role() = 'admin');

-- Fonction pour incrémenter les métriques analytics
CREATE OR REPLACE FUNCTION increment_chatbot_metric(metric_name TEXT, increment_by INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO chatbot_analytics (date, metric_type, metric_value)
  VALUES (CURRENT_DATE, metric_name, increment_by)
  ON CONFLICT (date, metric_type)
  DO UPDATE SET 
    metric_value = chatbot_analytics.metric_value + increment_by,
    created_at = now();
END;
$$;

-- Insérer des données de configuration par défaut
INSERT INTO chatbot_configuration (config_key, config_value, description) VALUES
('ai_model', '"gpt-4o-mini"', 'Modèle IA utilisé pour les réponses'),
('confidence_threshold', '0.7', 'Seuil de confiance minimum pour les réponses automatiques'),
('max_conversation_length', '50', 'Nombre maximum de messages par conversation'),
('enable_voice', 'true', 'Activer les fonctionnalités vocales'),
('enable_learning', 'true', 'Activer l''apprentissage automatique'),
('bot_personality', '{"name": "Assistant TopRéparateurs", "tone": "helpful", "style": "professional"}', 'Personnalité du chatbot');

-- Insérer des données d'entraînement de base
INSERT INTO chatbot_training_data (category, intent, training_text, response_template, device_type) VALUES
('greeting', 'salutation', 'bonjour,salut,hello,bonsoir', 'Bonjour ! Je suis l''assistant TopRéparateurs. Comment puis-je vous aider aujourd''hui ?', NULL),
('device_identification', 'identify_device', 'iphone,samsung,xiaomi,huawei,écran cassé,batterie', 'Quel est votre appareil ? (iPhone, Samsung, Xiaomi, etc.)', 'smartphone'),
('appointment', 'book_appointment', 'rendez-vous,rdv,réserver,prendre rendez-vous', 'Je peux vous aider à prendre rendez-vous. Dans quelle ville cherchez-vous un réparateur ?', NULL),
('diagnostic', 'device_problem', 'problème,panne,ne marche pas,cassé', 'Pouvez-vous me décrire le problème avec votre appareil ?', NULL),
('pricing', 'price_inquiry', 'prix,coût,tarif,combien', 'Le prix dépend du type de réparation. Pouvez-vous me dire quel est le problème ?', NULL);
