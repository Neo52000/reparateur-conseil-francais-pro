import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  Package,
  Euro,
  Users,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  category: 'stock' | 'revenue' | 'performance' | 'opportunity';
  title: string;
  message: string;
  action?: string;
  icon: React.ReactNode;
  priority: number;
  data?: any;
}

const IntelligentAlerts = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    generateIntelligentAlerts();
  }, [user]);

  const generateIntelligentAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer les métriques business
      const { data: metrics } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('repairer_id', user.id);

      // Récupérer les données de stock POS
      const { data: inventory } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .eq('repairer_id', user.id);

      // Récupérer les transactions récentes
      const { data: transactions } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('repairer_id', user.id)
        .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('transaction_date', { ascending: false });

      const generatedAlerts: SmartAlert[] = [];

      // Analyse stock critique
      if (inventory) {
        const lowStockItems = inventory.filter(item => 
          item.current_stock <= item.minimum_stock && item.current_stock > 0
        );
        const outOfStockItems = inventory.filter(item => item.current_stock === 0);

        if (outOfStockItems.length > 0) {
          generatedAlerts.push({
            id: 'stock-out',
            type: 'urgent',
            category: 'stock',
            title: `${outOfStockItems.length} produit(s) en rupture`,
            message: `${outOfStockItems.map(item => item.name).join(', ')} - Réapprovisionnement urgent nécessaire`,
            action: 'Gérer le stock',
            icon: <Package className="h-4 w-4" />,
            priority: 1,
            data: outOfStockItems
          });
        }

        if (lowStockItems.length > 0) {
          generatedAlerts.push({
            id: 'stock-low',
            type: 'warning',
            category: 'stock',
            title: `${lowStockItems.length} produit(s) bientôt en rupture`,
            message: `Stock faible sur: ${lowStockItems.map(item => item.name).slice(0, 3).join(', ')}`,
            action: 'Voir détails',
            icon: <AlertTriangle className="h-4 w-4" />,
            priority: 2,
            data: lowStockItems
          });
        }
      }

      // Analyse des revenus
      if (transactions && transactions.length > 0) {
        const thisWeekRevenue = transactions
          .filter(t => new Date(t.transaction_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => sum + (t.total_amount || 0), 0);

        const lastWeekRevenue = transactions
          .filter(t => {
            const date = new Date(t.transaction_date);
            return date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && 
                   date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          })
          .reduce((sum, t) => sum + (t.total_amount || 0), 0);

        const revenueChange = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;

        if (revenueChange > 20) {
          generatedAlerts.push({
            id: 'revenue-up',
            type: 'success',
            category: 'revenue',
            title: `🔥 CA en hausse de ${revenueChange.toFixed(1)}%`,
            message: `Excellent ! Votre chiffre d'affaires cette semaine: ${thisWeekRevenue.toFixed(2)}€`,
            icon: <TrendingUp className="h-4 w-4" />,
            priority: 3
          });
        } else if (revenueChange < -15) {
          generatedAlerts.push({
            id: 'revenue-down',
            type: 'warning',
            category: 'revenue',
            title: `⚠️ CA en baisse de ${Math.abs(revenueChange).toFixed(1)}%`,
            message: `Pensez à lancer une promotion ou contacter vos clients réguliers`,
            action: 'Créer une campagne',
            icon: <TrendingDown className="h-4 w-4" />,
            priority: 2
          });
        }

        // Analyse panier moyen
        const avgBasket = thisWeekRevenue / Math.max(transactions.length, 1);
        if (avgBasket < 50) {
          generatedAlerts.push({
            id: 'basket-low',
            type: 'info',
            category: 'opportunity',
            title: 'Panier moyen faible',
            message: `Panier moyen: ${avgBasket.toFixed(2)}€. Proposez des services complémentaires ?`,
            action: 'Voir suggestions',
            icon: <Lightbulb className="h-4 w-4" />,
            priority: 4
          });
        }
      }

      // Alertes par défaut si pas de données
      if (generatedAlerts.length === 0) {
        generatedAlerts.push(
          {
            id: 'welcome',
            type: 'info',
            category: 'opportunity',
            title: 'Bienvenue sur votre dashboard intelligent',
            message: 'Commencez à utiliser le POS pour recevoir des insights personnalisés',
            icon: <Info className="h-4 w-4" />,
            priority: 5
          },
          {
            id: 'setup-inventory',
            type: 'info',
            category: 'opportunity',
            title: 'Configurez votre inventaire',
            message: 'Ajoutez vos produits pour un suivi automatique des stocks',
            action: 'Configurer',
            icon: <Package className="h-4 w-4" />,
            priority: 6
          }
        );
      }

      setAlerts(generatedAlerts.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      console.error('Erreur génération alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyle = (type: SmartAlert['type']) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getBadgeVariant = (category: SmartAlert['category']) => {
    switch (category) {
      case 'stock': return 'destructive';
      case 'revenue': return 'default';
      case 'performance': return 'secondary';
      case 'opportunity': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Alertes Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Alertes Intelligentes
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map(alert => (
          <Alert key={alert.id} className={getAlertStyle(alert.type)}>
            <div className="flex items-start gap-3">
              {alert.icon}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant={getBadgeVariant(alert.category)}>
                    {alert.category}
                  </Badge>
                </div>
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                {alert.action && (
                  <button className="text-sm text-primary hover:underline font-medium">
                    {alert.action} →
                  </button>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default IntelligentAlerts;