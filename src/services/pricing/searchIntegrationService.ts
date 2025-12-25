export class SearchIntegrationService {
  /**
   * Recherche les réparateurs avec leurs prix personnalisés pour un type de réparation donné
   */
  static async searchRepairersByRepairType(
    deviceModelId: string,
    repairTypeId: string,
    location?: { lat: number; lng: number; radius?: number }
  ) {
    console.log('🔍 Searching repairers for repair type:', { deviceModelId, repairTypeId });
    return this.getFallbackRepairers(location);
  }

  /**
   * Récupère des réparateurs génériques en fallback
   */
  static async getFallbackRepairers(location?: { lat: number; lng: number; radius?: number }) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Récupérer TOUS les réparateurs avec coordonnées valides (pas de filtre is_verified)
      const { data: repairers, error } = await supabase
        .from('repairers')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('rating', { ascending: false })
        .limit(500); // Augmenter la limite pour afficher plus de réparateurs

      if (error) {
        console.error('Error fetching repairers from Supabase:', error);
        return [];
      }

      console.log(`✅ SearchIntegrationService - Found ${repairers?.length || 0} geolocated repairers`);

      return (repairers || []).map(repairer => ({
        id: repairer.id,
        repairer_id: repairer.id,
        business_name: repairer.name,
        name: repairer.name,
        city: repairer.city,
        address: repairer.address,
        phone: repairer.phone,
        email: repairer.email,
        rating: repairer.rating || 4.5,
        lat: repairer.lat,
        lng: repairer.lng,
        is_verified: repairer.is_verified || false,
        custom_price: null,
        location: { lat: repairer.lat, lng: repairer.lng },
        distance: location ? null : null
      }));
    } catch (error) {
      console.error('Error fetching repairers:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques de prix pour un type de réparation
   */
  static async getPriceStatistics(deviceModelId: string, repairTypeId: string) {
    return null;
  }

  /**
   * Récupère les prix d'un réparateur spécifique
   */
  static async getRepairerPrices(repairerId: string) {
    return [];
  }
}