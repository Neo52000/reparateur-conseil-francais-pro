import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  variant: NotificationVariant;
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-600'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-600'
  },
  info: {
    icon: Clock,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-600'
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  variant,
  title,
  description,
  duration = 5000,
  onClose,
  className
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn(
      'relative p-4 rounded-lg border shadow-lg transition-all duration-300 max-w-sm',
      config.className,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{title}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};