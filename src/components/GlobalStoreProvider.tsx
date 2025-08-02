import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAppStore } from '@/stores/appStore';

// Provider global pour initialiser tous les stores
export const GlobalStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronisation cross-tab pour l'auth
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-storage' && e.newValue) {
        try {
          const { state } = JSON.parse(e.newValue);
          if (state?.session) {
            useAuthStore.getState().setAuth(state.session, state.profile);
          }
        } catch (error) {
          console.error('Error syncing auth across tabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Synchronisation des notifications globales
  React.useEffect(() => {
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