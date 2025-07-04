import { useState, useEffect } from 'react';
import { offlineService } from '@/services/offlineService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UseOfflineSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

export const useOfflineSync = (options: UseOfflineSyncOptions = {}) => {
  const { autoSync = true, syncInterval = 30000 } = options;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [stats, setStats] = useState({
    pendingActions: 0,
    cachedItems: 0,
    lastSync: null as number | null
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Mettre à jour le statut en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const newStats = await offlineService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Synchronisation automatique
  useEffect(() => {
    if (!autoSync || !user) return;

    const interval = setInterval(async () => {
      if (isOnline && !syncInProgress) {
        await syncPendingActions();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, syncInProgress, user, syncInterval]);

  // Charger les stats au montage et périodiquement
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Synchroniser les actions en attente
  const syncPendingActions = async () => {
    if (!isOnline || syncInProgress || !user) return;

    setSyncInProgress(true);
    try {
      await offlineService.syncPendingActions();
      await loadStats();
      return true;
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      return false;
    } finally {
      setSyncInProgress(false);
    }
  };

  // Ajouter une action hors ligne
  const addOfflineAction = async (
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await offlineService.addPendingAction({
        type,
        table,
        data,
        userId: user.id
      });
      
      // Recharger les stats
      await loadStats();
      
      // Notifier l'utilisateur
      if (!isOnline) {
        toast({
          title: "Action sauvegardée",
          description: "L'action sera synchronisée au retour en ligne",
          duration: 3000
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur ajout action offline:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder l'action hors ligne",
        variant: "destructive"
      });
      return false;
    }
  };

  // Mettre en cache des données
  const cacheData = async (key: string, data: any) => {
    try {
      await offlineService.cacheData(key, data);
      await loadStats();
      return true;
    } catch (error) {
      console.error('Erreur mise en cache:', error);
      return false;
    }
  };

  // Récupérer des données mises en cache
  const getCachedData = async (key: string) => {
    try {
      return await offlineService.getCachedData(key);
    } catch (error) {
      console.error('Erreur récupération cache:', error);
      return null;
    }
  };

  // Nettoyer les données anciennes
  const cleanup = async (olderThanDays: number = 7) => {
    try {
      await offlineService.cleanup(olderThanDays);
      await loadStats();
      return true;
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      return false;
    }
  };

  return {
    // État
    isOnline,
    syncInProgress,
    stats,
    
    // Actions
    syncPendingActions,
    addOfflineAction,
    cacheData,
    getCachedData,
    cleanup,
    loadStats,
    
    // Utilitaires
    hasPendingActions: stats.pendingActions > 0,
    isOfflineCapable: true
  };
};