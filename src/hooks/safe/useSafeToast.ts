import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useSafeToast = () => {
  const toast = useCallback(({ title, description, variant }: ToastProps) => {
    try {
      if (variant === 'destructive') {
        sonnerToast.error(title || description || 'Erreur');
      } else {
        sonnerToast.success(title || description || 'Succès');
      }
    } catch (error) {
      console.warn('Toast failed to display:', error);
      // Fallback to console log if toast fails
      console.log(`[TOAST] ${title}: ${description}`);
    }
  }, []);

  return { toast };
};