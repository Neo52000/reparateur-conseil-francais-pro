import { openDB, IDBPDatabase } from 'idb';

interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'customer' | 'inventory';
  data: any;
  timestamp: number;
  attempts: number;
  lastError?: string;
}

interface SyncConflict {
  id: string;
  localData: any;
  serverData: any;
  conflictType: 'update' | 'delete' | 'create';
  timestamp: number;
}

class AdvancedSyncService {
  private db: IDBPDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private conflicts: SyncConflict[] = [];
  private syncInProgress = false;
  private maxRetries = 3;

  async init() {
    this.db = await openDB('POSSyncDB', 1, {
      upgrade(db) {
        // Queue de synchronisation
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('type', 'type');
          queueStore.createIndex('timestamp', 'timestamp');
        }

        // Conflits de synchronisation
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('timestamp', 'timestamp');
        }

        // Cache différentiel
        if (!db.objectStoreNames.contains('deltaCache')) {
          const deltaStore = db.createObjectStore('deltaCache', { keyPath: 'id' });
          deltaStore.createIndex('lastSync', 'lastSync');
        }

        // Données locales
        if (!db.objectStoreNames.contains('localData')) {
          const localStore = db.createObjectStore('localData', { keyPath: 'id' });
          localStore.createIndex('type', 'type');
          localStore.createIndex('modified', 'modified');
        }
      }
    });

    // Charger la queue depuis IndexedDB
    await this.loadSyncQueue();
    
    // Démarrer la synchronisation automatique
    this.startAutoSync();
  }

  // Ajouter à la queue de synchronisation
  async addToSyncQueue(type: SyncQueueItem['type'], data: any) {
    const item: SyncQueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      attempts: 0
    };

    this.syncQueue.push(item);
    
    if (this.db) {
      await this.db.add('syncQueue', item);
    }

    // Tenter une synchronisation immédiate si en ligne
    if (navigator.onLine && !this.syncInProgress) {
      this.performSync();
    }
  }

  // Synchronisation différentielle
  async performDeltaSync() {
    if (!this.db || !navigator.onLine) return;

    try {
      // Récupérer le dernier timestamp de sync
      const lastSync = await this.getLastSyncTimestamp();
      
      // Demander seulement les changements depuis la dernière sync
      const response = await fetch('/api/pos/sync/delta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastSync,
          types: ['transactions', 'customers', 'inventory']
        })
      });

      if (!response.ok) throw new Error('Delta sync failed');

      const deltaData = await response.json();
      
      // Appliquer les changements et détecter les conflits
      await this.applyDeltaChanges(deltaData);
      
      // Sauvegarder le nouveau timestamp
      await this.saveLastSyncTimestamp(Date.now());

    } catch (error) {
      console.error('Delta sync error:', error);
    }
  }

  // Appliquer les changements avec détection de conflits
  private async applyDeltaChanges(deltaData: any) {
    for (const change of deltaData.changes) {
      const localData = await this.getLocalData(change.id);
      
      if (localData && localData.modified > change.serverModified) {
        // Conflit détecté
        await this.addConflict({
          id: change.id,
          localData,
          serverData: change.data,
          conflictType: change.type,
          timestamp: Date.now()
        });
      } else {
        // Pas de conflit, appliquer le changement
        await this.updateLocalData(change.id, change.data, change.serverModified);
      }
    }
  }

  // Résolution des conflits
  async resolveConflict(conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any) {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    let finalData;
    switch (resolution) {
      case 'local':
        finalData = conflict.localData;
        break;
      case 'server':
        finalData = conflict.serverData;
        break;
      case 'merge':
        finalData = mergedData || this.autoMerge(conflict.localData, conflict.serverData);
        break;
    }

    // Appliquer la résolution
    await this.updateLocalData(conflict.id, finalData, Date.now());
    
    // Ajouter à la queue de sync pour push vers serveur
    await this.addToSyncQueue('transaction', finalData);
    
    // Supprimer le conflit
    this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
    if (this.db) {
      await this.db.delete('conflicts', conflictId);
    }
  }

  // Fusion automatique intelligente
  private autoMerge(localData: any, serverData: any): any {
    // Logique de fusion basique - peut être étendue
    return {
      ...serverData,
      ...localData,
      mergedAt: Date.now(),
      conflictResolved: true
    };
  }

  // Synchronisation principale
  private async performSync() {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    
    try {
      // 1. Synchronisation différentielle (pull)
      await this.performDeltaSync();
      
      // 2. Push des éléments en queue
      await this.processSyncQueue();
      
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Traitement de la queue de sync
  private async processSyncQueue() {
    const pendingItems = [...this.syncQueue];
    
    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
        
        // Supprimer de la queue après succès
        this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
        if (this.db) {
          await this.db.delete('syncQueue', item.id);
        }
        
      } catch (error) {
        // Incrémenter les tentatives
        item.attempts++;
        item.lastError = error.message;
        
        if (item.attempts >= this.maxRetries) {
          // Déplacer vers les erreurs critiques
          console.error(`Sync failed after ${this.maxRetries} attempts:`, item);
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
        }
        
        if (this.db) {
          await this.db.put('syncQueue', item);
        }
      }
    }
  }

  // Synchroniser un élément individuel
  private async syncItem(item: SyncQueueItem) {
    const endpoint = `/api/pos/sync/${item.type}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Utilitaires
  private async loadSyncQueue() {
    if (!this.db) return;
    this.syncQueue = await this.db.getAll('syncQueue');
  }

  private async getLastSyncTimestamp(): Promise<number> {
    if (!this.db) return 0;
    const record = await this.db.get('deltaCache', 'lastSync');
    return record?.lastSync || 0;
  }

  private async saveLastSyncTimestamp(timestamp: number) {
    if (!this.db) return;
    await this.db.put('deltaCache', { id: 'lastSync', lastSync: timestamp });
  }

  private async getLocalData(id: string) {
    if (!this.db) return null;
    return this.db.get('localData', id);
  }

  private async updateLocalData(id: string, data: any, modified: number) {
    if (!this.db) return;
    await this.db.put('localData', { id, data, modified });
  }

  private async addConflict(conflict: SyncConflict) {
    this.conflicts.push(conflict);
    if (this.db) {
      await this.db.put('conflicts', conflict);
    }
  }

  // Synchronisation automatique
  private startAutoSync() {
    // Sync périodique
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.performSync();
      }
    }, 30000); // Toutes les 30 secondes

    // Sync au retour en ligne
    window.addEventListener('online', () => {
      setTimeout(() => this.performSync(), 1000);
    });
  }

  // API publique
  getConflicts() {
    return [...this.conflicts];
  }

  getSyncQueueStatus() {
    return {
      pending: this.syncQueue.length,
      inProgress: this.syncInProgress,
      conflicts: this.conflicts.length
    };
  }
}

export const syncService = new AdvancedSyncService();