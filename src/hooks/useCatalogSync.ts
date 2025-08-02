import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  id: string;
  total_items: number;
  synced_items: number;
  pending_items: number;
  error_items: number;
  auto_sync: boolean;
  sync_interval: number;
  last_sync: string | null;
}

interface CatalogItem {
  id: string;
  item_name: string;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  sync_status: string;
  last_sync: string | null;
}

export const useCatalogSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSyncData = async () => {
    if (!user) return;

    try {
      // Récupérer le statut de synchronisation
      const { data: statusData, error: statusError } = await supabase
        .from('catalog_sync_status')
        .select('*')
        .eq('repairer_id', user.id)
        .maybeSingle();

      if (statusError && statusError.code !== 'PGRST116') {
        throw statusError;
      }

      // Si pas de statut, en créer un
      if (!statusData) {
        const { data: newStatus, error: createError } = await supabase
          .from('catalog_sync_status')
          .insert({
            repairer_id: user.id,
            total_items: 0,
            synced_items: 0,
            pending_items: 0,
            error_items: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setSyncStatus(newStatus);
      } else {
        setSyncStatus(statusData);
      }

      // Récupérer les éléments du catalogue
      const { data: itemsData, error: itemsError } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setCatalogItems(itemsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données de synchronisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de synchronisation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    if (!user || !syncStatus) return;

    try {
      setLoading(true);
      
      // Simuler une synchronisation
      const { error } = await supabase
        .from('catalog_sync_status')
        .update({
          last_sync: new Date().toISOString(),
          pending_items: 0,
          synced_items: syncStatus.total_items,
          updated_at: new Date().toISOString()
        })
        .eq('id', syncStatus.id);

      if (error) throw error;

      toast({
        title: "Synchronisation lancée",
        description: "La synchronisation du catalogue a été démarrée"
      });

      await loadSyncData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lancer la synchronisation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (autoSync: boolean, syncInterval: number) => {
    if (!user || !syncStatus) return;

    try {
      const { error } = await supabase
        .from('catalog_sync_status')
        .update({
          auto_sync: autoSync,
          sync_interval: syncInterval,
          updated_at: new Date().toISOString()
        })
        .eq('id', syncStatus.id);

      if (error) throw error;

      await loadSyncData();
      
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de synchronisation ont été sauvegardés"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadSyncData();
    }
  }, [user]);

  return {
    syncStatus,
    catalogItems,
    loading,
    loadSyncData,
    triggerSync,
    updateSettings
  };
};