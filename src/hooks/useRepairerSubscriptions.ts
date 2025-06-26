
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RepairerSubscription {
  repairer_id: string;
  subscription_tier: string;
  subscribed: boolean;
}

export const useRepairerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('repairer_id, subscription_tier, subscribed')
          .eq('subscribed', true);

        if (error) {
          console.error('Error fetching subscriptions:', error);
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
        console.error('Error in fetchSubscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const getSubscriptionTier = (repairerId: string): string => {
    return subscriptions[repairerId] || 'free';
  };

  return {
    subscriptions,
    loading,
    getSubscriptionTier
  };
};
