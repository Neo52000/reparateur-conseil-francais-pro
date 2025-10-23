-- Phase 3: Messaging Enhancement (Fixed)

-- Améliorer la table conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes_with_timeline(id),
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unread_count_client INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count_repairer INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Table pour les pièces jointes
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'video', 'document')),
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_conversations_quote ON conversations(quote_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

-- Fonction update conversation
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    unread_count_client = CASE WHEN NEW.sender_type = 'repairer' THEN unread_count_client + 1 ELSE unread_count_client END,
    unread_count_repairer = CASE WHEN NEW.sender_type = 'user' THEN unread_count_repairer + 1 ELSE unread_count_repairer END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_conversation_on_new_message ON chat_messages;
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;