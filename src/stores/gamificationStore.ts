import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface GamificationProfile {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  last_activity_date: string;
  badges_earned: string[];
  achievements_earned: string[];
}

interface GamificationState {
  // État
  profile: GamificationProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProfile: (userId: string) => Promise<void>;
  awardXP: (amount: number, reason?: string) => Promise<boolean>;
  updateStreak: () => Promise<boolean>;
  reset: () => void;
  
  // Computed values  
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercentage: number;
}

const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 16000, 21000, 27000, 34000, 42000, 51000
];

const calculateLevel = (totalXP: number) => {
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
    : 1000;
  
  return { level, currentXP, nextLevelXP };
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // État initial
      profile: null,
      loading: false,
      error: null,
      
      // Actions
      loadProfile: async (userId: string) => {
        set({ loading: true, error: null });
        
        try {
          const { data: profile, error } = await supabase
            .from('gamification_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          if (!profile) {
            // Créer un nouveau profil
            const { data: newProfile, error: createError } = await supabase
              .from('gamification_profiles')
              .insert({ user_id: userId })
              .select()
              .single();

            if (createError) throw createError;
            set({ profile: newProfile, loading: false });
          } else {
            set({ profile, loading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          });
        }
      },
      
      awardXP: async (amount: number, reason?: string) => {
        const { profile } = get();
        if (!profile) return false;

        try {
          const newTotalXP = profile.total_xp + amount;
          const { level } = calculateLevel(newTotalXP);
          
          const { error } = await supabase
            .from('gamification_profiles')
            .update({
              total_xp: newTotalXP,
              current_level: level
            })
            .eq('user_id', profile.user_id);

          if (error) throw error;

          // Enregistrer l'historique
          await supabase
            .from('gamification_xp_history')
            .insert({
              user_id: profile.user_id,
              xp_amount: amount,
              reason
            });

          set({ 
            profile: { 
              ...profile, 
              total_xp: newTotalXP, 
              current_level: level 
            } 
          });

          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
          return false;
        }
      },
      
      updateStreak: async () => {
        const { profile } = get();
        if (!profile) return false;

        try {
          const today = new Date().toISOString().split('T')[0];
          const lastActivity = profile.last_activity_date;
          
          let newStreak = profile.current_streak;
          
          if (lastActivity !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            newStreak = lastActivity === yesterdayStr ? newStreak + 1 : 1;

            const { error } = await supabase
              .from('gamification_profiles')
              .update({
                current_streak: newStreak,
                last_activity_date: today
              })
              .eq('user_id', profile.user_id);

            if (error) throw error;

            set({
              profile: {
                ...profile,
                current_streak: newStreak,
                last_activity_date: today
              }
            });
          }

          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
          return false;
        }
      },
      
      reset: () => set({ profile: null, loading: false, error: null }),
      
      // Computed values
      get currentLevel() {
        const { profile } = get();
        return profile ? calculateLevel(profile.total_xp).level : 1;
      },
      
      get currentXP() {
        const { profile } = get();
        return profile ? calculateLevel(profile.total_xp).currentXP : 0;
      },
      
      get nextLevelXP() {
        const { profile } = get();
        return profile ? calculateLevel(profile.total_xp).nextLevelXP : 100;
      },
      
      get progressPercentage() {
        const currentXP = get().currentXP;
        const nextLevelXP = get().nextLevelXP;
        return nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
      }
    })),
    {
      name: 'gamification-storage',
      partialize: (state) => ({ profile: state.profile })
    }
  )
);