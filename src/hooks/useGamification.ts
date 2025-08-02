import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface GamificationState {
  level: number;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  badges: string[];
  achievements: Achievement[];
  streak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  category: 'blog' | 'profile' | 'engagement' | 'milestone';
}

const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_article_read',
    title: 'Premier lecteur',
    description: 'Lire votre premier article de blog',
    icon: '📖',
    xpReward: 10,
    category: 'blog'
  },
  {
    id: 'profile_complete',
    title: 'Profil au top',
    description: 'Compléter 100% de votre profil',
    icon: '✅',
    xpReward: 50,
    category: 'profile'
  },
  {
    id: 'first_share',
    title: 'Ambassadeur',
    description: 'Partager votre premier article',
    icon: '📢',
    xpReward: 15,
    category: 'engagement'
  },
  {
    id: 'streak_7_days',
    title: 'Lecteur assidu',
    description: 'Lire des articles 7 jours consécutifs',
    icon: '🔥',
    xpReward: 75,
    category: 'engagement'
  },
  {
    id: 'level_5',
    title: 'Expert en devenir',
    description: 'Atteindre le niveau 5',
    icon: '⭐',
    xpReward: 100,
    category: 'milestone'
  },
  {
    id: 'articles_master',
    title: 'Maître des guides',
    description: 'Lire 25 articles de blog',
    icon: '🎓',
    xpReward: 125,
    category: 'blog'
  }
];

export const useGamification = () => {
  const { user } = useAuth();
  const [gamificationState, setGamificationState] = useState<GamificationState>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    nextLevelXP: 100,
    badges: [],
    achievements: [],
    streak: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Charger depuis le localStorage en attendant l'implémentation backend
      const savedData = localStorage.getItem(`gamification_${user?.id}`);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setGamificationState(parsed);
      } else {
        // Initialiser pour un nouvel utilisateur
        const initialState: GamificationState = {
          level: 1,
          currentXP: 0,
          totalXP: 0,
          nextLevelXP: LEVEL_XP_REQUIREMENTS[1],
          badges: [],
          achievements: [],
          streak: 0
        };
        setGamificationState(initialState);
        saveGamificationData(initialState);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGamificationData = (data: GamificationState) => {
    if (user) {
      localStorage.setItem(`gamification_${user.id}`, JSON.stringify(data));
    }
  };

  const calculateLevel = (totalXP: number): { level: number; currentXP: number; nextLevelXP: number } => {
    let level = 1;
    let remainingXP = totalXP;

    for (let i = 1; i < LEVEL_XP_REQUIREMENTS.length; i++) {
      const xpForLevel = LEVEL_XP_REQUIREMENTS[i] - LEVEL_XP_REQUIREMENTS[i - 1];
      
      if (remainingXP >= xpForLevel) {
        remainingXP -= xpForLevel;
        level = i + 1;
      } else {
        break;
      }
    }

    const nextLevelXP = level < LEVEL_XP_REQUIREMENTS.length 
      ? LEVEL_XP_REQUIREMENTS[level] - LEVEL_XP_REQUIREMENTS[level - 1]
      : 1000; // XP pour les niveaux au-delà de la table

    return {
      level: Math.min(level, LEVEL_XP_REQUIREMENTS.length),
      currentXP: remainingXP,
      nextLevelXP
    };
  };

  const awardXP = (amount: number, reason?: string) => {
    const newTotalXP = gamificationState.totalXP + amount;
    const { level, currentXP, nextLevelXP } = calculateLevel(newTotalXP);
    
    const newState: GamificationState = {
      ...gamificationState,
      level,
      currentXP,
      totalXP: newTotalXP,
      nextLevelXP
    };

    // Vérifier les nouveaux succès
    checkAchievements(newState, reason);

    setGamificationState(newState);
    saveGamificationData(newState);

    // Notification de gain d'XP (peut être remplacé par un toast)
    console.log(`🎉 +${amount} XP gagné ! ${reason || ''}`);
    
    return newState;
  };

  const checkAchievements = (state: GamificationState, action?: string) => {
    const newAchievements: Achievement[] = [];

    DEFAULT_ACHIEVEMENTS.forEach(achievement => {
      // Vérifier si le succès n'est pas déjà débloqué
      if (state.achievements.some(a => a.id === achievement.id)) {
        return;
      }

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_article_read':
          shouldUnlock = action === 'article_read';
          break;
        case 'profile_complete':
          shouldUnlock = action === 'profile_complete';
          break;
        case 'first_share':
          shouldUnlock = action === 'article_shared';
          break;
        case 'level_5':
          shouldUnlock = state.level >= 5;
          break;
        case 'streak_7_days':
          shouldUnlock = state.streak >= 7;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString()
        };
        newAchievements.push(unlockedAchievement);
        
        // Bonus XP pour le succès
        state.totalXP += achievement.xpReward;
        console.log(`🏆 Succès débloqué : ${achievement.title} (+${achievement.xpReward} XP)`);
      }
    });

    if (newAchievements.length > 0) {
      state.achievements = [...state.achievements, ...newAchievements];
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(`last_visit_${user?.id}`);
    
    if (lastVisit === today) {
      return; // Déjà visité aujourd'hui
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    if (lastVisit === yesterday.toDateString()) {
      newStreak = gamificationState.streak + 1;
    }

    const newState = {
      ...gamificationState,
      streak: newStreak
    };

    setGamificationState(newState);
    saveGamificationData(newState);
    localStorage.setItem(`last_visit_${user?.id}`, today);

    // Bonus XP pour les streaks
    if (newStreak > 1) {
      awardXP(5, `Streak ${newStreak} jours`);
    }
  };

  const trackAction = (action: string, details?: any) => {
    switch (action) {
      case 'article_read':
        awardXP(10, 'Article lu');
        break;
      case 'article_shared':
        awardXP(15, 'Article partagé');
        break;
      case 'profile_updated':
        awardXP(5, 'Profil mis à jour');
        break;
      case 'first_login':
        awardXP(25, 'Première connexion');
        break;
      case 'blog_category_discovered':
        awardXP(8, `Catégorie ${details?.category} découverte`);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  return {
    ...gamificationState,
    loading,
    awardXP,
    trackAction,
    updateStreak,
    checkAchievements: (action?: string) => checkAchievements(gamificationState, action)
  };
};