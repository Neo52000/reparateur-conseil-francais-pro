
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { RepairerCatalogService } from '@/services/pricing/repairerCatalogService';
import type { CatalogTreeNode, RepairerCatalogPreference, RepairerBrandSetting } from '@/types/repairerCatalog';

export const useRepairerCatalog = () => {
  const [catalogTree, setCatalogTree] = useState<CatalogTreeNode[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCatalog = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { catalogTree: tree, stats: catalogStats } = await RepairerCatalogService.getFullCatalogWithPreferences(user.id);
      
      setCatalogTree(tree);
      setStats(catalogStats);
    } catch (err) {
      console.error('Error fetching catalog:', err);
      setError('Erreur lors du chargement du catalogue');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le catalogue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCatalogPreference = async (
    entityType: 'brand' | 'device_model' | 'repair_type',
    entityId: string,
    updates: { is_active?: boolean; default_margin_percentage?: number; notes?: string }
  ) => {
    if (!user) return;
    
    try {
      await RepairerCatalogService.saveCatalogPreference({
        repairer_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        ...updates
      });
      
      toast({
        title: 'Préférence mise à jour',
        description: 'Vos paramètres ont été sauvegardés.',
      });
      
      await fetchCatalog();
    } catch (err) {
      console.error('Error updating preference:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences',
        variant: 'destructive',
      });
    }
  };

  const updateBrandSetting = async (
    brandId: string,
    updates: { is_active?: boolean; default_margin_percentage?: number }
  ) => {
    if (!user) return;
    
    try {
      await RepairerCatalogService.saveBrandSetting({
        repairer_id: user.id,
        brand_id: brandId,
        ...updates
      });
      
      toast({
        title: 'Paramètres de marque mis à jour',
        description: 'Vos paramètres de marque ont été sauvegardés.',
      });
      
      await fetchCatalog();
    } catch (err) {
      console.error('Error updating brand setting:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres de marque',
        variant: 'destructive',
      });
    }
  };

  const bulkUpdateItems = async (
    updates: Array<{
      entity_type: 'brand' | 'device_model' | 'repair_type';
      entity_id: string;
      is_active?: boolean;
      margin_percentage?: number;
    }>
  ) => {
    if (!user) return;
    
    try {
      await RepairerCatalogService.bulkUpdateCatalogItems(user.id, updates);
      
      toast({
        title: 'Mise à jour en masse réussie',
        description: `${updates.length} éléments mis à jour.`,
      });
      
      await fetchCatalog();
    } catch (err) {
      console.error('Error bulk updating items:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour en masse',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCatalog();
    }
  }, [user]);

  return {
    catalogTree,
    stats,
    loading,
    error,
    updateCatalogPreference,
    updateBrandSetting,
    bulkUpdateItems,
    refetch: fetchCatalog
  };
};
