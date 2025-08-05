import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAppStore } from '@/stores/appStore';

// Provider global pour initialiser tous les stores - SIMPLIFIÉ
export const GlobalStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth synchronization désactivée temporairement pour diagnostic

  // Synchronisation des notifications globales
  useEffect(() => {
    const unsubscribe = useGamificationStore.subscribe(
      (state) => state.profile?.current_level,
      (currentLevel, previousLevel) => {
        if (currentLevel && previousLevel && currentLevel > previousLevel) {
          useAppStore.getState().addNotification({
            type: 'success',
            title: '🎉 Nouveau niveau !',
            message: `Félicitations ! Vous êtes maintenant niveau ${currentLevel}`,
            duration: 8000
          });
        }
      }
    );

    return unsubscribe;
  }, []);

  return <>{children}</>;
};