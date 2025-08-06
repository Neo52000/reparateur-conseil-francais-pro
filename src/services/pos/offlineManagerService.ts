import { supabase } from '@/integrations/supabase/client';

export interface OfflineOperation {
  id: string;
  repairer_id: string;
  operation_type: string;
  operation_data: any;
  priority: number; // 1=highest, 5=lowest
  sync_status: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  scheduled_sync_at: string;
  last_attempt_at?: string;
  synced_at?: string;
  error_message?: string;
  device_id?: string;
  session_id?: string;
}

export interface SyncStats {
  pending_operations: number;
  failed_operations: number;
  total_synced_today: number;
  last_sync_attempt?: string;
  sync_health_score: number;
}

export class OfflineManagerService {
  private static syncInProgress = false;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static onlineCallback?: () => void;
  private static offlineCallback?: () => void;

  /**
   * Initialiser le gestionnaire hors ligne
   */
  static initialize(repairerId: string): void {
    // Détecter les changements de connectivité
    window.addEventListener('online', () => {
      console.log('🌐 Connexion rétablie, démarrage de la synchronisation...');
      this.startAutoSync(repairerId);
      this.onlineCallback?.();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Mode hors ligne activé');
      this.stopAutoSync();
      this.offlineCallback?.();
    });

    // Démarrer la synchronisation automatique si en ligne
    if (navigator.onLine) {
      this.startAutoSync(repairerId);
    }
  }

  /**
   * Ajouter une opération à la queue hors ligne
   */
  static async addOfflineOperation(
    repairerId: string,
    operationType: string,
    operationData: any,
    priority: number = 3,
    deviceId?: string,
    sessionId?: string
  ): Promise<string> {
    try {
      // Si en ligne, essayer de synchroniser immédiatement
      if (navigator.onLine) {
        try {
          await this.executeOperation(operationType, operationData);
          return 'immediate_sync';
        } catch (error) {
          console.log('Synchronisation immédiate échouée, ajout à la queue:', error);
        }
      }

      const { data, error } = await supabase
        .from('pos_offline_operations')
        .insert({
          repairer_id: repairerId,
          operation_type: operationType,
          operation_data: operationData,
          priority,
          device_id: deviceId || this.getDeviceId(),
          session_id: sessionId || this.getSessionId(),
          scheduled_sync_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`📤 Opération ${operationType} ajoutée à la queue hors ligne`);
      return data.id;
    } catch (error) {
      console.error('Erreur ajout opération hors ligne:', error);
      
      // Fallback: stocker localement si la DB est inaccessible
      return await this.storeOperationLocally(repairerId, operationType, operationData, priority);
    }
  }

  /**
   * Synchroniser toutes les opérations en attente
   */
  static async syncPendingOperations(repairerId: string): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Synchronisation déjà en cours...');
      return { success: false, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      console.log('🔄 Démarrage de la synchronisation...');

      // Récupérer les opérations en attente par priorité
      const { data: operations, error } = await supabase
        .from('pos_offline_operations')
        .select('*')
        .eq('repairer_id', repairerId)
        .in('sync_status', ['pending', 'failed'])
        .order('priority')
        .order('created_at');

      if (error) throw error;

      if (!operations || operations.length === 0) {
        console.log('✅ Aucune opération à synchroniser');
        return { success: true, synced: 0, failed: 0 };
      }

      console.log(`📋 ${operations.length} opérations à synchroniser`);

      // Synchroniser chaque opération
      for (const operation of operations) {
        try {
          await this.syncOperation(operation as OfflineOperation);
          syncedCount++;
          console.log(`✅ Opération ${operation.id} synchronisée`);
        } catch (error) {
          failedCount++;
          console.error(`❌ Échec synchronisation ${operation.id}:`, error);
          await this.markOperationFailed(operation.id, error);
        }
      }

      // Synchroniser les données stockées localement
      await this.syncLocalStorageData(repairerId);

      console.log(`🏁 Synchronisation terminée: ${syncedCount} réussies, ${failedCount} échouées`);
      
      return { success: true, synced: syncedCount, failed: failedCount };
    } catch (error) {
      console.error('Erreur synchronisation globale:', error);
      return { success: false, synced: syncedCount, failed: failedCount };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtenir les statistiques de synchronisation
   */
  static async getSyncStats(repairerId: string): Promise<SyncStats> {
    try {
      const { data, error } = await supabase
        .from('pos_offline_operations')
        .select('sync_status, created_at, last_attempt_at')
        .eq('repairer_id', repairerId);

      if (error) throw error;

      const today = new Date().toDateString();
      const pending = data?.filter(op => op.sync_status === 'pending').length || 0;
      const failed = data?.filter(op => op.sync_status === 'failed').length || 0;
      const syncedToday = data?.filter(op => 
        op.sync_status === 'synced' && 
        new Date(op.created_at).toDateString() === today
      ).length || 0;

      const lastAttempt = data?.reduce((latest, op) => {
        if (!op.last_attempt_at) return latest;
        return !latest || new Date(op.last_attempt_at) > new Date(latest) 
          ? op.last_attempt_at 
          : latest;
      }, null as string | null);

      // Calculer un score de santé (0-100)
      const total = data?.length || 0;
      const healthScore = total === 0 ? 100 : Math.round((1 - (failed / total)) * 100);

      return {
        pending_operations: pending,
        failed_operations: failed,
        total_synced_today: syncedToday,
        last_sync_attempt: lastAttempt || undefined,
        sync_health_score: healthScore
      };
    } catch (error) {
      console.error('Erreur récupération stats sync:', error);
      return {
        pending_operations: 0,
        failed_operations: 0,
        total_synced_today: 0,
        sync_health_score: 0
      };
    }
  }

  /**
   * Nettoyer les anciennes opérations synchronisées
   */
  static async cleanupOldOperations(repairerId: string, olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await supabase
        .from('pos_offline_operations')
        .delete()
        .eq('repairer_id', repairerId)
        .eq('sync_status', 'synced')
        .lt('synced_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`🧹 ${deletedCount} anciennes opérations nettoyées`);
      
      return deletedCount;
    } catch (error) {
      console.error('Erreur nettoyage opérations:', error);
      return 0;
    }
  }

  /**
   * Configurer les callbacks de connectivité
   */
  static setConnectivityCallbacks(
    onOnline?: () => void,
    onOffline?: () => void
  ): void {
    this.onlineCallback = onOnline;
    this.offlineCallback = onOffline;
  }

  /**
   * Forcer une synchronisation immédiate
   */
  static async forceSyncNow(repairerId: string): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Synchronisation impossible en mode hors ligne');
    }

    await this.syncPendingOperations(repairerId);
  }

