
import { supabase } from '@/integrations/supabase/client';
import type { RepairerCatalogPreference, RepairerBrandSetting } from '@/types/repairerCatalog';

export class CatalogPreferencesService {
  /**
   * Sauvegarder une préférence de catalogue
   */
  static async saveCatalogPreference(data: Omit<RepairerCatalogPreference, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('repairer_catalog_preferences')
      .upsert([data], {
        onConflict: 'repairer_id,entity_type,entity_id'
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  /**
   * Sauvegarder un paramètre de marque
   */
  static async saveBrandSetting(data: Omit<RepairerBrandSetting, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('repairer_brand_settings')
      .upsert([data], {
        onConflict: 'repairer_id,brand_id'
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  /**
   * Actions en masse
   */
  static async bulkUpdateCatalogItems(
    repairerId: string,
    updates: Array<{
      entity_type: 'brand' | 'device_model' | 'repair_type';
      entity_id: string;
      is_active?: boolean;
      margin_percentage?: number;
    }>
  ) {
    const operations = updates.map(update => ({
      repairer_id: repairerId,
      entity_type: update.entity_type,
      entity_id: update.entity_id,
      is_active: update.is_active ?? true,
      default_margin_percentage: update.margin_percentage
    }));

    const { data, error } = await supabase
      .from('repairer_catalog_preferences')
      .upsert(operations, {
        onConflict: 'repairer_id,entity_type,entity_id'
      });

    if (error) throw error;
    return data;
  }
}
