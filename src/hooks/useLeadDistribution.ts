import { supabase } from '@/integrations/supabase/client';

interface LeadDistributionResult {
  repairerId: string;
  canReceiveLead: boolean;
  reason?: string;
}

/**
 * Service de distribution des leads selon le niveau d'abonnement du réparateur.
 * 
 * - Gratuit (Niveau 0-1) : max 5 leads/mois
 * - Visibilité (Niveau 2) : leads illimités + devis en ligne
 * - Pro/Premium (Niveau 3) : leads prioritaires + exclusivité zone
 */
export const useLeadDistribution = () => {

  const getRepairerTier = async (repairerId: string): Promise<string> => {
    const { data } = await supabase
      .from('repairer_subscriptions')
      .select('subscription_tier')
      .eq('repairer_id', repairerId)
      .single();
    return data?.subscription_tier || 'free';
  };

  const checkLeadEligibility = async (repairerId: string): Promise<LeadDistributionResult> => {
    try {
      const tier = await getRepairerTier(repairerId);

      // Pro/Premium: always eligible
      if (['pro', 'premium', 'enterprise'].includes(tier)) {
        return { repairerId, canReceiveLead: true };
      }

      // Visibilité: unlimited leads
      if (['visibility', 'visibilite'].includes(tier)) {
        return { repairerId, canReceiveLead: true };
      }

      // Free plan: check monthly lead count (max 5)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count } = await supabase
        .from('client_interests')
        .select('*', { count: 'exact', head: true })
        .eq('repairer_profile_id', repairerId)
        .gte('created_at', startOfMonth);

      const monthlyLeads = count || 0;
      const MAX_FREE_LEADS = 5;

      if (monthlyLeads >= MAX_FREE_LEADS) {
        return {
          repairerId,
          canReceiveLead: false,
          reason: `Limite de ${MAX_FREE_LEADS} leads/mois atteinte. Passez au plan Visibilité pour des leads illimités.`
        };
      }

      return { repairerId, canReceiveLead: true };
    } catch (error) {
      console.error('Lead eligibility check error:', error);
      return { repairerId, canReceiveLead: false, reason: 'Erreur de vérification' };
    }
  };

  const distributeLeadToRepairers = async (
    repairerIds: string[],
    leadData: { clientEmail: string; clientPhone?: string; description: string }
  ) => {
    const results: Array<{ repairerId: string; sent: boolean; reason?: string }> = [];

    for (const repairerId of repairerIds) {
      const eligibility = await checkLeadEligibility(repairerId);

      if (!eligibility.canReceiveLead) {
        results.push({ repairerId, sent: false, reason: eligibility.reason });
        continue;
      }

      try {
        // Create client interest entry
        await supabase.from('client_interests').insert({
          repairer_profile_id: repairerId,
          client_email: leadData.clientEmail,
          client_phone: leadData.clientPhone || '',
          client_message: leadData.description,
          status: 'pending',
        });

        // Send notification
        await supabase.from('notifications').insert({
          user_id: repairerId,
          type: 'new_lead',
          title: 'Nouveau lead reçu',
          message: leadData.description.substring(0, 200),
          data: { client_email: leadData.clientEmail }
        });

        results.push({ repairerId, sent: true });
      } catch (error) {
        results.push({ repairerId, sent: false, reason: 'Erreur technique' });
      }
    }

    return results;
  };

  const getRepairerLeadStats = async (repairerId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count: monthlyCount } = await supabase
      .from('client_interests')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_profile_id', repairerId)
      .gte('created_at', startOfMonth);

    const tier = await getRepairerTier(repairerId);
    const isFreePlan = !['visibility', 'visibilite', 'pro', 'premium', 'enterprise'].includes(tier);

    return {
      monthlyLeads: monthlyCount || 0,
      maxLeads: isFreePlan ? 5 : Infinity,
      tier,
      isLimited: isFreePlan,
      remainingLeads: isFreePlan ? Math.max(0, 5 - (monthlyCount || 0)) : Infinity
    };
  };

  return {
    checkLeadEligibility,
    distributeLeadToRepairers,
    getRepairerLeadStats
  };
};
