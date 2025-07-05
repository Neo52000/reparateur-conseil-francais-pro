import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Users, Activity, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface POSStats {
  totalTransactions: number;
  totalRevenue: number;
  activeRepairers: number;
  todayTransactions: number;
}

interface POSTransaction {
  id: string;
  repairer_id: string;
  transaction_number: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  repairer_name: string;
}

const AdminPOSManagement: React.FC = () => {
  const [stats, setStats] = useState<POSStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    activeRepairers: 0,
    todayTransactions: 0
  });
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      // Récupérer les réparateurs actifs avec module POS
      const { data: activeRepairersData } = await supabase
        .from('module_subscriptions')
        .select('repairer_id')
        .eq('module_type', 'pos')
        .eq('module_active', true);

      // Pour l'instant, utiliser des données simulées car les tables POS n'existent pas encore
      setStats({
        totalTransactions: 0,
        totalRevenue: 0,
        activeRepairers: activeRepairersData?.length || 0,
        todayTransactions: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats POS:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques POS",
        variant: "destructive"
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      // Pour l'instant, les tables POS n'existent pas encore
      // Utiliser des données vides
      setTransactions([]);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration POS</h1>
          <p className="text-muted-foreground">Gestion globale des systèmes de point de vente</p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions totales</p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CreditCard className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Réparateurs actifs</p>
              <p className="text-2xl font-bold">{stats.activeRepairers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions aujourd'hui</p>
              <p className="text-2xl font-bold">{stats.todayTransactions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions récentes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres globaux</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions POS récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{transaction.transaction_number}</p>
                          <p className="text-sm text-muted-foreground">{transaction.repairer_name}</p>
                        </div>
                        <Badge variant="outline">{transaction.payment_method}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{transaction.total_amount?.toFixed(2)}€</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune transaction trouvée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres POS globaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Configuration des modules POS</h3>
                  <p className="text-sm text-muted-foreground">
                    Les paramètres globaux des modules POS peuvent être configurés ici.
                    Cette section sera développée selon les besoins spécifiques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPOSManagement;