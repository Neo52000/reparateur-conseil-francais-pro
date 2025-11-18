import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface EnhancedToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export const enhancedToast = {
  success: ({ title, description, duration = 3000 }: EnhancedToastOptions) => {
    toast({
      title,
      description,
      duration,
      className: 'border-green-500 bg-green-50 text-green-900',
    });
  },

  error: ({ title, description, duration = 4000 }: EnhancedToastOptions) => {
    toast({
      title,
      description,
      duration,
      variant: 'destructive',
    });
  },

  warning: ({ title, description, duration = 3500 }: EnhancedToastOptions) => {
    toast({
      title,
      description,
      duration,
      className: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    });
  },

  info: ({ title, description, duration = 3000 }: EnhancedToastOptions) => {
    toast({
      title,
      description,
      duration,
      className: 'border-blue-500 bg-blue-50 text-blue-900',
    });
  },
};
