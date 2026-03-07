
CREATE TABLE public.repairer_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairer_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  siret TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.repairer_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own claims"
  ON public.repairer_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims"
  ON public.repairer_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
  ON public.repairer_claims FOR SELECT TO authenticated
  USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can update claims"
  ON public.repairer_claims FOR UPDATE TO authenticated
  USING (public.has_admin_role(auth.uid()));
