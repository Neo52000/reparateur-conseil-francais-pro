import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryMovement {
  id: string;
  product_sku: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
}

export interface InventorySync {
  pos_stock: number;
  ecommerce_stock: number;
  product_sku: string;
  last_synced: string;
  sync_status: 'synced' | 'pending' | 'error';
}

export const useInventorySync = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, InventorySync>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data as InventoryMovement[] || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les mouvements d'inventaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at' | 'created_by'>) => {
    try {
      const { error } = await supabase
        .from('inventory_movements')
        .insert(movement);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Mouvement d'inventaire enregistré",
      });

      await fetchMovements();
      await checkSyncStatus(movement.product_sku);
    } catch (error) {
      console.error('Error adding movement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le mouvement",
        variant: "destructive",
      });
    }
  };

  const syncPOSToEcommerce = async (productSku: string) => {
    try {
      // Récupérer le stock POS
      const { data: posItem, error: posError } = await supabase
        .from('pos_inventory_items')
        .select('current_stock')
        .eq('sku', productSku)
        .single();

      if (posError) throw posError;

      // Mettre à jour le stock e-commerce
      const { error: ecomError } = await supabase
        .from('ecommerce_products')
        .update({
          stock_quantity: posItem.current_stock,
          stock_status: posItem.current_stock > 0 ? 'in_stock' : 'out_of_stock',
          last_synced_at: new Date().toISOString()
        })
        .eq('sku', productSku);

      if (ecomError) throw ecomError;

      // Enregistrer le mouvement de synchronisation
      await addMovement({
        product_sku: productSku,
        movement_type: 'adjustment',
        quantity: posItem.current_stock,
        reason: 'Synchronisation POS → E-commerce',
        reference_type: 'sync'
      });

      toast({
        title: "Succès",
        description: "Stock synchronisé POS → E-commerce",
      });

    } catch (error) {
      console.error('Error syncing POS to ecommerce:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la synchronisation",
        variant: "destructive",
      });
    }
  };

  const syncEcommerceToPOS = async (productSku: string) => {
    try {
      // Récupérer le stock e-commerce
      const { data: ecomItem, error: ecomError } = await supabase
        .from('ecommerce_products')
        .select('stock_quantity')
        .eq('sku', productSku)
        .single();

      if (ecomError) throw ecomError;

      // Mettre à jour le stock POS
      const { error: posError } = await supabase
        .from('pos_inventory_items')
        .update({
          current_stock: ecomItem.stock_quantity,
          synced_at: new Date().toISOString(),
          sync_source: 'ecommerce'
        })
        .eq('sku', productSku);

      if (posError) throw posError;

      // Enregistrer le mouvement de synchronisation
      await addMovement({
        product_sku: productSku,
        movement_type: 'adjustment',
        quantity: ecomItem.stock_quantity,
        reason: 'Synchronisation E-commerce → POS',
        reference_type: 'sync'
      });

      toast({
        title: "Succès",
        description: "Stock synchronisé E-commerce → POS",
      });

    } catch (error) {
      console.error('Error syncing ecommerce to POS:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la synchronisation",
        variant: "destructive",
      });
    }
  };

  const checkSyncStatus = async (productSku?: string) => {
    try {
      let query = supabase
        .from('pos_inventory_items')
        .select(`
          sku,
          current_stock,
          synced_at,
          ecommerce_products!inner(stock_quantity, last_synced_at)
        `);

      if (productSku) {
        query = query.eq('sku', productSku);
      }

      const { data, error } = await query;
      if (error) throw error;

      const statusMap: Record<string, InventorySync> = {};

      data?.forEach((item: any) => {
        const posStock = item.current_stock || 0;
        const ecomStock = item.ecommerce_products?.stock_quantity || 0;
        const lastSync = item.synced_at || item.ecommerce_products?.last_synced_at;

        statusMap[item.sku] = {
          pos_stock: posStock,
          ecommerce_stock: ecomStock,
          product_sku: item.sku,
          last_synced: lastSync || '',
          sync_status: posStock === ecomStock ? 'synced' : 'pending'
        };
      });

      setSyncStatus(statusMap);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const bulkSync = async (direction: 'pos_to_ecom' | 'ecom_to_pos') => {
    try {
      setLoading(true);
      const skusToSync = Object.keys(syncStatus).filter(
        sku => syncStatus[sku].sync_status === 'pending'
      );

      for (const sku of skusToSync) {
        if (direction === 'pos_to_ecom') {
          await syncPOSToEcommerce(sku);
        } else {
          await syncEcommerceToPOS(sku);
        }
      }

      toast({
        title: "Succès",
        description: `${skusToSync.length} produits synchronisés`,
      });

    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la synchronisation en masse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
    checkSyncStatus();
  }, []);

  return {
    movements,
    syncStatus,
    loading,
    addMovement,
    syncPOSToEcommerce,
    syncEcommerceToPOS,
    checkSyncStatus,
    bulkSync,
    refetch: fetchMovements,
  };
};