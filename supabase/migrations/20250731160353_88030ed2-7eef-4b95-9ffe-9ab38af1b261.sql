-- Créer la table des badges réparateurs
CREATE TABLE public.repairer_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repairer_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned BOOLEAN NOT NULL DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  level TEXT CHECK (level IN ('bronze', 'silver', 'gold', 'diamond')),
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repairer_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.repairer_badges ENABLE ROW LEVEL SECURITY;

-- Politique pour que les réparateurs voient leurs propres badges
CREATE POLICY "Repairers can view their own badges"
ON public.repairer_badges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.repairer_profiles
    WHERE repairer_profiles.id = repairer_badges.repairer_id
    AND repairer_profiles.user_id = auth.uid()
  )
);

-- Politique pour que le système puisse créer/modifier les badges
CREATE POLICY "System can manage badges"
ON public.repairer_badges
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_repairer_badges_updated_at
  BEFORE UPDATE ON public.repairer_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();