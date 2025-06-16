
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Star, MapPin } from 'lucide-react';

const QuickStatsSection: React.FC = () => {
  const quickStats = [
    { label: 'Réparateurs partenaires', value: '150+', icon: Smartphone },
    { label: 'Avis clients', value: '12,500+', icon: Star },
    { label: 'Villes couvertes', value: '85', icon: MapPin },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {quickStats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStatsSection;
