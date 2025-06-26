
import { supabase } from '@/integrations/supabase/client';

export interface PriceRange {
  min: number;
  max: number;
  average: number;
}

export interface RepairerPricing {
  repairer_id: string;
  device_model: string;
  repair_type: string;
  price: number;
  is_custom: boolean;
  base_price?: number;
}

export class SearchIntegrationService {
  /**
   * Obtenir les fourchettes de prix pour un type de réparation
   */
  static async getPriceRangeForRepair(
    deviceBrand: string,
    deviceModel: string,
    repairType: string
  ): Promise<PriceRange | null> {
    try {
      console.log('Getting price range for:', { deviceBrand, deviceModel, repairType });

      // Requête pour obtenir les prix de base et personnalisés
      const { data: basePrices, error: baseError } = await supabase
        .from('repair_prices')
        .select(`
          price_eur,
          device_model!inner(
            model_name,
            brand!inner(name)
          ),
          repair_type!inner(name)
        `)
        .eq('device_model.brand.name', deviceBrand)
        .eq('device_model.model_name', deviceModel)
        .eq('repair_type.name', repairType)
        .eq('is_available', true);

      if (baseError) throw baseError;

      // Requête pour obtenir les prix personnalisés des réparateurs avec une requête générique
      const { data: customPrices, error: customError } = await supabase
        .from('repairer_custom_prices' as any)
        .select(`
          custom_price_eur,
          repair_price!inner(
            device_model!inner(
              model_name,
              brand!inner(name)
            ),
            repair_type!inner(name)
          )
        `)
        .eq('repair_price.device_model.brand.name', deviceBrand)
        .eq('repair_price.device_model.model_name', deviceModel)
        .eq('repair_price.repair_type.name', repairType)
        .eq('is_active', true);

      if (customError) throw customError;

      // Combiner tous les prix
      const allPrices = [
        ...(basePrices?.map(p => p.price_eur) || []),
        ...(customPrices?.map((p: any) => p.custom_price_eur) || [])
      ];

      if (allPrices.length === 0) {
        return null;
      }

      const min = Math.min(...allPrices);
      const max = Math.max(...allPrices);
      const average = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

      console.log('Price range calculated:', { min, max, average });

      return {
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        average: Math.round(average * 100) / 100
      };
    } catch (error) {
      console.error('Error getting price range:', error);
      return null;
    }
  }

  /**
   * Obtenir les prix de tous les réparateurs pour une réparation donnée
   */
  static async getRepairerPricesForRepair(
    deviceBrand: string,
    deviceModel: string,
    repairType: string,
    location?: { lat: number; lng: number; radius?: number }
  ): Promise<RepairerPricing[]> {
    try {
      console.log('Getting repairer prices for:', { deviceBrand, deviceModel, repairType, location });

      const { data: customPrices, error } = await supabase
        .from('repairer_custom_prices' as any)
        .select(`
          repairer_id,
          custom_price_eur,
          repair_price!inner(
            price_eur,
            device_model!inner(
              model_name,
              brand!inner(name)
            ),
            repair_type!inner(name)
          ),
          repairer_profiles!inner(
            business_name,
            city,
            postal_code
          )
        `)
        .eq('repair_price.device_model.brand.name', deviceBrand)
        .eq('repair_price.device_model.model_name', deviceModel)
        .eq('repair_price.repair_type.name', repairType)
        .eq('is_active', true);

      if (error) throw error;

      // Transformer les données
      const repairerPrices: RepairerPricing[] = (customPrices || []).map((price: any) => ({
        repairer_id: price.repairer_id,
        device_model: `${price.repair_price.device_model.brand.name} ${price.repair_price.device_model.model_name}`,
        repair_type: price.repair_price.repair_type.name,
        price: price.custom_price_eur,
        is_custom: true,
        base_price: price.repair_price.price_eur
      }));

      console.log('Repairer prices found:', repairerPrices.length);

      return repairerPrices;
    } catch (error) {
      console.error('Error getting repairer prices:', error);
      return [];
    }
  }

  /**
   * Obtenir des suggestions de prix pour un devis
   */
  static async getQuoteSuggestions(
    deviceBrand: string,
    deviceModel: string,
    repairTypes: string[]
  ): Promise<{
    repair_type: string;
    suggested_price: number;
    price_range: PriceRange;
    confidence: number;
  }[]> {
    try {
      console.log('Getting quote suggestions for:', { deviceBrand, deviceModel, repairTypes });

      const suggestions = await Promise.all(
        repairTypes.map(async (repairType) => {
          const priceRange = await this.getPriceRangeForRepair(deviceBrand, deviceModel, repairType);
          
          if (!priceRange) {
            return {
              repair_type: repairType,
              suggested_price: 0,
              price_range: { min: 0, max: 0, average: 0 },
              confidence: 0
            };
          }

          // Utiliser la moyenne comme suggestion, avec une légère pondération vers le haut
          const suggested_price = Math.round((priceRange.average * 1.05) * 100) / 100;
          
          // Calculer la confiance basée sur la dispersion des prix
          const spread = priceRange.max - priceRange.min;
          const confidence = Math.max(0.3, 1 - (spread / priceRange.average));

          return {
            repair_type: repairType,
            suggested_price,
            price_range: priceRange,
            confidence: Math.round(confidence * 100) / 100
          };
        })
      );

      console.log('Quote suggestions generated:', suggestions);

      return suggestions;
    } catch (error) {
      console.error('Error getting quote suggestions:', error);
      return [];
    }
  }

  /**
   * Mettre à jour les statistiques de prix pour le moteur de recherche
   */
  static async updatePricingStatistics() {
    try {
      console.log('Updating pricing statistics...');

      // Cette fonction pourrait être appelée périodiquement pour mettre à jour
      // une table de statistiques utilisée par le moteur de recherche
      const { error } = await supabase.functions.invoke('update-pricing-stats');

      if (error) throw error;

      console.log('Pricing statistics updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating pricing statistics:', error);
      return false;
    }
  }
}
