import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Star, MapPin } from 'lucide-react';
const QuickStatsSection: React.FC = () => {
  const quickStats = [{
    label: 'Réparateurs partenaires',
    value: '150+',
    icon: Smartphone,
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  }, {
    label: 'Avis clients',
    value: '12,500+',
    icon: Star,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-50 to-orange-50'
  }, {
    label: 'Villes couvertes',
    value: '85',
    icon: MapPin,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50'
  }];
  return (
    <section className="py-12 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
                <CardContent className={`p-6 bg-gradient-to-br ${stat.bgGradient}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
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