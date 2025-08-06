import { supabase } from '@/integrations/supabase/client';
import { PosCatalogSync } from '@/types/advertising-ai';

export class CatalogSyncService {
  static async syncPOSCatalog(repairerId: string): Promise<void> {
    try {
      // Récupérer les données du catalogue POS
      const { data: posItems, error: posError } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .eq('repairer_id', repairerId);

      if (posError) throw posError;

      // Synchroniser chaque élément
      for (const item of posItems || []) {
        await this.syncCatalogItem(repairerId, 'product', item.id, {
          name: item.name,
          description: item.description,
          price: item.selling_price,
          category: item.category,
          stock_quantity: item.current_stock,
          images: []
        });
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation du catalogue POS:', error);
      throw error;
    }
  }

  static async syncCatalogItem(
    repairerId: string,
    catalogType: 'product' | 'service' | 'repair_type',
    itemId: string,
    itemData: any
  ): Promise<PosCatalogSync> {
    const { data, error } = await supabase
      .from('pos_catalog_sync')
      .upsert({
        repairer_id: repairerId,
        catalog_type: catalogType,
        item_id: itemId,
        item_data: itemData,
        sync_status: 'pending',
        last_synced_at: new Date().toISOString(),
        sync_errors: []
      })
      .select()
      .single();

    if (error) throw error;
    return data as PosCatalogSync;
  }

  static async getSyncStatus(repairerId: string): Promise<PosCatalogSync[]> {
    const { data, error } = await supabase
      .from('pos_catalog_sync')
      .select('*')
      .eq('repairer_id', repairerId)
      .order('last_synced_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PosCatalogSync[];
  }

  static async retryFailedSync(syncId: string): Promise<void> {
    const { error } = await supabase
      .from('pos_catalog_sync')
      .update({
        sync_status: 'pending',
        sync_errors: []
      })
      .eq('id', syncId);

    if (error) throw error;
  }

  static async generateAdsFromCatalog(repairerId: string, itemIds: string[]): Promise<void> {
    try {
      // Appeler l'edge function pour générer les publicités
      const { error } = await supabase.functions.invoke('generate-catalog-ads', {
        body: {
          repairer_id: repairerId,
          item_ids: itemIds
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la génération de publicités:', error);
      throw error;
    }
  }
}