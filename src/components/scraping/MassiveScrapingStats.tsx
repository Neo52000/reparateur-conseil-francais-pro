
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, RefreshCw, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface MassiveScrapingStatsProps {
  totalAdded: number;
  totalUpdated: number;
  totalProcessed: number;
  totalPappersVerified?: number;
  totalPappersRejected?: number;
}

const MassiveScrapingStats = ({ 
  totalAdded, 
  totalUpdated, 
  totalProcessed,
  totalPappersVerified = 0,
  totalPappersRejected = 0
}: MassiveScrapingStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vérifiés Gouv</p>
              <p className="text-3xl font-bold text-indigo-600">{totalPappersVerified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-indigo-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fermées rejetées</p>
              <p className="text-3xl font-bold text-red-600">{totalPappersRejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MassiveScrapingStats;
