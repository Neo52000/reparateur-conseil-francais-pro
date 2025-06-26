
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCustomPrice } from '@/types/repairerPricing';

export class BulkMarginService {
  static async applyMarginToMultiplePrices(
    repairerId: string,
    margin: number,
    repairerPrices: RepairerCustomPrice[],
    priceIds?: string[]
  ) {
    console.log('Bulk applying margin:', margin, priceIds);
    
    // Si aucun ID spécifique, appliquer à tous les prix du réparateur
    const targetPrices = priceIds || repairerPrices.map(p => p.id);
    
    const updates = targetPrices.map(id => {
      const existingPrice = repairerPrices.find(p => p.id === id);
      if (!existingPrice?.repair_price) return null;
      
      const basePrice = existingPrice.repair_price.price_eur;
      const newPrice = basePrice * (1 + margin / 100);
      
      return {
        id,
        custom_price_eur: Math.round(newPrice * 100) / 100,
        margin_percentage: margin,
        updated_at: new Date().toISOString()
      };
    }).filter(Boolean);

    // Effectuer les mises à jour une par une pour éviter les problèmes de types
    for (const update of updates) {
      if (update) {
        await supabase
          .from('repairer_custom_prices' as any)
          .update({
            custom_price_eur: update.custom_price_eur,
            margin_percentage: update.margin_percentage,
            updated_at: update.updated_at
          })
          .eq('id', update.id);
      }
    }

    return updates.length;
  }
}
