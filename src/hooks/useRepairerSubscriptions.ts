
import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RepairerSubscription {
  repairer_id: string;
  subscription_tier: string;
  subscribed: boolean;
}

/**
 * Hook simplifié pour gérer les abonnements des réparateurs
 * Retourne un état par défaut en cas d'erreur pour éviter les crashes
 */
export const useRepairerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Tentative de récupération simple
        const { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('repairer_id, subscription_tier, subscribed')
          .eq('subscribed', true);

        if (!isMounted) return;

        if (error) {
          console.warn('Subscriptions fetch error (non-critical):', error);
          setSubscriptions({});
          setError(null); // Ne pas afficher d'erreur à l'utilisateur
          return;
        }

        // Conversion simple en map
        const subscriptionMap: Record<string, string> = {};
        data?.forEach((sub: RepairerSubscription) => {
          if (sub.subscribed && sub.subscription_tier !== 'free') {
            subscriptionMap[sub.repairer_id] = sub.subscription_tier;
          }
        });

        setSubscriptions(subscriptionMap);
      } catch (error) {
        if (!isMounted) return;
        console.warn('Subscription service unavailable (non-critical):', error);
        setSubscriptions({});
        setError(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Délai court pour éviter les appels trop précoces
    const timer = setTimeout(fetchSubscriptions, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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
