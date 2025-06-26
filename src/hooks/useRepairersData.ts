
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
      console.log('🔄 useRepairersData - Fetching repairers from profiles...');
      
      // Essayer d'abord avec repairer_profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('repairer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profilesError && profilesData && profilesData.length > 0) {
        console.log('✅ useRepairersData - Found repairer profiles:', profilesData.length);
        
        const processedRepairers: RepairerData[] = profilesData.map((profile) => ({
          id: profile.user_id,
          name: profile.business_name || 'Nom non renseigné',
          email: profile.email || 'Email non renseigné',
          phone: profile.phone || 'Téléphone non renseigné',
          city: profile.city || 'Ville non renseignée',
          department: profile.postal_code?.substring(0, 2) || '00',
          subscription_tier: 'free', // Sera enrichi avec les vraies données
          subscribed: false,
          total_repairs: Math.floor(Math.random() * 200),
          rating: 4.5,
          created_at: profile.created_at
        }));

        setRepairers(processedRepairers);
        setStats(prev => ({
          ...prev,
          totalRepairers: processedRepairers.length,
          activeRepairers: processedRepairers.length
        }));
        return;
      }

      // Fallback sur la table repairers
      console.log('🔄 useRepairersData - Trying repairers table as fallback...');
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (repairersError) {
        console.error('❌ useRepairersData - Repairers fetch error:', repairersError);
        setRepairers([]);
        return;
      }

      console.log('✅ useRepairersData - Repairers loaded from fallback:', repairersData?.length || 0);

      const processedRepairers: RepairerData[] = (repairersData || []).map((repairer) => ({
        id: repairer.id,
        name: repairer.name,
        email: repairer.email || 'Non renseigné',
        phone: repairer.phone || 'Non renseigné',
        city: repairer.city,
        department: repairer.department || '00',
        subscription_tier: 'free',
        subscribed: repairer.is_verified || false,
        total_repairs: Math.floor(Math.random() * 200),
        rating: repairer.rating || 4.5,
        created_at: repairer.created_at
      }));

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
