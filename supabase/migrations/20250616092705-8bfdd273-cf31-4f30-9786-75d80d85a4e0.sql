
-- Créer une table pour les codes promo
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER CHECK (max_uses > 0),
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  applicable_plans TEXT[] DEFAULT '{}', -- Si vide, applicable à tous les plans
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent tout gérer
CREATE POLICY "Admins can manage all promo codes" 
  ON public.promo_codes 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour la lecture publique (pour valider les codes)
CREATE POLICY "Public can view active promo codes" 
  ON public.promo_codes 
  FOR SELECT 
  TO anon, authenticated
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- Index pour les performances
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(active);
CREATE INDEX idx_promo_codes_valid_until ON public.promo_codes(valid_until);

-- Fonction pour valider et utiliser un code promo
CREATE OR REPLACE FUNCTION public.validate_and_use_promo_code(promo_code_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record RECORD;
  result JSONB;
BEGIN
  -- Rechercher le code promo
  SELECT * INTO code_record 
  FROM public.promo_codes 
  WHERE code = promo_code_text 
    AND active = true 
    AND (valid_until IS NULL OR valid_until > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  FOR UPDATE;
  
  -- Si le code n'existe pas ou n'est pas valide
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Code promo invalide ou expiré'
    );
  END IF;
  
  -- Incrémenter l'utilisation
  UPDATE public.promo_codes 
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = code_record.id;
  
  -- Retourner les détails du code
  RETURN jsonb_build_object(
    'valid', true,
    'discount_type', code_record.discount_type,
    'discount_value', code_record.discount_value,
    'applicable_plans', code_record.applicable_plans
  );
END;
$$;
