import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const ClientReviewsTab = () => {
  const [reviewsLoading] = useState(false);

  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interface d'avis simplifiée pour la production */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Mes avis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun avis pour le moment</p>
            <p className="text-sm mt-2">Vos avis sur les réparations apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientReviewsTab;