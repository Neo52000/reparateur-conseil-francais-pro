-- Fix existing migration: Update UUID references to match actual column types

-- First, let's ensure proper foreign key relationships
-- Update quote_requests table to use proper UUID references
ALTER TABLE public.quote_requests 
  ADD CONSTRAINT fk_quote_requests_client 
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update conversations table to use proper UUID references  
ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_client
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update conversation_messages table
ALTER TABLE public.conversation_messages
  ADD CONSTRAINT fk_conversation_messages_conversation
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_conversation_messages_sender
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update secure_payments table
ALTER TABLE public.secure_payments
  ADD CONSTRAINT fk_secure_payments_quote
  FOREIGN KEY (quote_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_secure_payments_client
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update reviews table  
ALTER TABLE public.reviews
  ADD CONSTRAINT fk_reviews_client
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_reviews_appointment
  FOREIGN KEY (appointment_id) REFERENCES public.appointments_with_quotes(id) ON DELETE CASCADE;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_client_id ON public.quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_repairer_id ON public.quote_requests(repairer_id);  
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_repairer_id ON public.conversations(repairer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_secure_payments_quote_id ON public.secure_payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_reviews_repairer_id ON public.reviews(repairer_id);

-- Add missing updated_at triggers
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_secure_payments_updated_at
  BEFORE UPDATE ON public.secure_payments
  FOR EACH ROW  
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();