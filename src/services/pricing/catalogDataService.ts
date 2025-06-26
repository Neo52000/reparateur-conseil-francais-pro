
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCatalogPreference, RepairerBrandSetting } from '@/types/repairerCatalog';

export class CatalogDataService {
  /**
   * Récupérer toutes les préférences de catalogue d'un réparateur
   */
  static async getRepairerCatalogPreferences(repairerId: string): Promise<RepairerCatalogPreference[]> {
    const { data, error } = await supabase
      .from('repairer_catalog_preferences')
      .select('*')
      .eq('repairer_id', repairerId);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      entity_type: item.entity_type as 'brand' | 'device_model' | 'repair_type'
    }));
  }

  /**
   * Récupérer tous les paramètres de marques d'un réparateur
   */
  static async getRepairerBrandSettings(repairerId: string): Promise<RepairerBrandSetting[]> {
    const { data, error } = await supabase
      .from('repairer_brand_settings')
      .select('*')
      .eq('repairer_id', repairerId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupérer les données de base du catalogue
   */
  static async getBaseCatalogData() {
    const [brandsResponse, modelsResponse, repairTypesResponse, pricesResponse] = await Promise.all([
      supabase.from('brands').select('*').order('name'),
      supabase.from('device_models').select(`
        *,
        brand:brands(*)
      `).eq('is_active', true).order('model_name'),
      supabase.from('repair_types').select(`
        *,
        category:repair_categories(*)
      `).eq('is_active', true).order('name'),
      supabase.from('repair_prices').select(`
        *,
        device_model:device_models(*),
        repair_type:repair_types(*)
      `).eq('is_available', true)
    ]);

    if (brandsResponse.error) throw brandsResponse.error;
    if (modelsResponse.error) throw modelsResponse.error;
    if (repairTypesResponse.error) throw repairTypesResponse.error;
    if (pricesResponse.error) throw pricesResponse.error;

    return {
      brands: brandsResponse.data || [],
      models: modelsResponse.data || [],
      repairTypes: repairTypesResponse.data || [],
      basePrices: pricesResponse.data || []
    };
  }

  /**
   * Récupérer les prix personnalisés d'un réparateur
   */
  static async getCustomPrices(repairerId: string) {
    const { data, error } = await supabase
      .from('repairer_custom_prices')
      .select('*')
      .eq('repairer_id', repairerId);

    if (error) throw error;
    return data || [];
  }
}
