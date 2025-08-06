
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { RepairPrice } from '@/types/catalog';

interface RepairPricesStatsProps {
  repairPrices: RepairPrice[];
}

const RepairPricesStats: React.FC<RepairPricesStatsProps> = ({ repairPrices }) => {
  const priceStats = {
    total: repairPrices.length,
    avgPrice: repairPrices.length > 0 
      ? repairPrices.reduce((sum, price) => sum + price.price_eur, 0) / repairPrices.length 
      : 0,
    minPrice: repairPrices.length > 0 
      ? Math.min(...repairPrices.map(price => price.price_eur)) 
      : 0,
    maxPrice: repairPrices.length > 0 
      ? Math.max(...repairPrices.map(price => price.price_eur)) 
      : 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix configurés</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{priceStats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foregreen" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{priceStats.avgPrice.toFixed(2)}€</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix minimum</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{priceStats.minPrice.toFixed(2)}€</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prix maximum</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{priceStats.maxPrice.toFixed(2)}€</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairPricesStats;
