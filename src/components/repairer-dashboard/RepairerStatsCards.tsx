import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Euro, Clock, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend, suffix = '' }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-status-success' : 'text-destructive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <motion.p
                  key={value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-foreground"
                >
                  {value}{suffix}
                </motion.p>
                {change !== undefined && (
                  <span className={`flex items-center text-sm font-medium ${trendColor}`}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    {Math.abs(change)}%
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4 p-3 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface RepairerStatsCardsProps {
  stats: {
    monthlyRevenue: number;
    pendingOrders: number;
    completedThisMonth: number;
    avgRating: number;
  };
}

export const RepairerStatsCards: React.FC<RepairerStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="CA mensuel"
        value={stats.monthlyRevenue}
        change={12.5}
        trend="up"
        icon={Euro}
        suffix="€"
      />
      <StatCard
        title="Commandes en attente"
        value={stats.pendingOrders}
        icon={Clock}
      />
      <StatCard
        title="Réparations ce mois"
        value={stats.completedThisMonth}
        change={8.3}
        trend="up"
        icon={CheckCircle}
      />
      <StatCard
        title="Note moyenne"
        value={stats.avgRating.toFixed(1)}
        change={2.1}
        trend="up"
        icon={Star}
        suffix="/5"
      />
    </div>
  );
};
