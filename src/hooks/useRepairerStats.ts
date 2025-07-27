import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface RepairerStats {
  monthlyRevenue: number;
  pendingOrders: number;
  completedThisMonth: number;
  avgRepairTime: number;
  customerSatisfaction: number;
}

export const useRepairerStats = () => {
  const [stats, setStats] = useState<RepairerStats>({
    monthlyRevenue: 0,
    pendingOrders: 0,
    completedThisMonth: 0,
    avgRepairTime: 0,
    customerSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Obtenir le mois courant
      const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

      // Récupérer les statistiques du mois courant
      const { data: statsData, error: statsError } = await supabase
        .from('repairer_statistics')
        .select('*')
        .eq('repairer_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Calculer les statistiques depuis les orders et repair_orders existants
      const { data: repairOrders } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('repairer_id', user.id);

      const { data: posTransactions } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('repairer_id', user.id);

      // Calculer les stats en temps réel si pas de données sauvegardées
      let calculatedStats = {
        monthlyRevenue: 0,
        pendingOrders: 0,
        completedThisMonth: 0,
        avgRepairTime: 0,
        customerSatisfaction: 4.8 // Valeur par défaut
      };

      if (repairOrders) {
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const thisMonthOrders = repairOrders.filter(order => 
          new Date(order.created_at) >= currentMonthStart
        );

        calculatedStats.pendingOrders = repairOrders.filter(order => 
          ['pending', 'in_progress'].includes(order.status)
        ).length;

        calculatedStats.completedThisMonth = thisMonthOrders.filter(order => 
          order.status === 'completed'
        ).length;
      }

      if (posTransactions) {
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const thisMonthTransactions = posTransactions.filter(transaction => 
          new Date(transaction.transaction_date) >= currentMonthStart &&
          transaction.payment_status === 'completed'
        );

        calculatedStats.monthlyRevenue = thisMonthTransactions.reduce(
          (sum, transaction) => sum + (parseFloat(transaction.total_amount?.toString() || '0') || 0), 
          0
        );
      }

      // Utiliser les données sauvegardées si disponibles, sinon les données calculées
      const finalStats = statsData ? {
        monthlyRevenue: parseFloat(statsData.total_revenue?.toString() || '0') || calculatedStats.monthlyRevenue,
        pendingOrders: statsData.pending_orders || calculatedStats.pendingOrders,
        completedThisMonth: statsData.completed_repairs || calculatedStats.completedThisMonth,
        avgRepairTime: parseFloat(statsData.average_repair_time?.toString() || '0') || calculatedStats.avgRepairTime,
        customerSatisfaction: parseFloat(statsData.customer_satisfaction?.toString() || '0') || calculatedStats.customerSatisfaction
      } : calculatedStats;

      setStats(finalStats);

      // Sauvegarder/mettre à jour les statistiques calculées
      if (!statsData) {
        await supabase
          .from('repairer_statistics')
          .insert({
            repairer_id: user.id,
            month_year: currentMonth,
            total_revenue: finalStats.monthlyRevenue,
            pending_orders: finalStats.pendingOrders,
            completed_repairs: finalStats.completedThisMonth,
            average_repair_time: finalStats.avgRepairTime,
            customer_satisfaction: finalStats.customerSatisfaction
          });
      }

    } catch (error) {
      console.error('Error fetching repairer stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};