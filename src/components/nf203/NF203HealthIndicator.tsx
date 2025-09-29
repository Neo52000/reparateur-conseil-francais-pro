import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NF203HealthIndicatorProps {
  health: 'excellent' | 'good' | 'warning' | 'critical';
  label?: string;
  showPulse?: boolean;
}

export function NF203HealthIndicator({ health, label, showPulse = true }: NF203HealthIndicatorProps) {
  const getHealthConfig = () => {
    switch (health) {
      case 'excellent':
        return {
          color: 'bg-green-500',
          label: label || 'Excellent',
          textColor: 'text-green-600'
        };
      case 'good':
        return {
          color: 'bg-blue-500',
          label: label || 'Bon',
          textColor: 'text-blue-600'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          label: label || 'À surveiller',
          textColor: 'text-yellow-600'
        };
      case 'critical':
        return {
          color: 'bg-red-500',
          label: label || 'Critique',
          textColor: 'text-red-600'
        };
    }
  };

  const config = getHealthConfig();

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={cn('h-3 w-3 rounded-full', config.color)} />
        {showPulse && (
          <div
            className={cn(
              'absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-75',
              config.color
            )}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Activity className={cn('h-4 w-4', config.textColor)} />
        <span className={cn('text-sm font-medium', config.textColor)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
