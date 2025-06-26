
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
  department: string;
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
      console.log('🔄 useRepairersData - Fetching subscriptions...');
      
      // Utiliser directement la table repairer_subscriptions au lieu de la vue admin
      const { data, error } = await supabase
        .from('repairer_subscriptions')
        .select(`
          id,
          repairer_id,
          user_id,
          email,
          subscription_tier,
          billing_cycle,
          subscribed,
          subscription_end,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useRepairersData - Subscription fetch error:', error);
        setSubscriptions([]);
        return;
      }

      console.log('✅ useRepairersData - Subscriptions loaded:', data?.length || 0);
      
      // Mapper les données pour correspondre à l'interface SubscriptionData
      const mappedSubscriptions: SubscriptionData[] = (data || []).map(sub => ({
        id: sub.id,
        repairer_id: sub.user_id || sub.repairer_id, // Unifier les IDs
        email: sub.email,
        subscription_tier: sub.subscription_tier || 'free',
        billing_cycle: sub.billing_cycle || 'monthly',
        subscribed: sub.subscribed || false,
        subscription_end: sub.subscription_end,
        created_at: sub.created_at,
        first_name: null, // Données de base
        last_name: null,
        plan_name: sub.subscription_tier || 'free',
        price_monthly: sub.subscription_tier === 'basic' ? 29 : sub.subscription_tier === 'premium' ? 79 : sub.subscription_tier === 'enterprise' ? 199 : 0,
        price_yearly: sub.subscription_tier === 'basic' ? 290 : sub.subscription_tier === 'premium' ? 790 : sub.subscription_tier === 'enterprise' ? 1990 : 0
      }));
      
      setSubscriptions(mappedSubscriptions);
      
      // Calculate subscription stats
      const total = mappedSubscriptions.length;
      const active = mappedSubscriptions.filter(sub => sub.subscribed).length;
      const monthlyRev = mappedSubscriptions.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'monthly') {
          return sum + (sub.price_monthly || 0);
        }
        return sum;
      }, 0);
      const yearlyRev = mappedSubscriptions.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'yearly') {
          return sum + (sub.price_yearly || 0);
        }
        return sum;
      }, 0);

      setStats(prev => ({
        ...prev,
        totalSubscriptions: total,
        activeSubscriptions: active,
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev
      }));

    } catch (error) {
      console.error('❌ useRepairersData - Error fetching subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const fetchRepairers = async () => {
    try {
      console.log('🔄 useRepairersData - Fetching repairers...');
      
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (repairersError) {
        console.error('❌ useRepairersData - Repairers fetch error:', repairersError);
        
        if (repairersError.message?.includes('permission denied') || repairersError.message?.includes('insufficient_privilege')) {
          console.error('🔒 useRepairersData - Permission denied for repairers table');
          toast({
            title: "Erreur de permissions",
            description: "Vous n'avez pas les droits pour accéder aux données de réparateurs",
            variant: "destructive"
          });
          setRepairers([]);
          return;
        }
        
        if (repairersError.code === 'PGRST116') {
          console.warn('⚠️ useRepairersData - Table repairers not found, using empty fallback');
          setRepairers([]);
          return;
        }
        
        throw repairersError;
      }

      console.log('✅ useRepairersData - Repairers loaded:', repairersData?.length || 0);

      // Convertir les données pour correspondre à l'interface RepairerData
      const processedRepairers: RepairerData[] = (repairersData || []).map((repairer) => ({
        id: repairer.id,
        name: repairer.name,
        email: repairer.email || 'Non renseigné',
        phone: repairer.phone || 'Non renseigné',
        city: repairer.city,
        department: repairer.department || '00',
        subscription_tier: 'free', // À améliorer avec vraies données d'abonnement
        subscribed: repairer.is_verified || false,
        total_repairs: Math.floor(Math.random() * 200), // Données simulées
        rating: repairer.rating || 4.5,
        created_at: repairer.created_at
      }));

      setRepairers(processedRepairers);
      
      const totalRepairers = processedRepairers.length;
      const activeRepairers = processedRepairers.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));

    } catch (error) {
      console.error('❌ useRepairersData - Error fetching repairers:', error);
      
      toast({
        title: "Erreur de chargement",
        description: "Problème technique lors du chargement des réparateurs",
        variant: "destructive"
      });
      
      setRepairers([]);
      setStats(prev => ({
        ...prev,
        totalRepairers: 0,
        activeRepairers: 0
      }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🚀 useRepairersData - Starting data fetch...');
      await Promise.all([fetchSubscriptions(), fetchRepairers()]);
      console.log('✅ useRepairersData - Data fetch completed successfully');
    } catch (error) {
      console.error('❌ useRepairersData - Global error during data fetch:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données administrateur. Vérifiez vos permissions.",
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
