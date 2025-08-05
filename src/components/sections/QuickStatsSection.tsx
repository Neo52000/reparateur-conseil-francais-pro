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
  return;
};
export default QuickStatsSection;