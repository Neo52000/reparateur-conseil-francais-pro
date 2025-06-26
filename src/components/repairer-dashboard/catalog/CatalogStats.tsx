
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Eye, TrendingUp, Zap } from 'lucide-react';

interface CatalogStatsProps {
  stats: {
    totalBrands?: number;
    totalModels?: number;
    totalBasePrices?: number;
    customPricesCount?: number;
    activeBrands?: number;
    inactiveBrands?: number;
  };
}

const CatalogStats: React.FC<CatalogStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marques</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBrands || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeBrands || 0} actives, {stats.inactiveBrands || 0} désactivées
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modèles</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalModels || 0}</div>
          <p className="text-xs text-muted-foreground">
            Appareils disponibles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix du catalogue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBasePrices || 0}</div>
          <p className="text-xs text-muted-foregreen">
            Prix de référence
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix personnalisés</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.customPricesCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Vos tarifs personnalisés
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogStats;
