-- Migration pour optimiser la gamification et créer les tables nécessaires

-- 1. Table pour les profils de gamification
CREATE TABLE IF NOT EXISTS public.gamification_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  badges_earned TEXT[] DEFAULT '{}',
  achievements_earned TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Table pour l'historique des XP
CREATE TABLE IF NOT EXISTS public.gamification_xp_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  action_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table pour les récompenses disponibles
CREATE TABLE IF NOT EXISTS public.gamification_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_type TEXT NOT NULL, -- 'badge', 'achievement', 'level_bonus'
  reward_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_requirement INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_rewards ENABLE ROW LEVEL SECURITY;

-- Policies pour gamification_profiles
CREATE POLICY "Users can view their own gamification profile"
ON public.gamification_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification profile"
ON public.gamification_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create gamification profiles"
ON public.gamification_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies pour gamification_xp_history
CREATE POLICY "Users can view their own XP history"
ON public.gamification_xp_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP history"
ON public.gamification_xp_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies pour gamification_rewards
CREATE POLICY "Everyone can view active rewards"
ON public.gamification_rewards
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage rewards"
ON public.gamification_rewards
FOR ALL
USING (get_current_user_role() = 'admin');

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-update timestamp
CREATE TRIGGER update_gamification_profiles_updated_at
  BEFORE UPDATE ON public.gamification_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gamification_updated_at();

-- Insérer des récompenses par défaut
INSERT INTO public.gamification_rewards (reward_type, reward_key, title, description, icon, xp_requirement, category) VALUES
('achievement', 'first_login', 'Premier pas', 'Première connexion sur RepairHub', '🎯', 0, 'general'),
('achievement', 'profile_complete', 'Profil complet', 'Profil utilisateur complété', '✅', 50, 'profile'),
('achievement', 'first_quote', 'Premier devis', 'Premier devis demandé', '📝', 100, 'quotes'),
('achievement', 'blog_reader', 'Lecteur assidu', 'Premier article de blog lu', '📚', 25, 'blog'),
('achievement', 'social_sharer', 'Partageur', 'Premier partage social', '🔗', 75, 'social'),
('badge', 'active_user', 'Utilisateur actif', 'Connexion quotidienne', '🔥', 0, 'activity'),
('badge', 'week_streak', 'Série d''une semaine', '7 jours consécutifs', '⭐', 0, 'activity'),
('badge', 'month_streak', 'Série d''un mois', '30 jours consécutifs', '🏆', 0, 'activity')
ON CONFLICT (reward_key) DO NOTHING;