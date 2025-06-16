
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Star, MapPin } from 'lucide-react';

const QuickStatsSection: React.FC = () => {
  const quickStats = [
    { 
      label: 'Réparateurs partenaires', 
      value: '150+', 
      icon: Smartphone,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      label: 'Avis clients', 
      value: '12,500+', 
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50'
    },
    { 
      label: 'Villes couvertes', 
      value: '85', 
      icon: MapPin,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {quickStats.map((stat, index) => (
        <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-30 group-hover:opacity-40 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 leading-none">{stat.value}</p>
              </div>
              
              {/* Icon with gradient background */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
            </div>
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStatsSection;
