
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
  static async fetchPriorityRepairers(limit: number = 500): Promise<SupabaseRepairer[]> {
    console.log('PriorityRepairersService - Fetching ALL geolocated repairers...');

    try {
      // Récupérer TOUS les réparateurs avec coordonnées valides
      // Priorité d'affichage : vérifiés > payants > autres
      const { data: allRepairers, error } = await supabase
        .from('repairers')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .not('name', 'ilike', '%�%') // Exclure les noms avec caractères corrompus
        .order('is_verified', { ascending: false }) // Vérifiés en premier
        .order('rating', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching repairers:', error);
        return [];
      }

      console.log(`✅ PriorityRepairersService - Found ${allRepairers?.length || 0} geolocated repairers`);
      
      // Log breakdown
      const verified = allRepairers?.filter(r => r.is_verified).length || 0;
      console.log(`- Verified: ${verified}`);
      console.log(`- Unverified: ${(allRepairers?.length || 0) - verified}`);
      
      return allRepairers || [];

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
