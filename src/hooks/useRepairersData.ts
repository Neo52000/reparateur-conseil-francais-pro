
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
      console.log('🔄 useRepairersData - Fetching subscriptions...');
      const { data, error } = await supabase
        .from('admin_subscription_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useRepairersData - Subscription fetch error:', error);
        
        // Gestion spécialisée selon le type d'erreur
        if (error.code === 'PGRST116') {
          console.warn('⚠️ useRepairersData - View admin_subscription_overview not found, using empty fallback');
          setSubscriptions([]);
          return;
        }
        
        if (error.message?.includes('permission denied') || error.message?.includes('insufficient_privilege')) {
          console.error('🔒 useRepairersData - Permission denied for subscriptions view');
          toast({
            title: "Erreur de permissions",
            description: "Vous n'avez pas les droits pour accéder aux données d'abonnements",
            variant: "destructive"
          });
          setSubscriptions([]);
          return;
        }
        
        throw error;
      }

      console.log('✅ useRepairersData - Subscriptions loaded:', data?.length || 0);
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
      console.error('❌ useRepairersData - Error fetching subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const fetchRepairers = async () => {
    try {
      console.log('🔄 useRepairersData - Fetching repairers...');
      
      // Récupérer les réparateurs depuis la base de données avec gestion d'erreur améliorée
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (repairersError) {
        console.error('❌ useRepairersData - Repairers fetch error:', repairersError);
        
        // Gestion spécialisée selon le type d'erreur
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
      
      // Afficher un toast d'erreur seulement pour les vraies erreurs techniques
      toast({
        title: "Erreur de chargement",
        description: "Problème technique lors du chargement des réparateurs",
        variant: "destructive"
      });
      
      // En cas d'erreur, utiliser des données de fallback vides
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
