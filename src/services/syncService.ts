import { supabase } from '@/integrations/supabase/client';

/**
 * Service de synchronisation bi-directionnelle entre Dashboard, POS et E-commerce
 * Gère la propagation des changements entre les différents modules
 */

export interface SyncOperation {
  id: string;
  entity_type: 'appointment' | 'repair' | 'inventory' | 'customer' | 'product' | 'order';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  source: 'dashboard' | 'pos' | 'ecommerce';
  target: 'dashboard' | 'pos' | 'ecommerce';
}

class SyncService {
  private repairer_id: string | null = null;

  setRepairerId(id: string) {
    this.repairer_id = id;
  }

  /**
   * Synchroniser un changement d'inventaire depuis le POS vers Dashboard et E-commerce
   */
  async syncInventoryFromPOS(inventoryItem: any) {
    if (!this.repairer_id) return;

    try {
      // Log de synchronisation
      await this.logSync({
        sync_type: 'pos_to_dashboard',
        entity_type: 'inventory',
        entity_id: inventoryItem.id,
        operation: 'update',
        after_data: inventoryItem
      });

      // Synchroniser vers E-commerce si le module est actif
      const hasEcommerce = await this.hasModuleAccess('ecommerce');
      if (hasEcommerce) {
        await this.syncInventoryToEcommerce(inventoryItem);
      }

      console.log(`✅ [Sync] Inventaire ${inventoryItem.sku} synchronisé`);
    } catch (error) {
      console.error('❌ [Sync] Erreur synchronisation inventaire:', error);
    }
  }