  // Méthodes privées

  private static startAutoSync(repairerId: string): void {
    this.stopAutoSync();
    
    // Synchronisation toutes les 30 secondes
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.syncInProgress) {
        await this.syncPendingOperations(repairerId);
      }
    }, 30000);
  }

  private static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private static async executeOperation(operationType: string, operationData: any): Promise<void> {
    switch (operationType) {
      case 'transaction':
        await this.syncTransaction(operationData);
        break;
      case 'customer_update':
        await this.syncCustomerUpdate(operationData);
        break;
      case 'inventory_update':
        await this.syncInventoryUpdate(operationData);
        break;
      case 'staff_action':
        await this.syncStaffAction(operationData);
        break;
      default:
        throw new Error(`Type d'opération non supporté: ${operationType}`);
    }
  }

  private static async syncOperation(operation: OfflineOperation): Promise<void> {
    // Marquer comme en cours de synchronisation
    await supabase
      .from('pos_offline_operations')
      .update({
        sync_status: 'syncing',
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', operation.id);

    try {
      await this.executeOperation(operation.operation_type, operation.operation_data);
      
      // Marquer comme synchronisé
      await supabase
        .from('pos_offline_operations')
        .update({
          sync_status: 'synced',
          synced_at: new Date().toISOString()
        })
        .eq('id', operation.id);
    } catch (error) {
      throw error;
    }
  }

  private static async markOperationFailed(operationId: string, error: any): Promise<void> {
    await supabase
      .from('pos_offline_operations')
      .update({
        sync_status: 'failed',
        error_message: error instanceof Error ? error.message : String(error),
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', operationId);
  }

  private static async syncTransaction(transactionData: any): Promise<void> {
    const { error } = await supabase
      .from('pos_transactions')
      .upsert(transactionData);
    
    if (error) throw error;
  }

  private static async syncCustomerUpdate(customerData: any): Promise<void> {
    const { error } = await supabase
      .from('pos_customers')
      .upsert(customerData);
    
    if (error) throw error;
  }

  private static async syncInventoryUpdate(inventoryData: any): Promise<void> {
    const { error } = await supabase
      .from('pos_inventory_items')
      .upsert(inventoryData);
    
    if (error) throw error;
  }

  private static async syncStaffAction(staffData: any): Promise<void> {
    // Synchroniser les actions du personnel selon le type
    switch (staffData.action_type) {
      case 'clock_in':
      case 'clock_out':
        // Implémenter la synchronisation des pointages
        break;
      case 'role_assignment':
        await supabase
          .from('pos_staff_assignments')
          .upsert(staffData.data);
        break;
      default:
        console.warn('Type d\'action personnel non reconnu:', staffData.action_type);
    }
  }

  private static getDeviceId(): string {
    let deviceId = localStorage.getItem('pos_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pos_device_id', deviceId);
    }
    return deviceId;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('pos_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      sessionStorage.setItem('pos_session_id', sessionId);
    }
    return sessionId;
  }

  private static async storeOperationLocally(
    repairerId: string,
    operationType: string,
    operationData: any,
    priority: number
  ): Promise<string> {
    const localOps = JSON.parse(localStorage.getItem('pos_offline_operations') || '[]');
    const operationId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    localOps.push({
      id: operationId,
      repairer_id: repairerId,
      operation_type: operationType,
      operation_data: operationData,
      priority,
      created_at: new Date().toISOString(),
      stored_locally: true
    });
    
    localStorage.setItem('pos_offline_operations', JSON.stringify(localOps));
    
    console.log('💾 Opération stockée localement:', operationId);
    return operationId;
  }

  private static async syncLocalStorageData(repairerId: string): Promise<void> {
    try {
      const localOps = JSON.parse(localStorage.getItem('pos_offline_operations') || '[]');
      
      for (const operation of localOps) {
        if (operation.repairer_id === repairerId) {
          try {
            // Transférer vers la base de données
            await supabase
              .from('pos_offline_operations')
              .insert({
                ...operation,
                id: undefined, // Laisser la DB générer un nouvel ID
                stored_locally: undefined
              });
            
            console.log('📤 Opération locale transférée:', operation.id);
          } catch (error) {
            console.error('Erreur transfert opération locale:', error);
          }
        }
      }
      
      // Nettoyer le stockage local après transfert
      const remainingOps = localOps.filter((op: any) => op.repairer_id !== repairerId);
      localStorage.setItem('pos_offline_operations', JSON.stringify(remainingOps));
      
    } catch (error) {
      console.error('Erreur synchronisation stockage local:', error);
    }
  }
}