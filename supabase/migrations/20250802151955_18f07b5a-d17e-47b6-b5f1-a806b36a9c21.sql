-- Add RLS policies with correct column names

-- Quote requests policies
CREATE POLICY "Users can view their own quote requests" ON public.quote_requests
  FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = quote_requests.repairer_id
    )
  );

CREATE POLICY "Clients can create quote requests" ON public.quote_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their quote requests" ON public.quote_requests
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = quote_requests.repairer_id
    )
  );

-- Conversations policies  
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = conversations.repairer_id
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = conversations.repairer_id
    )
  );

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.repairer_profiles 
      WHERE user_id = auth.uid() AND id = conversations.repairer_id
    )
  );

-- Conversation messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_messages.conversation_id 
      AND (
        auth.uid() = client_id OR 
        EXISTS (
          SELECT 1 FROM public.repairer_profiles 
          WHERE user_id = auth.uid() AND id = conversations.repairer_id
        )
      )
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.conversation_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_messages.conversation_id 
      AND (
        auth.uid() = client_id OR 
        EXISTS (
          SELECT 1 FROM public.repairer_profiles 
          WHERE user_id = auth.uid() AND id = conversations.repairer_id
        )
      )
    )
  );

-- Secure payments policies
CREATE POLICY "Users can view their payments" ON public.secure_payments
  FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM public.quote_requests qr
      JOIN public.repairer_profiles rp ON rp.id = qr.repairer_id
      WHERE qr.id = secure_payments.quote_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payments" ON public.secure_payments
  FOR ALL USING (true) WITH CHECK (true);

-- Reviews policies (using user_id instead of client_id)
CREATE POLICY "Users can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);