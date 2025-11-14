import { toast as baseToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedToastOptions {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const createToast = (
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  { title, description, action, duration }: EnhancedToastOptions
) => {
  const borderColors = {
    success: 'border-l-status-success bg-status-success-light/50',
    error: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-status-warning bg-status-warning-light/50',
    info: 'border-l-status-info bg-status-info-light/50',
    loading: 'border-l-primary bg-primary/5',
  };

  const defaultDurations = {
    success: 5000,
    error: 7000,
    warning: 6000,
    info: 5000,
    loading: 0,
  };

  return baseToast({
    title,
    description,
    duration: duration ?? defaultDurations[type],
    action: action ? (
      <Button
        variant="outline"
        size="sm"
        onClick={action.onClick}
        className="shrink-0"
      >
        {action.label}
      </Button>
    ) : undefined,
    className: `border-l-4 ${borderColors[type]}`,
  });
};

export const enhancedToast = {
  success: (options: EnhancedToastOptions) => createToast('success', options),
  error: (options: EnhancedToastOptions) => createToast('error', options),
  warning: (options: EnhancedToastOptions) => createToast('warning', options),
  info: (options: EnhancedToastOptions) => createToast('info', options),
  loading: (options: Omit<EnhancedToastOptions, 'action'>) => createToast('loading', options),

  promise: async <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const toastId = enhancedToast.loading({ title: loading });

    try {
      const data = await promise;
      toastId.dismiss();
      
      const successMessage = typeof success === 'function' ? success(data) : success;
      enhancedToast.success({ title: successMessage });
      
      return data;
    } catch (err) {
      toastId.dismiss();
      
      const errorMessage = typeof error === 'function' ? error(err) : error;
      enhancedToast.error({ title: errorMessage });
      
      throw err;
    }
  },
};
