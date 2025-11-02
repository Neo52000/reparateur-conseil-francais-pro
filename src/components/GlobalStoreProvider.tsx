import { useEffect, ReactNode, FC } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAppStore } from '@/stores/appStore';

export const GlobalStoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
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

    return () => unsubscribe?.();
  }, []);

  return <>{children}</>;
};