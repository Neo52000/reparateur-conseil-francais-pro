import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Star, MapPin } from 'lucide-react';
import { usePlatformStats, formatStatForDisplay } from '@/hooks/usePlatformStats';
import { Skeleton } from '@/components/ui/skeleton';

const QuickStatsSection: React.FC = () => {
  const { data: stats, isLoading } = usePlatformStats();

  const quickStats = [
    {
      label: 'Réparateurs partenaires',
      value: stats ? formatStatForDisplay(stats.totalRepairers) : '...',
      icon: Smartphone,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      label: 'Avis clients',
      value: stats ? (stats.totalReviews > 0 ? formatStatForDisplay(stats.totalReviews) : '—') : '...',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50'
    },
    {
      label: 'Villes couvertes',
      value: stats ? formatStatForDisplay(stats.citiesCovered, 10) : '...',
      icon: MapPin,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  return (
    <section className="py-12 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center`}>
                    <IconComponent className={`h-8 w-8 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-9 w-20 mx-auto mb-2" />
                  ) : (
                    <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                  )}
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickStatsSection;
