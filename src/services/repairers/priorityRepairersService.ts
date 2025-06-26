
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SupabaseRepairer = Database['public']['Tables']['repairers']['Row'];

export class PriorityRepairersService {
  /**
   * Récupère les réparateurs par ordre de priorité :
   * 1. Réparateurs vérifiés
   * 2. Réparateurs avec abonnement payant
   * 3. Autres réparateurs avec données valides
   */
  static async fetchPriorityRepairers(limit: number = 50): Promise<SupabaseRepairer[]> {
    console.log('PriorityRepairersService - Fetching priority repairers...');

    try {
      // Requête pour les réparateurs vérifiés ET avec coordonnées valides
      const { data: verifiedRepairers, error: verifiedError } = await supabase
        .from('repairers')
        .select('*')
        .eq('is_verified', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .not('name', 'ilike', '%�%') // Exclure les noms avec caractères corrompus
        .order('updated_at', { ascending: false })
        .limit(Math.floor(limit / 2));

      if (verifiedError) {
        console.error('Error fetching verified repairers:', verifiedError);
      }

      // Requête pour les réparateurs avec abonnements payants via jointure
      const { data: paidRepairers, error: paidError } = await supabase
        .from('repairers')
        .select(`
          *,
          repairer_subscriptions!inner(subscription_tier)
        `)
        .neq('repairer_subscriptions.subscription_tier', 'free')
        .eq('repairer_subscriptions.subscribed', true)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .not('name', 'ilike', '%�%')
        .order('updated_at', { ascending: false })
        .limit(Math.floor(limit / 3));

      if (paidError) {
        console.error('Error fetching paid repairers:', paidError);
      }

      // Combiner et dédupliquer les résultats
      const combinedRepairers = new Map<string, SupabaseRepairer>();
      
      // Ajouter les réparateurs vérifiés (priorité 1)
      verifiedRepairers?.forEach(repairer => {
        combinedRepairers.set(repairer.id, repairer);
      });

      // Ajouter les réparateurs payants (priorité 2)
      paidRepairers?.forEach(repairer => {
        if (!combinedRepairers.has(repairer.id)) {
          combinedRepairers.set(repairer.id, repairer);
        }
      });

      // Si on n'a pas assez de résultats, compléter avec d'autres réparateurs valides
      if (combinedRepairers.size < limit) {
        const remainingLimit = limit - combinedRepairers.size;
        const { data: fallbackRepairers } = await supabase
          .from('repairers')
          .select('*')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .not('name', 'ilike', '%�%')
          .not('id', 'in', Array.from(combinedRepairers.keys()))
          .order('created_at', { ascending: false })
          .limit(remainingLimit);

        fallbackRepairers?.forEach(repairer => {
          combinedRepairers.set(repairer.id, repairer);
        });
      }

      const result = Array.from(combinedRepairers.values());
      console.log(`PriorityRepairersService - Found ${result.length} priority repairers`);
      console.log(`- Verified: ${verifiedRepairers?.length || 0}`);
      console.log(`- Paid subscriptions: ${paidRepairers?.length || 0}`);
      
      return result;

    } catch (error) {
      console.error('PriorityRepairersService - Error:', error);
      // Fallback: récupérer les réparateurs les plus récents avec données valides
      const { data: fallbackData } = await supabase
        .from('repairers')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .not('name', 'ilike', '%�%')
        .order('created_at', { ascending: false })
        .limit(limit);

      return fallbackData || [];
    }
  }

  /**
   * Nettoie et valide les données d'un réparateur
   */
  static cleanRepairerData(repairer: SupabaseRepairer): SupabaseRepairer {
    return {
      ...repairer,
      name: repairer.name.replace(/[�]/g, ''), // Nettoyer les caractères corrompus
      city: repairer.city.replace(/[�]/g, ''),
      services: repairer.services?.filter(service => 
        service && !service.includes('�')
      ) || [],
      lat: typeof repairer.lat === 'number' ? repairer.lat : null,
      lng: typeof repairer.lng === 'number' ? repairer.lng : null,
    };
  }
}
