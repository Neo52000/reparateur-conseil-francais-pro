import { supabase } from '@/integrations/supabase/client';

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

      // Pour l'instant, retourner des données de démonstration
      const demoResults = [
        {
          repairer_id: 'demo-1',
          business_name: 'iRepair Paris Centre',
          city: 'Paris',
          address: '123 Rue de la République',
          phone: '01 23 45 67 89',
          email: 'contact@irepair-paris.fr',
          custom_price: 89,
          has_predefined_pricing: true,
          margin_percentage: 15,
          notes: 'Réparation express en 1h',
          location: { lat: 48.8566, lng: 2.3522 }
        },
        {
          repairer_id: 'demo-2',
          business_name: 'TechFix Pro',
          city: 'Lyon',
          address: '456 Avenue des Sciences',
          phone: '04 12 34 56 78',
          email: 'hello@techfix-pro.fr',
          custom_price: null,
          has_predefined_pricing: false,
          margin_percentage: null,
          notes: 'Devis personnalisé sous 24h',
          location: { lat: 45.7640, lng: 4.8357 }
        },
        {
          repairer_id: 'demo-3',
          business_name: 'Mobile Express',
          city: 'Marseille',
          address: '789 Boulevard Prado',
          phone: '04 91 23 45 67',
          email: 'contact@mobile-express.fr',
          custom_price: 75,
          has_predefined_pricing: true,
          margin_percentage: 12,
          notes: 'Garantie 6 mois',
          location: { lat: 43.2965, lng: 5.3698 }
        }
      ];

      // Filtrer par géolocalisation si spécifiée
      if (location) {
        const filtered = demoResults.filter((repairer) => {
          const distance = this.calculateDistance(
            location.lat,
            location.lng,
            repairer.location.lat,
            repairer.location.lng
          );
          
          return distance <= (location.radius || 50);
        });

        return filtered.sort((a, b) => {
          if (a.has_predefined_pricing && !b.has_predefined_pricing) return -1;
          if (!a.has_predefined_pricing && b.has_predefined_pricing) return 1;
          if (a.custom_price && b.custom_price) return a.custom_price - b.custom_price;
          return 0;
        });
      }

      return demoResults.sort((a, b) => {
        if (a.has_predefined_pricing && !b.has_predefined_pricing) return -1;
        if (!a.has_predefined_pricing && b.has_predefined_pricing) return 1;
        if (a.custom_price && b.custom_price) return a.custom_price - b.custom_price;
        return 0;
      });

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
      // Pour l'instant, retourner des statistiques de démonstration
      return {
        min: 45,
        max: 120,
        average: 75,
        median: 70,
        count: 15
      };
    } catch (error) {
      console.error('Error getting price statistics:', error);
      return {
        min: 45,
        max: 120,
        average: 75,
        median: 70,
        count: 0
      };
    }
  }

  /**
   * Récupère les prix d'un réparateur spécifique
   */
  static async getRepairerPrices(repairerId: string) {
    try {
      // Pour l'instant, retourner des données de démonstration
      return [];
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