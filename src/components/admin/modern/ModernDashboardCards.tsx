import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Receipt, TrendingUp, Euro, ArrowUpRight, ArrowDownRight, 
  Activity, Clock, Shield, Zap, ExternalLink, Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStat {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'red' | 'indigo' | 'teal';
  progress?: number;
  actions?: {
    label: string;
    href: string;
  }[];
}

interface ModernDashboardCardsProps {
  stats?: DashboardStat[];
}

const defaultStats: DashboardStat[] = [
  {
    title: 'Réparateurs actifs',
    value: 247,
    change: { value: 12, period: 'ce mois', isPositive: true },
    icon: Users,
    color: 'blue',
    progress: 73,
    actions: [
      { label: 'Voir tout', href: '/admin?tab=repairers' },
      { label: 'Ajouter', href: '/admin?tab=repairers&action=add' }
    ]
  },
  {
    title: 'Devis en cours',
    value: 189,
    change: { value: 8, period: 'cette semaine', isPositive: true },
    icon: Receipt,
    color: 'green',
    progress: 85,
    actions: [
      { label: 'Gérer', href: '/admin?tab=quotes' }
    ]
  },
  {
    title: 'Revenus mensuels',
    value: '€12,847',
    change: { value: 15.3, period: 'vs mois dernier', isPositive: true },
    icon: Euro,
    color: 'purple',
    progress: 92,
    actions: [
      { label: 'Analytics', href: '/admin?tab=analytics' }
    ]
  },
  {
    title: 'Taux de conversion',
    value: '23.4%',
    change: { value: 2.1, period: 'cette semaine', isPositive: true },
    icon: TrendingUp,
    color: 'orange',
    progress: 67,
    actions: [
      { label: 'Optimiser', href: '/admin?tab=advertising' }
    ]
  },
  {
    title: 'Temps de réponse',
    value: '2.3h',
    change: { value: 0.5, period: 'amélioration', isPositive: true },
    icon: Clock,
    color: 'teal',
    progress: 88,
    actions: [
      { label: 'Monitoring', href: '/admin?tab=monitoring' }
    ]
  },
  {
    title: 'Sécurité',
    value: '99.9%',
    change: { value: 0.1, period: 'uptime', isPositive: true },
    icon: Shield,
    color: 'indigo',
    progress: 99,
    actions: [
      { label: 'Détails', href: '/admin?tab=monitoring' }
    ]
  }
];

const colorClasses = {
  blue: {
    bg: 'bg-admin-blue-light',
    icon: 'text-admin-blue',
    border: 'border-admin-blue/20',
    progress: 'bg-admin-blue'
  },
  green: {
    bg: 'bg-admin-green-light',
    icon: 'text-admin-green', 
    border: 'border-admin-green/20',
    progress: 'bg-admin-green'
  },
  purple: {
    bg: 'bg-admin-purple-light',
    icon: 'text-admin-purple',
    border: 'border-admin-purple/20', 
    progress: 'bg-admin-purple'
  },
  orange: {
    bg: 'bg-admin-orange-light',
    icon: 'text-admin-orange',
    border: 'border-admin-orange/20',
    progress: 'bg-admin-orange'
  },
  pink: {
    bg: 'bg-admin-pink-light',
    icon: 'text-admin-pink',
    border: 'border-admin-pink/20',
    progress: 'bg-admin-pink'
  },
  yellow: {
    bg: 'bg-admin-yellow-light', 
    icon: 'text-admin-yellow',
    border: 'border-admin-yellow/20',
    progress: 'bg-admin-yellow'
  },
  red: {
    bg: 'bg-admin-red-light',
    icon: 'text-admin-red',
    border: 'border-admin-red/20',
    progress: 'bg-admin-red'
  },
  indigo: {
    bg: 'bg-admin-indigo-light',
    icon: 'text-admin-indigo',
    border: 'border-admin-indigo/20',
    progress: 'bg-admin-indigo'
  },
  teal: {
    bg: 'bg-admin-teal-light',
    icon: 'text-admin-teal',
    border: 'border-admin-teal/20',
    progress: 'bg-admin-teal'
  }
};

const ModernDashboardCards: React.FC<ModernDashboardCardsProps> = ({ 
  stats = defaultStats 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        
        return (
          <Card 
            key={index} 
            className={cn(
              "relative overflow-hidden hover-lift transition-all duration-200 border-l-4",
              colors.border
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", colors.bg)}>
                <Icon className={cn("h-4 w-4", colors.icon)} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Value & Change */}
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                
                {stat.change && (
                  <div className="flex items-center gap-1">
                    {stat.change.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-admin-green" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-admin-red" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      stat.change.isPositive ? "text-admin-green" : "text-admin-red"
                    )}>
                      {stat.change.isPositive ? '+' : '-'}{Math.abs(stat.change.value)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.change.period}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {stat.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{stat.progress}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-1.5" />
                </div>
              )}

              {/* Actions */}
              {stat.actions && stat.actions.length > 0 && (
                <div className="flex gap-2 pt-2">
                  {stat.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      asChild
                    >
                      <a href={action.href} className="flex items-center gap-1">
                        {action.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Decorative Background */}
            <div className={cn(
              "absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-10 translate-x-10",
              colors.progress
            )} />
          </Card>
        );
      })}
    </div>
  );
};

export default ModernDashboardCards;