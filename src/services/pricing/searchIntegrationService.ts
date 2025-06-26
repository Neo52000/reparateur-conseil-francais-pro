
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCustomPrice } from '@/types/repairerPricing';

export class SearchIntegrationService {
  /**
   * Recherche les réparateurs avec leurs prix personnalisés pour un type de réparation donné
   */
  static async searchRepairersByRepairType(
    deviceModelId: string,
    repairTypeId: string,
    location?: { lat: number; lng: number; radius?: number }
  ) {
    try {
      console.log('🔍 Searching repairers for repair type:', { deviceModelId, repairTypeId });

      // Récupérer les prix personnalisés pour cette combinaison
      const { data: customPrices, error: pricesError } = await supabase
        .from('repairer_custom_prices' as any)
        .select(`
          *,
          repairer_profiles!inner(
            user_id,
            business_name,
            city,
            address,
            phone,
            email,
            rating,
            lat,
            lng
          )
        `)
        .eq('repair_price_id', `${deviceModelId}-${repairTypeId}`)
        .eq('is_active', true);

      if (pricesError) throw pricesError;

      // Enrichir avec les informations de profil
      const enrichedResults = (customPrices || []).map((price: any) => ({
        repairer_id: price.repairer_id,
        business_name: price.repairer_profiles.business_name,
        city: price.repairer_profiles.city,
        address: price.repairer_profiles.address,
        phone: price.repairer_profiles.phone,
        email: price.repairer_profiles.email,
        custom_price: price.custom_price_eur,
        margin_percentage: price.margin_percentage,
        notes: price.notes,
        location: {
          lat: price.repairer_profiles.lat,
          lng: price.repairer_profiles.lng
        }
      }));

      // Filtrer par géolocalisation si spécifiée
      if (location) {
        const filtered = enrichedResults.filter((repairer: any) => {
          if (!repairer.location.lat || !repairer.location.lng) return false;
          
          const distance = this.calculateDistance(
            location.lat,
            location.lng,
            repairer.location.lat,
            repairer.location.lng
          );
          
          return distance <= (location.radius || 50); // 50km par défaut
        });

        return filtered.sort((a: any, b: any) => a.custom_price - b.custom_price);
      }

      return enrichedResults.sort((a: any, b: any) => a.custom_price - b.custom_price);

    } catch (error) {
      console.error('Error searching repairers by repair type:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de prix pour un type de réparation
   */
  static async getPriceStatistics(deviceModelId: string, repairTypeId: string) {
    try {
      const { data, error } = await supabase
        .from('repairer_custom_prices' as any)
        .select('custom_price_eur')
        .eq('repair_price_id', `${deviceModelId}-${repairTypeId}`)
        .eq('is_active', true);

      if (error) throw error;

      const prices = (data || []).map((item: any) => item.custom_price_eur);
      
      if (prices.length === 0) {
        return null;
      }

      const sortedPrices = prices.sort((a: number, b: number) => a - b);
      
      return {
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        average: prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length,
        median: sortedPrices[Math.floor(sortedPrices.length / 2)],
        count: prices.length
      };

    } catch (error) {
      console.error('Error getting price statistics:', error);
      throw error;
    }
  }

  /**
   * Récupère les prix d'un réparateur spécifique
   */
  static async getRepairerPrices(repairerId: string) {
    try {
      const { data, error } = await supabase
        .from('repairer_custom_prices' as any)
        .select(`
          *,
          repair_price:repair_prices(
            *,
            device_model:device_models(
              *,
              brand:brands(*)
            ),
            repair_type:repair_types(*)
          )
        `)
        .eq('repairer_id', repairerId)
        .eq('is_active', true)
        .order('custom_price_eur', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error getting repairer prices:', error);
      throw error;
    }
  }

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
