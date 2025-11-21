import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShoppingCart, Package } from 'lucide-react';
import type { SimpleInventoryItem } from '@/hooks/useSimpleInventory';

interface StockAlertsProps {
  items: SimpleInventoryItem[];
  onQuickOrder: (itemId: string) => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ items, onQuickOrder }) => {
  const outOfStock = items.filter(item => item.current_stock === 0);
  const lowStock = items.filter(item => 
    item.current_stock > 0 && item.current_stock <= (item.minimum_stock || 0)
  );

  const getAlertLevel = (item: SimpleInventoryItem) => {
    if (item.current_stock === 0) {
      return { level: 'critical', label: 'Rupture de stock', variant: 'destructive' as const };
    }
    return { level: 'warning', label: 'Stock faible', variant: 'secondary' as const };
  };

  const allAlerts = [...outOfStock, ...lowStock];

  if (allAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-medium">Tout est en stock !</p>
            <p className="text-sm text-muted-foreground">
              Aucune alerte de stock pour le moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Alertes de stock ({allAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allAlerts.map((item) => {
            const alert = getAlertLevel(item);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-background"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant={alert.variant}>{alert.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.brand} {item.model} - SKU: {item.sku}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>
                      Stock actuel: <strong>{item.current_stock}</strong>
                    </span>
                    <span>
                      Stock minimum: <strong>{item.minimum_stock || 0}</strong>
                    </span>
                    {item.cost_price && (
                      <span>
                        Prix achat: <strong>{item.cost_price.toFixed(2)}€</strong>
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => onQuickOrder(item.id)}
                  size="sm"
                  className="ml-4"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Commander
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
