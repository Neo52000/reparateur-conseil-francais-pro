-- Correction 1: Ajouter des politiques RLS aux 3 tables sans politiques

-- Table: message_attachments
CREATE POLICY "Users can view their own message attachments"
  ON public.message_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.conversations c ON c.id::text = cm.conversation_id
      WHERE cm.id = message_attachments.message_id
      AND (cm.sender_id = auth.uid() OR c.client_id = auth.uid() OR c.repairer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create attachments for their messages"
  ON public.message_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      WHERE cm.id = message_attachments.message_id
      AND cm.sender_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all attachments"
  ON public.message_attachments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Table: payment_holds (accès via la table payments)
CREATE POLICY "Users can view their payment holds"
  ON public.payment_holds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_holds.payment_id
      AND (p.repairer_id = auth.uid() OR p.client_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all payment holds"
  ON public.payment_holds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Table: refunds (accès via la table payments)
CREATE POLICY "Users can view their refunds"
  ON public.refunds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = refunds.payment_id
      AND (p.repairer_id = auth.uid() OR p.client_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all refunds"
  ON public.refunds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Correction 2: Ajouter search_path aux fonctions qui n'en ont pas
ALTER FUNCTION public.calculate_data_quality_score(repairer_record repairers) SET search_path = public;
ALTER FUNCTION public.calculate_product_margin() SET search_path = public;
ALTER FUNCTION public.calculate_shopify_commission(order_total numeric, commission_rate_param numeric) SET search_path = public;
ALTER FUNCTION public.create_ui_configuration_history() SET search_path = public;
ALTER FUNCTION public.fix_encoding_issues() SET search_path = public;
ALTER FUNCTION public.generate_certificate_number(repairer_uuid uuid) SET search_path = public;
ALTER FUNCTION public.auto_generate_certificate_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_invoice_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_pos_customer_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_qualirepar_dossier_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_repair_order_number() SET search_path = public;
ALTER FUNCTION public.auto_generate_unique_id() SET search_path = public;