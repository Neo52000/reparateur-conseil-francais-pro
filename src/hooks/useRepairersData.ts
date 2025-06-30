
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
  totalRevenue: number;
  totalRepairers: number;
  activeRepairers: number;
  totalInterests: number;
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
    totalRevenue: 0,
    totalRepairers: 0,
    activeRepairers: 0,
    totalInterests: 0
  });
  const { toast } = useToast();

  const fetchInterestsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('client_interest_requests')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ useRepairersData - Error fetching interests count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ useRepairersData - Exception fetching interests:', error);
      return 0;
    }
  };

  const fetchRealRepairCount = async (repairerId: string): Promise<number> => {
    try {
      // Essayer de récupérer le nombre réel de réparations depuis différentes tables
      const [quotesResult, appointmentsResult, trackingResult] = await Promise.all([
        supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairerId)
          .eq('status', 'completed'),
        
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairerId)
          .eq('status', 'completed'),
        
        supabase
          .from('repair_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairerId)
          .eq('status', 'completed')
      ]);

      const completedQuotes = quotesResult.count || 0;
      const completedAppointments = appointmentsResult.count || 0;
      const completedTracking = trackingResult.count || 0;

      // Prendre le maximum des trois sources pour avoir une estimation réaliste
      const totalRepairs = Math.max(completedQuotes, completedAppointments, completedTracking);
      
      console.log(`📊 Real repair count for ${repairerId}:`, {
        quotes: completedQuotes,
        appointments: completedAppointments,
        tracking: completedTracking,
        total: totalRepairs
      });

      return totalRepairs;
    } catch (error) {
      console.error('❌ Error fetching real repair count:', error);
      return 0;
    }
  };

  const fetchRepairers = async () => {
    try {
      console.log('🔄 useRepairersData - Fetching repairers from main table...');
      
      // Récupérer DIRECTEMENT depuis la table repairers
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (repairersError) {
        console.error('❌ useRepairersData - Repairers fetch error:', repairersError);
        setRepairers([]);
        return;
      }

      console.log('✅ useRepairersData - Repairers loaded from main table:', repairersData?.length || 0);

      // Traiter les réparateurs avec de vraies données de réparations
      const processedRepairers: RepairerData[] = await Promise.all(
        (repairersData || []).map(async (repairer) => {
          const realRepairCount = await fetchRealRepairCount(repairer.id);
          
          return {
            id: repairer.id,
            name: repairer.name,
            email: repairer.email || 'Non renseigné',
            phone: repairer.phone || 'Non renseigné',
            city: repairer.city,
            department: repairer.department || repairer.postal_code?.substring(0, 2) || '00',
            subscription_tier: 'free', // Défaut
            subscribed: repairer.is_verified || false,
            total_repairs: realRepairCount, // UTILISER LES VRAIES DONNÉES
            rating: repairer.rating || 4.5,
            created_at: repairer.created_at
          };
        })
      );

      console.log('✅ useRepairersData - Processed repairers with real repair counts:', processedRepairers);
      setRepairers(processedRepairers);
      
      setStats(prev => ({
        ...prev,
        totalRepairers: processedRepairers.length,
        activeRepairers: processedRepairers.filter(r => r.subscribed).length
      }));

    } catch (error) {
      console.error('❌ useRepairersData - Error fetching repairers:', error);
      setRepairers([]);
      setStats(prev => ({
        ...prev,
        totalRepairers: 0,
        activeRepairers: 0
      }));
    }
  };

  const fetchSubscriptions = async () => {
    try {
      console.log('🔄 useRepairersData - Fetching all subscriptions...');
      
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

      console.log('✅ useRepairersData - Raw subscriptions data:', data);
      
      // Mapper les données avec gestion des plans spéciaux
      const mappedSubscriptions: SubscriptionData[] = (data || []).map(sub => {
        // Gestion spéciale pour demo@demo.fr
        let actualTier = sub.subscription_tier || 'free';
        if (sub.email === 'demo@demo.fr') {
          actualTier = 'enterprise'; // Forcer enterprise pour le compte demo
          console.log('🎯 useRepairersData - Setting demo@demo.fr to enterprise plan');
        }

        return {
          id: sub.id,
          repairer_id: sub.user_id || sub.repairer_id,
          email: sub.email,
          subscription_tier: actualTier,
          billing_cycle: sub.billing_cycle || 'monthly',
          subscribed: sub.subscribed || false,
          subscription_end: sub.subscription_end,
          created_at: sub.created_at,
          first_name: null,
          last_name: null,
          plan_name: actualTier,
          price_monthly: actualTier === 'basic' ? 29 : actualTier === 'premium' ? 79 : actualTier === 'enterprise' ? 199 : 0,
          price_yearly: actualTier === 'basic' ? 290 : actualTier === 'premium' ? 790 : actualTier === 'enterprise' ? 1990 : 0
        };
      });
      
      console.log('✅ useRepairersData - Mapped subscriptions:', mappedSubscriptions);
      setSubscriptions(mappedSubscriptions);
      
      // Calculer les stats
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

      const totalRev = monthlyRev + yearlyRev;

      setStats(prev => ({
        ...prev,
        totalSubscriptions: total,
        activeSubscriptions: active,
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev,
        totalRevenue: totalRev
      }));

    } catch (error) {
      console.error('❌ useRepairersData - Error fetching subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🚀 useRepairersData - Starting data fetch...');
      
      // Fetch interests count
      const interestsCount = await fetchInterestsCount();
      
      // Update stats with interests count
      setStats(prev => ({
        ...prev,
        totalInterests: interestsCount
      }));
      
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
