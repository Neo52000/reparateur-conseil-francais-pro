
import { useState, useEffect } from 'react';
import { brandsService } from '@/services/catalog/brandsService';
import type { Brand } from '@/types/catalog';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandsService.getAll();
      setBrands(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Erreur lors du chargement des marques');
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (brand: Omit<Brand, 'id' | 'created_at'>) => {
    try {
      const newBrand = await brandsService.create(brand);
      await fetchBrands();
      return newBrand;
    } catch (err) {
      console.error('Error creating brand:', err);
      throw new Error('Erreur lors de la création de la marque');
    }
  };

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      const updatedBrand = await brandsService.update(id, updates);
      await fetchBrands();
      return updatedBrand;
    } catch (err) {
      console.error('Error updating brand:', err);
      throw new Error('Erreur lors de la mise à jour de la marque');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      await brandsService.delete(id);
      await fetchBrands();
    } catch (err) {
      console.error('Error deleting brand:', err);
      throw new Error('Erreur lors de la suppression de la marque');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands
  };
};
