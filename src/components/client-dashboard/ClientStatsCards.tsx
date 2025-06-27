
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CreditCard, Star } from 'lucide-react';

interface ClientStatsCardsProps {
  stats: {
    totalRepairs: number;
    totalSpent: number;
    loyaltyPoints: number;
    avgRating: number;
  };
}

const ClientStatsCards: React.FC<ClientStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Réparations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRepairs}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total dépensé</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSpent}€</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points fidélité</p>
              <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStatsCards;
