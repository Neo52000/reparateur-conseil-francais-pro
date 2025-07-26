import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Bell, Package, RefreshCw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StockAlert {
  id: string;
  item_name: string;
  item_sku: string;
  current_stock: number;
  minimum_stock: number;
  category: string;
  location: string;
  priority: 'critical' | 'medium' | 'low';
  suggested_order_quantity: number;
  last_restocked?: string;
}

const StockAlertsManager: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStockAlerts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .eq('repairer_id', user.id)
        .filter('current_stock', 'lte', 'minimum_stock')
        .eq('is_active', true)
        .order('current_stock', { ascending: true });

      if (error) throw error;

      const alertsData = (data || []).map(item => ({
        id: item.id,
        item_name: item.name,
        item_sku: item.sku,
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        category: item.category,
        location: item.location || 'Non défini',
        priority: getPriority(item.current_stock, item.minimum_stock),
        suggested_order_quantity: Math.max(item.maximum_stock - item.current_stock, item.minimum_stock * 2),
        last_restocked: item.updated_at
      }));

      setAlerts(alertsData);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      // Mode démo
      if (user?.email === 'demo@demo.fr') {
        setAlerts([
          {
            id: '1',
            item_name: 'Batterie Samsung S21',
            item_sku: 'BAT-SS21-001',
            current_stock: 2,
            minimum_stock: 5,
            category: 'Batteries',
            location: 'R-B-03',
            priority: 'critical',
            suggested_order_quantity: 10,
            last_restocked: '2024-01-10'
          },
          {
            id: '2',
            item_name: 'Écran iPhone 12',
            item_sku: 'SCR-IP12-001',
            current_stock: 4,
            minimum_stock: 5,
            category: 'Écrans',
            location: 'R-A-02',
            priority: 'medium',
            suggested_order_quantity: 8
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (current: number, minimum: number): 'critical' | 'medium' | 'low' => {
    if (current === 0) return 'critical';
    if (current <= minimum * 0.5) return 'critical';
    if (current <= minimum) return 'medium';
    return 'low';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Critique</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="gap-1"><Bell className="w-3 h-3" />Moyen</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Package className="w-3 h-3" />Bas</Badge>;
    }
  };

  const generateReorderSuggestion = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    toast({
      title: "Suggestion de commande",
      description: `${alert.item_name}: Commander ${alert.suggested_order_quantity} unités`,
      duration: 5000
    });
  };

  useEffect(() => {
    loadStockAlerts();
    
    // Actualiser les alertes toutes les 5 minutes
    const interval = setInterval(loadStockAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const criticalAlerts = alerts.filter(a => a.priority === 'critical');
  const mediumAlerts = alerts.filter(a => a.priority === 'medium');

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Alertes Critiques</p>
                <p className="text-2xl font-bold text-red-900">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">Alertes Moyennes</p>
                <p className="text-2xl font-bold text-orange-900">{mediumAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Total Alertes</p>
                <p className="text-2xl font-bold text-blue-900">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des alertes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes de Stock
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadStockAlerts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune alerte de stock détectée</p>
              <p className="text-sm">Tous vos produits sont correctement approvisionnés</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Stock Actuel</TableHead>
                    <TableHead>Stock Min.</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead>Suggestion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.priority === 'critical' ? 'bg-red-50' : ''}>
                      <TableCell>
                        {getPriorityBadge(alert.priority)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.item_name}</div>
                          <div className="text-sm text-muted-foreground">{alert.item_sku}</div>
                          <Badge variant="outline" className="text-xs mt-1">{alert.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${alert.current_stock === 0 ? 'text-red-600' : alert.current_stock <= alert.minimum_stock * 0.5 ? 'text-orange-600' : 'text-yellow-600'}`}>
                          {alert.current_stock}
                        </span>
                      </TableCell>
                      <TableCell>{alert.minimum_stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{alert.location}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-green-600">+{alert.suggested_order_quantity}</div>
                          <div className="text-muted-foreground">unités</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateReorderSuggestion(alert.id)}
                          className="text-xs"
                        >
                          Commander
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlertsManager;