/**
 * Service de gestion du mode hors ligne
 */

import { supabase } from '@/integrations/supabase/client';

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  userId: string;
}

interface OfflineData {
  transactions: any[];
  orders: any[];
  products: any[];
  customers: any[];
  lastSync: number;
}

class OfflineService {
  private dbName = 'RepairerProOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInProgress = false;

  constructor() {
    this.initDB();
    this.setupSyncListeners();
  }

  // Initialisation d'IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les actions en attente
        if (!db.objectStoreNames.contains('pendingActions')) {
          const pendingStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp');
          pendingStore.createIndex('userId', 'userId');
        }
        
        // Store pour les données mises en cache
        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
        }
        
        // Store pour la configuration hors ligne
        if (!db.objectStoreNames.contains('offlineConfig')) {
          db.createObjectStore('offlineConfig', { keyPath: 'key' });
        }
      };
    });
  }

  // Configuration des listeners de synchronisation
  private setupSyncListeners(): void {
    // Écouter les changements de statut réseau
    window.addEventListener('online', () => {
      console.log('🌐 Connexion rétablie');
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Passage en mode hors ligne');
      this.notifyOfflineMode();
    });

    // Synchronisation périodique
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncPendingActions();
      }
    }, 30000); // Toutes les 30 secondes
  }

  // Vérifier si en ligne
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Ajouter une action en attente
  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.initDB();
    
    const pendingAction: PendingAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    
    return new Promise((resolve, reject) => {
      const request = store.add(pendingAction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer les actions en attente
  async getPendingActions(userId?: string): Promise<PendingAction[]> {
    if (!this.db) await this.initDB();
    
    const transaction = this.db!.transaction(['pendingActions'], 'readonly');
    const store = transaction.objectStore('pendingActions');
    
    return new Promise((resolve, reject) => {
      const request = userId 
        ? store.index('userId').getAll(userId)
        : store.getAll();
        
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Synchroniser les actions en attente
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    console.log('🔄 Début de la synchronisation...');
    
    try {
      const pendingActions = await this.getPendingActions();
      console.log(`📦 ${pendingActions.length} actions à synchroniser`);
      
      for (const action of pendingActions) {
        try {
          await this.syncSingleAction(action);
          await this.removePendingAction(action.id);
          console.log(`✅ Action ${action.id} synchronisée`);
        } catch (error) {
          console.error(`❌ Erreur sync action ${action.id}:`, error);
        }
      }
      
      // Mettre à jour la date de dernière sync
      await this.updateLastSyncTime();
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    } finally {
      this.syncInProgress = false;
      console.log('✅ Synchronisation terminée');
    }
  }

  // Synchroniser une action individuelle
  private async syncSingleAction(action: PendingAction): Promise<void> {
    const { type, table, data } = action;
    
    switch (type) {
      case 'create':
        const { error: createError } = await supabase
          .from(table as any)
          .insert(data);
        if (createError) throw createError;
        break;
        
      case 'update':
        const { id, ...updateData } = data;
        const { error: updateError } = await supabase
          .from(table as any)
          .update(updateData)
          .eq('id', id);
        if (updateError) throw updateError;
        break;
        
      case 'delete':
        const { error: deleteError } = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
    }
  }

  // Supprimer une action en attente
  private async removePendingAction(actionId: string): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(actionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Mettre en cache des données
  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    
    const cacheEntry = {
      key,
      data,
      timestamp: Date.now()
    };
    
    const transaction = this.db!.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer des données mises en cache
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();
    
    const transaction = this.db!.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mettre à jour l'heure de dernière synchronisation
  private async updateLastSyncTime(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['offlineConfig'], 'readwrite');
    const store = transaction.objectStore('offlineConfig');
    
    const config = {
      key: 'lastSync',
      value: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(config);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Obtenir la dernière heure de synchronisation
  async getLastSyncTime(): Promise<number | null> {
    if (!this.db) await this.initDB();
    
    const transaction = this.db!.transaction(['offlineConfig'], 'readonly');
    const store = transaction.objectStore('offlineConfig');
    
    return new Promise((resolve, reject) => {
      const request = store.get('lastSync');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Notifier le passage en mode hors ligne
  private notifyOfflineMode(): void {
    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('offlineModeActivated'));
  }

  // Nettoyer les données anciennes
  async cleanup(olderThanDays: number = 7): Promise<void> {
    if (!this.db) await this.initDB();
    
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const transaction = this.db!.transaction(['pendingActions', 'cachedData'], 'readwrite');
    
    // Nettoyer les actions en attente anciennes
    const pendingStore = transaction.objectStore('pendingActions');
    const pendingIndex = pendingStore.index('timestamp');
    const pendingRange = IDBKeyRange.upperBound(cutoffTime);
    
    pendingIndex.openCursor(pendingRange).onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    // Nettoyer les données mises en cache anciennes
    const cacheStore = transaction.objectStore('cachedData');
    cacheStore.openCursor().onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value;
        if (data.timestamp < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // Obtenir des statistiques
  async getStats(): Promise<{
    pendingActions: number;
    cachedItems: number;
    lastSync: number | null;
  }> {
    const pendingActions = await this.getPendingActions();
    const lastSync = await this.getLastSyncTime();
    
    // Compter les éléments en cache
    let cachedItems = 0;
    if (this.db) {
      const transaction = this.db.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      
      cachedItems = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return {
      pendingActions: pendingActions.length,
      cachedItems,
      lastSync
    };
  }
}

export const offlineService = new OfflineService();