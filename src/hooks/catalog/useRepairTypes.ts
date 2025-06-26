
import { useState, useEffect } from 'react';
import { repairTypesService } from '@/services/catalog/repairTypesService';
import { repairCategoriesService } from '@/services/catalog/repairCategoriesService';
import type { RepairType, RepairCategory } from '@/types/catalog';

export const useRepairTypes = () => {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [repairCategories, setRepairCategories] = useState<RepairCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepairTypes = async () => {
    try {
      setLoading(true);
      const [typesData, categoriesData] = await Promise.all([
        repairTypesService.getAll(),
        repairCategoriesService.getAll()
      ]);
      setRepairTypes(typesData);
      setRepairCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching repair types:', err);
      setError('Erreur lors du chargement des types de réparation');
    } finally {
      setLoading(false);
    }
  };

  const createRepairType = async (repairType: Omit<RepairType, 'id' | 'created_at' | 'category'>) => {
    try {
      const newRepairType = await repairTypesService.create(repairType);
      await fetchRepairTypes();
      return newRepairType;
    } catch (err) {
      console.error('Error creating repair type:', err);
      throw new Error('Erreur lors de la création du type de réparation');
    }
  };

  const updateRepairType = async (id: string, updates: Partial<RepairType>) => {
    try {
      const updatedRepairType = await repairTypesService.update(id, updates);
      await fetchRepairTypes();
      return updatedRepairType;
    } catch (err) {
      console.error('Error updating repair type:', err);
      throw new Error('Erreur lors de la mise à jour du type de réparation');
    }
  };

  const deleteRepairType = async (id: string) => {
    try {
      await repairTypesService.delete(id);
      await fetchRepairTypes();
    } catch (err) {
      console.error('Error deleting repair type:', err);
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
