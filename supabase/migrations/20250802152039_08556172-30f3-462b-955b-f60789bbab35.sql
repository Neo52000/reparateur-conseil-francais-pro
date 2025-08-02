-- Drop existing policies if they exist and recreate them correctly
DROP POLICY IF EXISTS "Users can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Add the triggers for updated_at columns
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_client_id ON public.quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_repairer_id ON public.quote_requests(repairer_id);  
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_repairer_id ON public.conversations(repairer_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_secure_payments_quote_id ON public.secure_payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_reviews_repairer_id ON public.reviews(repairer_id);