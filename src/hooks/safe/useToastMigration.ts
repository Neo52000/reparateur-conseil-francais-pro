import { useSafeToast } from './useSafeToast';

// Hook de migration qui wrap l'ancien et le nouveau système
export const useToastMigration = () => {
  const { toast: safeToast } = useSafeToast();
  
  // Fonction compatible avec l'ancien format de toast
  const toast = (options: any) => {
    try {
      if (typeof options === 'object' && options !== null) {
        safeToast({
          title: options.title,
          description: options.description,
          variant: options.variant
        });
      } else {
        console.warn('Toast called with invalid options:', options);
      }
    } catch (error) {
      console.error('Toast migration error:', error);
    }
  };

  return {
    toast,
    toasts: [], // Compatibilité avec l'ancien format
    dismiss: () => {} // Compatibilité avec l'ancien format
  };
};