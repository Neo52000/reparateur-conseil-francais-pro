import { useEffect, ReactNode, FC } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAppStore } from '@/stores/appStore';

// Provider global pour initialiser tous les stores
export const GlobalStoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🏪 GlobalStoreProvider: Initializing...');
  
  // Note: Auth synchronization is now handled by Supabase client directly via useAuth hook

  // Synchronisation des notifications globales
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Démarrer la subscription après le montage
    const startSubscription = () => {
      try {
        unsubscribe = useGamificationStore.subscribe(
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
      } catch (error) {
        console.error('Error setting up gamification subscription:', error);
      }
    };

    startSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  console.log('🏪 GlobalStoreProvider: Rendering children...');
  return <>{children}</>;
};