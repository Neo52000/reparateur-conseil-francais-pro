import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Star, 
  Crown, 
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type RepairerLevel = 0 | 1 | 2 | 3;

interface RepairerLevelBadgeProps {
  level: RepairerLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const levelConfig: Record<RepairerLevel, {
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  className: string;
  description: string;
}> = {
  0: {
    label: 'Fiche non revendiquée',
    shortLabel: 'Non revendiqué',
    icon: Shield,
    className: 'bg-muted text-muted-foreground border-muted',
    description: 'Cette fiche n\'a pas encore été revendiquée par son propriétaire'
  },
  1: {
    label: 'Profil Gratuit',
    shortLabel: 'Gratuit',
    icon: CheckCircle,
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Profil vérifié avec les fonctionnalités de base'
  },
  2: {
    label: 'Profil Premium',
    shortLabel: 'Premium',
    icon: Star,
    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Profil optimisé avec toutes les fonctionnalités avancées'
  },
  3: {
    label: 'Partenaire Exclusif',
    shortLabel: 'Exclusif',
    icon: Crown,
    className: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Partenaire exclusif sur sa zone géographique'
  }
};

const RepairerLevelBadge: React.FC<RepairerLevelBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
  className
}) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        config.className,
        sizeClasses[size],
        level === 3 && 'animate-pulse',
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span>{size === 'sm' ? config.shortLabel : config.label}</span>
      )}
      {level === 3 && <Sparkles className={cn(iconSizes[size], 'ml-0.5')} />}
    </Badge>
  );
};

export { RepairerLevelBadge, levelConfig };
export default RepairerLevelBadge;
