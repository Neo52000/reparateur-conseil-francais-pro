
import { useState, useEffect } from 'react';
import { repairTypesService } from '@/services/catalog/repairTypesService';
import { repairCategoriesService } from '@/services/catalog/repairCategoriesService';
import { useToast } from '@/hooks/use-toast';
import type { RepairType, RepairCategory } from '@/types/catalog';

export const useRepairTypes = () => {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [repairCategories, setRepairCategories] = useState<RepairCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepairTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching repair types...');
      const [typesData, categoriesData] = await Promise.all([
        repairTypesService.getAll(),
        repairCategoriesService.getAll()
      ]);
      console.log('Repair types fetched:', typesData);
      console.log('Repair categories fetched:', categoriesData);
      setRepairTypes(typesData);
      setRepairCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching repair types:', err);
      setError('Erreur lors du chargement des types de réparation');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les types de réparation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRepairType = async (repairType: Omit<RepairType, 'id' | 'created_at' | 'category'>) => {
    try {
      console.log('Creating repair type:', repairType);
      const newRepairType = await repairTypesService.create(repairType);
      console.log('Repair type created:', newRepairType);
      toast({
        title: 'Type de réparation créé',
        description: 'Le nouveau type de réparation a été créé avec succès.',
      });
      await fetchRepairTypes();
      return newRepairType;
    } catch (err) {
      console.error('Error creating repair type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du type de réparation',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la création du type de réparation');
    }
  };

  const updateRepairType = async (id: string, updates: Partial<RepairType>) => {
    try {
      console.log('Updating repair type:', id, updates);
      const updatedRepairType = await repairTypesService.update(id, updates);
      console.log('Repair type updated:', updatedRepairType);
      toast({
        title: 'Type de réparation modifié',
        description: 'Le type de réparation a été mis à jour avec succès.',
      });
      await fetchRepairTypes();
      return updatedRepairType;
    } catch (err) {
      console.error('Error updating repair type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du type de réparation',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la mise à jour du type de réparation');
    }
  };

  const deleteRepairType = async (id: string) => {
    try {
      console.log('Deleting repair type:', id);
      await repairTypesService.delete(id);
      console.log('Repair type deleted');
      toast({
        title: 'Type de réparation supprimé',
        description: 'Le type de réparation a été supprimé avec succès.',
      });
      await fetchRepairTypes();
    } catch (err) {
      console.error('Error deleting repair type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du type de réparation',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la suppression du type de réparation');
    }
  };

  useEffect(() => {
    fetchRepairTypes();
  }, []);

  return {
    repairTypes,
    repairCategories,
    loading,
    error,
    createRepairType,
    updateRepairType,
    deleteRepairType,
    refetch: fetchRepairTypes
  };
};
