import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  size = 'md',
  isLoading = false
}) => {
  const colorClasses = {
    blue: 'text-admin-blue bg-admin-blue-light',
    green: 'text-admin-green bg-admin-green-light',
    purple: 'text-admin-purple bg-admin-purple-light',
    orange: 'text-admin-orange bg-admin-orange-light',
    pink: 'text-admin-pink bg-admin-pink-light',
    yellow: 'text-admin-yellow bg-admin-yellow-light'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  if (isLoading) {
    return (
      <Card className="admin-card-hover">
        <CardContent className={sizeClasses[size]}>
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 w-8 bg-muted rounded-lg"></div>
            </div>
            <div className="h-8 bg-muted rounded w-16 mb-2"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-card-hover border-0 shadow-sm">
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className={iconSizes[size]} />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className={`font-bold text-foreground ${valueSizes[size]}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {trend && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={trend.isPositive ? 'default' : 'destructive'}
                className="text-xs flex items-center gap-1"
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </Badge>
              <span className="text-xs text-muted-foreground">{trend.period}</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;