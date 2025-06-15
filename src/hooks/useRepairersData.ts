
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchSubscriptions, 
  calculateSubscriptionStats, 
  SubscriptionData 
} from '@/services/subscriptionDataService';
import { 
  fetchRepairersData, 
  getMockRepairersData, 
  RepairerData 
} from '@/services/repairersDataService';

interface Stats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRepairers: number;
  activeRepairers: number;
}

export const useRepairersData = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [repairers, setRepairers] = useState<RepairerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRepairers: 0,
    activeRepairers: 0
  });
  const { toast } = useToast();

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
      
      const subscriptionStats = calculateSubscriptionStats(data);
      setStats(prev => ({ ...prev, ...subscriptionStats }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const loadRepairers = async () => {
    try {
      const processedRepairers = await fetchRepairersData();
      setRepairers(processedRepairers);
      
      const totalRepairers = processedRepairers.length;
      const activeRepairers = processedRepairers.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));
    } catch (error) {
      console.error('Error fetching repairers:', error);
      
      // En cas d'erreur, utiliser des données mockées de fallback
      const mockRepairers = getMockRepairersData();
      setRepairers(mockRepairers);
      
      const totalRepairers = mockRepairers.length;
      const activeRepairers = mockRepairers.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadSubscriptions(), loadRepairers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    subscriptions,
    repairers,
    loading,
    stats,
    fetchData
  };
};