  /**
   * Synchroniser l'inventaire vers l'e-commerce
   */
  private async syncInventoryToEcommerce(inventoryItem: any) {
    if (!this.repairer_id) return;

    try {
      // Vérifier si le produit existe en e-commerce
      const { data: existingProduct } = await supabase
        .from('ecommerce_products')
        .select('id')
        .eq('repairer_id', this.repairer_id)
        .eq('sku', inventoryItem.sku)
        .single();

      if (existingProduct) {
        // Mettre à jour le stock du produit e-commerce
        await supabase
          .from('ecommerce_products')
          .update({
            stock_quantity: inventoryItem.current_stock,
            stock_status: inventoryItem.current_stock > 0 ? 'in_stock' : 'out_of_stock',
            price: inventoryItem.selling_price,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', existingProduct.id);

        console.log(`📦 [Sync] Produit e-commerce ${inventoryItem.sku} mis à jour`);
      }
    } catch (error) {
      console.error('❌ [Sync] Erreur sync vers e-commerce:', error);
    }
  }

  /**
   * Synchroniser un rendez-vous depuis le site vers le POS
   */
  async syncAppointmentToPOS(appointment: any) {
    if (!this.repairer_id) return;

    try {
      // Log de synchronisation
      await this.logSync({
        sync_type: 'dashboard_to_pos',
        entity_type: 'appointment',
        entity_id: appointment.id,
        operation: 'create',
        after_data: appointment
      });

      console.log(`📅 [Sync] Rendez-vous ${appointment.id} synchronisé vers POS`);
    } catch (error) {
      console.error('❌ [Sync] Erreur synchronisation rendez-vous:', error);
    }
  }

  /**
   * Synchroniser une commande e-commerce vers le POS
   */
  async syncEcommerceOrderToPOS(order: any) {
    if (!this.repairer_id) return;

    try {
      // Créer une transaction POS pour la commande e-commerce
      const { data: session } = await supabase
        .from('pos_sessions')
        .select('id')
        .eq('repairer_id', this.repairer_id)
        .eq('status', 'active')
        .single();

      if (session) {
        // Générer un numéro de transaction
        const { data: transactionNumber } = await supabase
          .rpc('generate_transaction_number', { repairer_id: this.repairer_id });

        const { error } = await supabase
          .from('pos_transactions')
          .insert({
            session_id: session.id,
            repairer_id: this.repairer_id,
            transaction_number: transactionNumber,
            transaction_type: 'sale',
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            subtotal: order.subtotal,
            tax_amount: order.tax_amount,
            total_amount: order.total_amount,
            payment_method: 'card',
            payment_status: order.payment_status === 'paid' ? 'paid' : 'pending'
          });

        if (!error) {
          console.log(`🛒 [Sync] Commande e-commerce ${order.order_number} synchronisée vers POS`);
        }
      }

      // Log de synchronisation
      await this.logSync({
        sync_type: 'ecommerce_to_pos',
        entity_type: 'order',
        entity_id: order.id,
        operation: 'create',
        after_data: order
      });

    } catch (error) {
      console.error('❌ [Sync] Erreur synchronisation commande:', error);
    }
  }

  /**
   * Récupérer les logs de synchronisation
   */
  async getSyncLogs(limit: number = 50) {
    if (!this.repairer_id) return [];

    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('repairer_id', this.repairer_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [Sync] Erreur récupération logs:', error);
      return [];
    }
  }

  /**
   * Récupérer la queue de synchronisation hors ligne
   */
  async getOfflineQueue() {
    if (!this.repairer_id) return [];

    try {
      const { data, error } = await supabase
        .from('offline_sync_queue')
        .select('*')
        .eq('repairer_id', this.repairer_id)
        .eq('sync_status', 'queued')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [Sync] Erreur récupération queue:', error);
      return [];
    }
  }

  /**
   * Traiter la queue de synchronisation hors ligne
   */
  async processOfflineQueue() {
    if (!this.repairer_id) return;

    try {
      const queue = await this.getOfflineQueue();
      
      for (const item of queue) {
        try {
          // Marquer comme en cours de traitement
          await supabase
            .from('offline_sync_queue')
            .update({ sync_status: 'syncing' })
            .eq('id', item.id);

          // Traiter selon le type d'entité
          await this.processQueueItem(item);

          // Marquer comme synchronisé
          await supabase
            .from('offline_sync_queue')
            .update({ sync_status: 'synced' })
            .eq('id', item.id);

        } catch (error) {
          // Incrémenter le compteur de retry
          const newRetryCount = (item.retry_count || 0) + 1;
          const nextRetry = new Date(Date.now() + Math.pow(2, newRetryCount) * 60000); // Backoff exponentiel

          if (newRetryCount >= item.max_retries) {
            await supabase
              .from('offline_sync_queue')
              .update({ 
                sync_status: 'failed',
                error_message: error.message
              })
              .eq('id', item.id);
          } else {
            await supabase
              .from('offline_sync_queue')
              .update({ 
                retry_count: newRetryCount,
                next_retry_at: nextRetry.toISOString(),
                last_attempt_at: new Date().toISOString(),
                error_message: error.message
              })
              .eq('id', item.id);
          }
        }
      }

      console.log(`✅ [Sync] ${queue.length} éléments de la queue traités`);
    } catch (error) {
      console.error('❌ [Sync] Erreur traitement queue:', error);
    }
  }

  /**
   * Traiter un élément spécifique de la queue
   */
  private async processQueueItem(item: any) {
    const { entity_type, entity_data, operation_type } = item;

    switch (entity_type) {
      case 'transaction':
        if (operation_type === 'create') {
          await this.syncOfflineTransaction(entity_data);
        }
        break;
      
      case 'inventory_adjustment':
        await this.syncOfflineInventoryAdjustment(entity_data);
        break;

      case 'customer':
        if (operation_type === 'create') {
          await this.syncOfflineCustomer(entity_data);
        }
        break;
    }
  }

  /**
   * Synchroniser une transaction créée hors ligne
   */
  private async syncOfflineTransaction(transactionData: any) {
    const { error } = await supabase
      .from('pos_transactions')
      .insert(transactionData);

    if (error) throw error;
  }

  /**
   * Synchroniser un ajustement d'inventaire fait hors ligne
   */
  private async syncOfflineInventoryAdjustment(adjustmentData: any) {
    const { error } = await supabase
      .from('pos_inventory_items')
      .update({
        current_stock: adjustmentData.new_stock,
        synced_at: new Date().toISOString()
      })
      .eq('id', adjustmentData.inventory_id);

    if (error) throw error;
  }

  /**
   * Synchroniser un client créé hors ligne
   */
  private async syncOfflineCustomer(customerData: any) {
    const { error } = await supabase
      .from('ecommerce_customers')
      .insert({
        repairer_id: this.repairer_id,
        ...customerData
      });

    if (error) throw error;
  }

  /**
   * Vérifier si un module est actif
   */
  private async hasModuleAccess(moduleType: 'pos' | 'ecommerce'): Promise<boolean> {
    if (!this.repairer_id) return false;

    try {
      const { data } = await supabase
        .from('module_subscriptions')
        .select('module_active')
        .eq('repairer_id', this.repairer_id)
        .eq('module_type', moduleType)
        .eq('module_active', true)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Logger une opération de synchronisation
   */
  private async logSync(params: {
    sync_type: string;
    entity_type: string;
    entity_id: string;
    operation: string;
    before_data?: any;
    after_data?: any;
  }) {
    if (!this.repairer_id) return;

    await supabase
      .from('sync_logs')
      .insert({
        repairer_id: this.repairer_id,
        ...params,
        sync_status: 'success'
      });
  }
}

// Instance singleton
export const syncService = new SyncService();