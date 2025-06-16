
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscription_tier: string;
  popup_dismissed_until: string | null;
  popup_never_show: boolean;
}

export const useUpgradeModal = (userEmail: string | null) => {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const checkShouldShowModal = async () => {
      try {
        const { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, popup_dismissed_until, popup_never_show')
          .eq('email', userEmail)
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        const subscription = data as SubscriptionData;
        
        // Ne pas afficher si ce n'est pas un plan gratuit
        if (subscription.subscription_tier !== 'free') {
          setLoading(false);
          return;
        }

        // Ne pas afficher si l'utilisateur a choisi de ne plus voir le popup
        if (subscription.popup_never_show) {
          setLoading(false);
          return;
        }

        // Ne pas afficher si le popup a été reporté et que la date n'est pas encore passée
        if (subscription.popup_dismissed_until) {
          const dismissedUntil = new Date(subscription.popup_dismissed_until);
          const now = new Date();
          if (now < dismissedUntil) {
            setLoading(false);
            return;
          }
        }

        // Afficher le modal avec un délai de 2 secondes
        setShouldShowModal(true);
        setTimeout(() => {
          setIsModalOpen(true);
        }, 2000);

      } catch (error) {
        console.error('Error checking upgrade modal status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkShouldShowModal();
  }, [userEmail]);

  const closeModal = () => {
    setIsModalOpen(false);
    setShouldShowModal(false);
  };

  return {
    shouldShowModal,
    isModalOpen,
    closeModal,
    loading
  };
};
