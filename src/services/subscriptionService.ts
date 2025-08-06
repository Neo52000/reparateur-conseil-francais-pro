
import { supabase } from '@/integrations/supabase/client';

export const subscriptionService = {
  // Attribuer automatiquement le plan gratuit à un nouveau réparateur
  async assignFreePlan(userEmail: string, userId: string) {
    try {
      const { data, error } = await supabase.rpc('assign_free_plan_to_repairer', {
        user_email: userEmail,
        user_id: userId
      });

      if (error) throw error;

      return { success: true, subscriptionId: data };
    } catch (error) {
      console.error('Error assigning free plan:', error);
      return { success: false, error };
    }
  },

  // Vérifier le statut d'abonnement d'un utilisateur
  async getUserSubscription(userEmail: string) {
    try {
      const { data, error } = await supabase
        .from('repairer_subscriptions')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) throw error;

      return { success: true, subscription: data };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return { success: false, error };
    }
  },

  // Mettre à jour les préférences du popup
  async updatePopupPreferences(userEmail: string, preferences: {
    popup_dismissed_until?: string;
    popup_never_show?: boolean;
  }) {
    try {
      const { error } = await supabase
        .from('repairer_subscriptions')
        .update(preferences)
        .eq('email', userEmail);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating popup preferences:', error);
      return { success: false, error };
    }
  }
};
