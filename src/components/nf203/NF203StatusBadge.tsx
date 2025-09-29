import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NF203StatusBadgeProps {
  status: 'compliant' | 'warning' | 'critical' | 'unknown';
  complianceRate?: number;
  animate?: boolean;
}

export function NF203StatusBadge({ status, complianceRate, animate = true }: NF203StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'compliant':
        return {
          icon: CheckCircle2,
          label: 'Conforme',
          className: 'bg-green-500/10 text-green-600 border-green-500/20',
          iconClassName: 'text-green-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Attention',
          className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          iconClassName: 'text-yellow-600'
        };
      case 'critical':
        return {
          icon: XCircle,
          label: 'Non conforme',
          className: 'bg-red-500/10 text-red-600 border-red-500/20',
          iconClassName: 'text-red-600'
        };
      default:
        return {
          icon: Shield,
          label: 'En attente',
          className: 'bg-muted text-muted-foreground border-border',
          iconClassName: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
        config.className,
        animate && status === 'compliant' && 'animate-pulse'
      )}
    >
      <Icon className={cn('h-4 w-4', config.iconClassName)} />
      <span>{config.label}</span>
      {complianceRate !== undefined && (
        <span className="font-semibold">{complianceRate.toFixed(1)}%</span>
      )}
    </div>
  );
}
