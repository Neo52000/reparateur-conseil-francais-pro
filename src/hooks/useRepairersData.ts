
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchAllRepairers, PaginationProgress } from '@/services/supabase/paginate';
import { detectEnseigne } from '@/constants/enseignes';

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
  region: string;
  department: string;
  postal_code: string;
  address: string;
  subscription_tier: string;
  subscribed: boolean;
  is_active: boolean;
  total_repairs: number;
  rating: number | null;
  created_at: string;
  category_name?: string;
  category_color?: string;
  lat: number | null;
  lng: number | null;
  has_qualirepar_label?: boolean;
  detected_enseigne?: string;
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
  repairersWithGps: number;
}

export const useRepairersData = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [repairers, setRepairers] = useState<RepairerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<PaginationProgress | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRevenue: 0,
    totalRepairers: 0,
    activeRepairers: 0,
    totalInterests: 0,
    repairersWithGps: 0
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

  const fetchRepairers = useCallback(async () => {
    try {
      console.log('🔄 useRepairersData - Fetching ALL repairers with pagination...');
      
      // Utiliser la pagination pour récupérer TOUS les réparateurs
      const { data: repairersData, error, total } = await fetchAllRepairers((progress) => {
        setLoadingProgress(progress);
        console.log(`📊 Loading progress: ${progress.loaded}/${progress.total || '?'}`);
      });

      if (error) {
        console.error('❌ useRepairersData - Repairers fetch error:', error);
        setRepairers([]);
        return;
      }

      console.log(`✅ useRepairersData - Loaded ${repairersData.length} repairers (total: ${total})`);

      // Compter les réparateurs avec GPS
      const repairersWithGps = repairersData.filter(r => r.lat != null && r.lng != null).length;

      // Récupérer les labels QualiRépar depuis repairer_profiles
      const repairerIds = repairersData.map(r => r.id);
      let qualiReparMap: Record<string, boolean> = {};
      
      // Récupérer par batch pour éviter les limites d'URL
      const batchSize = 100;
      for (let i = 0; i < repairerIds.length; i += batchSize) {
        const batch = repairerIds.slice(i, i + batchSize);
        const { data: profilesData } = await supabase
          .from('repairer_profiles')
          .select('id, has_qualirepar_label')
          .in('id', batch);
        
        if (profilesData) {
          profilesData.forEach(p => {
            if (p.has_qualirepar_label) {
              qualiReparMap[p.id] = true;
            }
          });
        }
      }

      // Traiter les réparateurs SANS valeurs fictives
      const processedRepairers: RepairerData[] = repairersData.map((repairer) => ({
        id: repairer.id,
        name: repairer.name,
        email: repairer.email || '',
        phone: repairer.phone || '',
        city: repairer.city || '',
        region: repairer.region || '',
        department: repairer.department || repairer.postal_code?.substring(0, 2) || '',
        postal_code: repairer.postal_code || '',
        address: repairer.address || '',
        subscription_tier: 'free',
        subscribed: repairer.is_verified || false,
        is_active: repairer.is_verified || false,
        total_repairs: 0, // Sera calculé à la demande dans le profil
        rating: repairer.rating ?? null, // Pas de valeur par défaut !
        created_at: repairer.created_at,
        category_name: repairer.business_categories?.name || 'Non catégorisé',
        category_color: repairer.business_categories?.color || '#6b7280',
        lat: repairer.lat ?? null,
        lng: repairer.lng ?? null,
        has_qualirepar_label: qualiReparMap[repairer.id] || false,
        detected_enseigne: detectEnseigne(repairer.name)
      }));

      setRepairers(processedRepairers);
      
      setStats(prev => ({
        ...prev,
        totalRepairers: processedRepairers.length,
        activeRepairers: processedRepairers.filter(r => r.subscribed).length,
        repairersWithGps
      }));

      setLoadingProgress(null);

    } catch (error) {
      console.error('❌ useRepairersData - Error fetching repairers:', error);
      setRepairers([]);
      setStats(prev => ({
        ...prev,
        totalRepairers: 0,
        activeRepairers: 0,
        repairersWithGps: 0
      }));
    }
  }, []);

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

      console.log('✅ useRepairersData - Raw subscriptions data:', data?.length || 0);
      
      const mappedSubscriptions: SubscriptionData[] = (data || []).map(sub => {
        let actualTier = sub.subscription_tier || 'free';

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
      
      setSubscriptions(mappedSubscriptions);
      
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🚀 useRepairersData - Starting data fetch...');
      
      const interestsCount = await fetchInterestsCount();
      
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
  }, [fetchRepairers, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    subscriptions,
    repairers,
    loading,
    loadingProgress,
    stats,
    fetchData
  };
};
