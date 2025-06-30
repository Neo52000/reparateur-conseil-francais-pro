
-- Corriger l'erreur 1: Recréer la vue admin_subscription_overview sans SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_subscription_overview;

CREATE VIEW public.admin_subscription_overview AS
SELECT 
    rs.id,
    rs.repairer_id,
    rs.email,
    rs.subscription_tier,
    rs.billing_cycle,
    rs.subscribed,
    rs.subscription_end,
    rs.created_at,
    rs.updated_at,
    p.first_name,
    p.last_name,
    sp.name as plan_name,
    sp.price_monthly,
    sp.price_yearly
FROM repairer_subscriptions rs
LEFT JOIN profiles p ON rs.user_id = p.id
LEFT JOIN subscription_plans sp ON rs.subscription_plan_id = sp.id
ORDER BY rs.created_at DESC;

-- Corriger l'erreur 2: Activer RLS sur la table parts_catalog
ALTER TABLE public.parts_catalog ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS pour parts_catalog
CREATE POLICY "Public can view parts catalog" 
  ON public.parts_catalog 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage parts catalog" 
  ON public.parts_catalog 
  FOR ALL 
  TO authenticated
  USING (get_current_user_role() = 'admin');

-- Corriger l'erreur 3: Activer RLS sur la table ai_pre_diagnostic_messages
ALTER TABLE public.ai_pre_diagnostic_messages ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS pour ai_pre_diagnostic_messages
CREATE POLICY "Users can view their own diagnostic messages" 
  ON public.ai_pre_diagnostic_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_pre_diagnostic_chats 
      WHERE ai_pre_diagnostic_chats.id = ai_pre_diagnostic_messages.chat_id 
      AND ai_pre_diagnostic_chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create diagnostic messages for their chats" 
  ON public.ai_pre_diagnostic_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_pre_diagnostic_chats 
      WHERE ai_pre_diagnostic_chats.id = ai_pre_diagnostic_messages.chat_id 
      AND ai_pre_diagnostic_chats.user_id = auth.uid()
    )
  );

-- Activer aussi RLS sur ai_pre_diagnostic_chats si ce n'est pas déjà fait
ALTER TABLE public.ai_pre_diagnostic_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostic chats" 
  ON public.ai_pre_diagnostic_chats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnostic chats" 
  ON public.ai_pre_diagnostic_chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnostic chats" 
  ON public.ai_pre_diagnostic_chats 
  FOR UPDATE 
  USING (auth.uid() = user_id);
