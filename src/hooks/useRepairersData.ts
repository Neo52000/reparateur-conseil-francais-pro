
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  id: string;
  repairer_id: string;
  email: string;
  subscription_tier: string;
  billing_cycle: string;
  subscribed: boolean;
  subscription_end: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  plan_name: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
}

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

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

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_subscription_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      // Calculate subscription stats
      const total = data?.length || 0;
      const active = data?.filter(sub => sub.subscribed).length || 0;
      const monthlyRev = data?.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'monthly') {
          return sum + (sub.price_monthly || 0);
        }
        return sum;
      }, 0) || 0;
      const yearlyRev = data?.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'yearly') {
          return sum + (sub.price_yearly || 0);
        }
        return sum;
      }, 0) || 0;

      setStats(prev => ({
        ...prev,
        totalSubscriptions: total,
        activeSubscriptions: active,
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev
      }));

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchRepairers = async () => {
    try {
      // Mock data for repairers - in real app, this would come from a repairers table
      const mockRepairers: RepairerData[] = [
        {
          id: 'test-repairer-001',
          name: 'TechRepair Pro',
          email: 'tech@repair.fr',
          phone: '+33 1 23 45 67 89',
          city: 'Paris',
          subscription_tier: 'premium',
          subscribed: true,
          total_repairs: 156,
          rating: 4.9,
          created_at: '2023-01-15T10:00:00Z'
        },
        {
          id: 'test-repairer-002',
          name: 'Mobile Fix Express',
          email: 'contact@mobilefix.fr',
          phone: '+33 1 98 76 54 32',
          city: 'Lyon',
          subscription_tier: 'basic',
          subscribed: true,
          total_repairs: 89,
          rating: 4.5,
          created_at: '2023-02-20T14:30:00Z'
        },
        {
          id: 'test-repairer-003',
          name: 'Smartphone Clinic',
          email: 'info@smartphoneclinic.fr',
          phone: '+33 1 11 22 33 44',
          city: 'Marseille',
          subscription_tier: 'free',
          subscribed: false,
          total_repairs: 23,
          rating: 4.2,
          created_at: '2023-03-10T09:15:00Z'
        }
      ];

      setRepairers(mockRepairers);
      
      const totalRepairers = mockRepairers.length;
      const activeRepairers = mockRepairers.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));

    } catch (error) {
      console.error('Error fetching repairers:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSubscriptions(), fetchRepairers()]);
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
