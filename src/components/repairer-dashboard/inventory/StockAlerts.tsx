
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ShoppingCart, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface StockAlert {
  id: string;
  part_name: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  cost_per_unit: number;
  supplier: string;
  last_order_date: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface PredictionData {
  part_name: string;
  predicted_need: number;
  days_until_shortage: number;
  suggested_order_quantity: number;
}

const StockAlerts: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);

  useEffect(() => {
    if (profile?.id) {
      loadStockAlerts();
    }
  }, [profile?.id]);

  const loadStockAlerts = async () => {
    try {
      setLoading(true);
      
      // Pour la démo, nous utilisons des données mockées
      // Dans un vrai système, cela viendrait de la base de données
      const mockAlerts: StockAlert[] = [
        {
          id: '1',
          part_name: 'Écran iPhone 14 Pro',
          current_stock: 2,
          min_stock: 5,
          max_stock: 20,
          cost_per_unit: 150,
          supplier: 'MobileParts Pro',
          last_order_date: '2024-01-15',
          urgency: 'high'
        },
        {
          id: '2',
          part_name: 'Batterie Samsung Galaxy S23',
          current_stock: 1,
          min_stock: 3,
          max_stock: 15,
          cost_per_unit: 65,
          supplier: 'TechSupply',
          last_order_date: '2024-01-10',
          urgency: 'critical'
        },
        {
          id: '3',
          part_name: 'Connecteur Lightning',
          current_stock: 8,
          min_stock: 10,
          max_stock: 50,
          cost_per_unit: 25,
          supplier: 'QuickFix Parts',
          last_order_date: '2024-01-20',
          urgency: 'medium'
        },
      ];

      const mockPredictions: PredictionData[] = [
        {
          part_name: 'Écran iPhone 13',
          predicted_need: 5,
          days_until_shortage: 7,
          suggested_order_quantity: 10
        },
        {
          part_name: 'Vitre Xiaomi Mi 11',
          predicted_need: 3,
          days_until_shortage: 14,
          suggested_order_quantity: 8
        },
      ];

      setAlerts(mockAlerts);
      setPredictions(mockPredictions);
      
    } catch (error) {
      console.error('Erreur chargement alertes stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    return <AlertTriangle className={`h-4 w-4 ${
      urgency === 'critical' ? 'text-red-500' : 
      urgency === 'high' ? 'text-orange-500' : 
      urgency === 'medium' ? 'text-yellow-500' : 
      'text-green-500'
    }`} />;
  };

  const handleQuickOrder = (alert: StockAlert) => {
    // Logique pour commander rapidement
    console.log('Commande rapide pour:', alert.part_name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes de stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertes de stock ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getUrgencyIcon(alert.urgency)}
                    <div>
                      <h4 className="font-semibold">{alert.part_name}</h4>
                      <p className="text-sm text-gray-600">
                        Stock actuel: {alert.current_stock} / Min: {alert.min_stock}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fournisseur: {alert.supplier} • {alert.cost_per_unit}€/unité
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getUrgencyColor(alert.urgency)}>
                      {alert.urgency.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleQuickOrder(alert)}
                      className="flex items-center gap-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Commander
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prédictions IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            Prédictions de stock IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">{prediction.part_name}</h4>
                    <p className="text-sm text-blue-700">
                      Rupture prévue dans {prediction.days_until_shortage} jours
                    </p>
                    <p className="text-xs text-blue-600">
                      Besoin estimé: {prediction.predicted_need} unités
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">
                      Commande suggérée: {prediction.suggested_order_quantity} unités
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Package className="h-4 w-4 mr-1" />
                      Planifier
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résumé des actions recommandées */}
      <Card>
        <CardHeader>
          <CardTitle>Actions recommandées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-red-800">
                {alerts.filter(a => a.urgency === 'critical').length} pièces en rupture critique
              </span>
              <Button size="sm" variant="destructive">
                Commander d'urgence
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-800">
                {alerts.filter(a => a.urgency === 'high').length} pièces à commander rapidement
              </span>
              <Button size="sm" variant="outline">
                Programmer commandes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlerts;
