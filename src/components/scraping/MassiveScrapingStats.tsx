
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, RefreshCw, MapPin } from 'lucide-react';

interface MassiveScrapingStatsProps {
  totalAdded: number;
  totalUpdated: number;
  totalProcessed: number;
}

const MassiveScrapingStats = ({ totalAdded, totalUpdated, totalProcessed }: MassiveScrapingStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Réparateurs ajoutés</p>
              <p className="text-3xl font-bold text-green-600">{totalAdded}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mis à jour</p>
              <p className="text-3xl font-bold text-blue-600">{totalUpdated}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total traité</p>
              <p className="text-3xl font-bold text-purple-600">{totalProcessed}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassiveScrapingStats;
