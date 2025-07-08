import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

// Phase 10: Analytics et métriques avancées
const EcommerceAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 15420.50,
    totalOrders: 89,
    totalCustomers: 67,
    averageOrderValue: 173.26
  });

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {prefix}{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}{suffix}
              </p>
              {change && (
                <Badge variant={change > 0 ? "default" : "secondary"} className="flex items-center gap-1">
                  {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(change)}%
                </Badge>
              )}
            </div>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics E-commerce</h2>
        <p className="text-muted-foreground">Suivez les performances de votre boutique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'affaires"
          value={analytics.totalRevenue}
          change={12.5}
          icon={DollarSign}
          suffix="€"
        />
        <StatCard
          title="Commandes"
          value={analytics.totalOrders}
          change={8.2}
          icon={ShoppingCart}
        />
        <StatCard
          title="Clients"
          value={analytics.totalCustomers}
          change={-2.1}
          icon={Users}
        />
        <StatCard
          title="Panier moyen"
          value={analytics.averageOrderValue}
          change={4.7}
          icon={Package}
          suffix="€"
        />
      </div>
    </div>
  );
};

export default EcommerceAnalytics;