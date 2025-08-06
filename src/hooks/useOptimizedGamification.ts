import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Interfaces optimisées
interface GamificationProfile {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  last_activity_date: string;
  badges_earned: string[];
  achievements_earned: string[];
  created_at: string;
  updated_at: string;
}

interface GamificationReward {
  id: string;
  reward_type: string; // Sera castée vers le type correct
  reward_key: string;
  title: string;
  description: string;
  icon: string;
  xp_requirement: number;
  category: string;
  is_active: boolean;
}

interface GamificationState {
  profile: GamificationProfile | null;
  rewards: GamificationReward[];
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  loading: boolean;
  error: string | null;
}

// Constantes pour les niveaux
const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 16000, 21000, 27000, 34000, 42000, 51000
];

export const useOptimizedGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<GamificationState>({
    profile: null,
    rewards: [],
    currentLevel: 1,
    currentXP: 0,
    nextLevelXP: 100,
    totalXP: 0,
    loading: true,
    error: null
  });

  // Calculer le niveau et les XP actuels
  const calculateLevel = useCallback((totalXP: number) => {
    let level = 1;
    let currentXP = totalXP;
    
    for (let i = 1; i < LEVEL_XP_REQUIREMENTS.length; i++) {
      if (totalXP >= LEVEL_XP_REQUIREMENTS[i]) {
        level = i + 1;
        currentXP = totalXP - LEVEL_XP_REQUIREMENTS[i];
      } else {
        break;
      }
    }
    
    const nextLevelXP = level < LEVEL_XP_REQUIREMENTS.length 
      ? LEVEL_XP_REQUIREMENTS[level] - LEVEL_XP_REQUIREMENTS[level - 1]
      : 1000; // XP pour les niveaux au-delà du maximum défini
    
    return { level, currentXP, nextLevelXP };
  }, []);

  // Charger le profil de gamification
  const loadGamificationProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Vérifier si un profil existe
      const { data: existingProfile, error: fetchError } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching gamification profile:', fetchError);
        setState(prev => ({ ...prev, error: fetchError.message, loading: false }));
        return;
      }

      let profile = existingProfile;

      // Créer un profil si il n'existe pas
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('gamification_profiles')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            badges_earned: [],
            achievements_earned: []
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating gamification profile:', createError);
          setState(prev => ({ ...prev, error: createError.message, loading: false }));
          return;
        }

        profile = newProfile;
      }

      // Charger les récompenses disponibles
      const { data: rewards, error: rewardsError } = await supabase
        .from('gamification_rewards')
        .select('*')
        .eq('is_active', true)
        .order('xp_requirement');

      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
      }

      // Calculer le niveau actuel
      const levelData = calculateLevel(profile.total_xp);

      setState({
        profile,
        rewards: rewards || [],
        currentLevel: levelData.level,
        currentXP: levelData.currentXP,
        nextLevelXP: levelData.nextLevelXP,
        totalXP: profile.total_xp,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error in loadGamificationProfile:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      }));
    }
  }, [user?.id, calculateLevel]);

  // Attribuer des XP
  const awardXP = useCallback(async (amount: number, reason?: string, actionType?: string) => {
    if (!user?.id || !state.profile) return false;

    try {
      const newTotalXP = state.totalXP + amount;
      const newLevelData = calculateLevel(newTotalXP);
      
      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('gamification_profiles')
        .update({
          total_xp: newTotalXP,
          current_level: newLevelData.level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating gamification profile:', updateError);
        return false;
      }

      // Enregistrer l'historique
      const { error: historyError } = await supabase
        .from('gamification_xp_history')
        .insert({
          user_id: user.id,
          xp_amount: amount,
          reason,
          action_type: actionType,
          metadata: { previous_total: state.totalXP, new_total: newTotalXP }
        });

      if (historyError) {
        console.error('Error recording XP history:', historyError);
      }

      // Mettre à jour l'état local
      setState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          total_xp: newTotalXP,
          current_level: newLevelData.level
        } : null,
        currentLevel: newLevelData.level,
        currentXP: newLevelData.currentXP,
        nextLevelXP: newLevelData.nextLevelXP,
        totalXP: newTotalXP
      }));

      // Notification de gain de niveau
      if (newLevelData.level > state.currentLevel) {
        toast({
          title: "🎉 Nouveau niveau !",
          description: `Félicitations ! Vous êtes maintenant niveau ${newLevelData.level}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error awarding XP:', error);
      return false;
    }
  }, [user?.id, state.profile, state.totalXP, state.currentLevel, calculateLevel, toast]);

  // Mettre à jour la série quotidienne
  const updateStreak = useCallback(async () => {
    if (!user?.id || !state.profile) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = state.profile.last_activity_date;
      
      let newStreak = state.profile.current_streak;
      
      if (lastActivityDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityDate === yesterdayStr) {
          // Continuer la série
          newStreak += 1;
        } else if (lastActivityDate !== today) {
          // Réinitialiser la série
          newStreak = 1;
        }

        const { error } = await supabase
          .from('gamification_profiles')
          .update({
            current_streak: newStreak,
            last_activity_date: today
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating streak:', error);
          return false;
        }

        setState(prev => ({
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            current_streak: newStreak,
            last_activity_date: today
          } : null
        }));
      }

      return true;
    } catch (error) {
      console.error('Error updating streak:', error);
      return false;
    }
  }, [user?.id, state.profile]);

  // Suivre une action utilisateur
  const trackAction = useCallback(async (action: string, xpAmount?: number, details?: any) => {
    await updateStreak();
    
    if (xpAmount && xpAmount > 0) {
      await awardXP(xpAmount, `Action: ${action}`, action);
    }

    // Log des actions pour analytics
    console.log('🎯 Gamification action tracked:', { action, xpAmount, details });
  }, [updateStreak, awardXP]);

  // Charger les données au montage et lors des changements d'utilisateur
  useEffect(() => {
    if (user?.id) {
      loadGamificationProfile();
    }
  }, [user?.id, loadGamificationProfile]);

  // Mémoriser les valeurs calculées
  const memoizedState = useMemo(() => ({
    ...state,
    progressPercentage: state.nextLevelXP > 0 ? (state.currentXP / state.nextLevelXP) * 100 : 0,
    availableRewards: state.rewards.filter(reward => 
      !state.profile?.achievements_earned.includes(reward.reward_key) &&
      !state.profile?.badges_earned.includes(reward.reward_key)
    )
  }), [state]);

  return {
    ...memoizedState,
    awardXP,
    updateStreak,
    trackAction,
    reload: loadGamificationProfile
  };
};