
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCustomPrice, CreateCustomPriceData, UpdateCustomPriceData } from '@/types/repairerPricing';
import type { RepairPrice } from '@/types/catalog';

export class RepairerCustomPricesService {
  static async fetchRepairerPrices(repairerId: string) {
    console.log('Fetching repairer custom prices...');
    
    // Récupérer d'abord les prix personnalisés sans relations
    const { data: customPricesData, error: customError } = await supabase
      .from('repairer_custom_prices' as any)
      .select('*')
      .eq('repairer_id', repairerId)
      .order('created_at', { ascending: false });

    if (customError) throw customError;

    // Récupérer les prix de base avec leurs relations
    const { data: basePricesData, error: baseError } = await supabase
      .from('repair_prices')
      .select(`
        *,
        device_model:device_models(
          *,
          brand:brands(*)
        ),
        repair_type:repair_types(
          *,
          category:repair_categories(*)
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (baseError) throw baseError;

    // Associer les prix personnalisés avec leurs prix de base
    const enrichedCustomPrices = (customPricesData || []).map((customPrice: any) => {
      const relatedBasePrice = basePricesData?.find(bp => bp.id === customPrice.repair_price_id);
      return {
        ...customPrice,
        repair_price: relatedBasePrice
      };
    });

    console.log('Repairer prices fetched:', enrichedCustomPrices);
    console.log('Base prices fetched:', basePricesData);
    
    return {
      customPrices: enrichedCustomPrices as RepairerCustomPrice[],
      basePrices: basePricesData as RepairPrice[] || []
    };
  }

  static async createCustomPrice(repairerId: string, customPriceData: CreateCustomPriceData) {
    console.log('Creating custom price:', customPriceData);
    
    const { data, error } = await supabase
      .from('repairer_custom_prices' as any)
      .insert([{
        ...customPriceData,
        repairer_id: repairerId
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('Custom price created:', data);
    return data;
  }

  static async updateCustomPrice(id: string, updates: UpdateCustomPriceData) {
    console.log('Updating custom price:', id, updates);
    
    const { data, error } = await supabase
      .from('repairer_custom_prices' as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('Custom price updated:', data);
    return data;
  }

  static async deleteCustomPrice(id: string) {
    console.log('Deleting custom price:', id);
    
    const { error } = await supabase
      .from('repairer_custom_prices' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('Custom price deleted');
  }
}
