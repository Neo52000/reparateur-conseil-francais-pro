
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RepairerSubscription {
  repairer_id: string;
  subscription_tier: string;
  subscribed: boolean;
}

export const useRepairerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Vérifier que Supabase est disponible
        if (!supabase) {
          console.warn('Supabase client not available');
          setSubscriptions({});
          return;
        }

        const { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('repairer_id, subscription_tier, subscribed')
          .eq('subscribed', true);

        if (error) {
          console.error('Error fetching subscriptions:', error);
          setError(error.message);
          setSubscriptions({}); // Fallback sûr
          return;
        }

        // Convertir en map pour un accès rapide
        const subscriptionMap: Record<string, string> = {};
        data?.forEach((sub: RepairerSubscription) => {
          if (sub.subscribed && sub.subscription_tier !== 'free') {
            subscriptionMap[sub.repairer_id] = sub.subscription_tier;
          }
        });

        setSubscriptions(subscriptionMap);
      } catch (error) {
        console.error('Exception in fetchSubscriptions:', error);
        setError('Erreur de connexion');
        setSubscriptions({}); // Fallback sûr
      } finally {
        setLoading(false);
      }
    };

    // Délai pour éviter les erreurs au démarrage
    const timer = setTimeout(() => {
      fetchSubscriptions().catch((error) => {
        console.error('Failed to fetch subscriptions:', error);
        setSubscriptions({});
        setLoading(false);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getSubscriptionTier = (repairerId: string): string => {
    if (!repairerId) return 'free';
    return subscriptions[repairerId] || 'free';
  };

  return {
    subscriptions,
    loading,
    error,
    getSubscriptionTier
  };
};
