
-- Table saved_search_filters
CREATE TABLE IF NOT EXISTS public.saved_search_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  last_used TIMESTAMPTZ,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_search_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved filters"
  ON public.saved_search_filters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table client_interests
CREATE TABLE IF NOT EXISTS public.client_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_message TEXT,
  repairer_profile_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_interests ENABLE ROW LEVEL SECURITY;

-- Admins can manage all client interests
CREATE POLICY "Admins can manage client interests"
  ON public.client_interests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Anyone can create a client interest (public form)
CREATE POLICY "Anyone can create client interests"
  ON public.client_interests FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_saved_search_filters_updated_at
  BEFORE UPDATE ON public.saved_search_filters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_interests_updated_at
  BEFORE UPDATE ON public.client_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
