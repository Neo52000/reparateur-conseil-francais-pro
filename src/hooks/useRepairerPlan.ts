import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useRepairerPlan = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Première tentative : chercher par user_id
        let { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, subscribed, email, billing_cycle')
          .eq('user_id', user.id)
          .eq('subscribed', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription by user_id:', error);
        } else if (data) {
          setCurrentPlan(data.subscription_tier || 'free');
          setLoading(false);
          return;
        }

        // Deuxième tentative : chercher par repairer_id
        const { data: data2, error: error2 } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, subscribed, email, billing_cycle')
          .eq('repairer_id', user.id.toString())
          .eq('subscribed', true)
          .maybeSingle();

        if (error2) {
          console.error('Error fetching subscription by repairer_id:', error2);
        } else if (data2) {
          setCurrentPlan(data2.subscription_tier || 'free');
        } else {
          // Troisième tentative : chercher par email
          const { data: data3, error: error3 } = await supabase
            .from('repairer_subscriptions')
            .select('subscription_tier, subscribed, email, billing_cycle')
            .eq('email', user.email)
            .eq('subscribed', true)
            .maybeSingle();

          if (error3) {
            console.error('Error fetching subscription by email:', error3);
          } else if (data3) {
            setCurrentPlan(data3.subscription_tier || 'free');
          }
        }
      } catch (error) {
        console.error('Error in fetchCurrentPlan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPlan();
  }, [user?.id, user?.email]);

  return { currentPlan, loading };
};
