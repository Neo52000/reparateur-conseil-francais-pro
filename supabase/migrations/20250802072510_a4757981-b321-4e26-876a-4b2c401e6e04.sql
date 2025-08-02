-- Correction du warning de sécurité pour la fonction de gamification
CREATE OR REPLACE FUNCTION public.update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';