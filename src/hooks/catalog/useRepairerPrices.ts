
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { RepairerCustomPricesService } from '@/services/pricing/repairerCustomPricesService';
import { BulkMarginService } from '@/services/pricing/bulkMarginService';
import type { RepairerCustomPrice, CreateCustomPriceData, UpdateCustomPriceData } from '@/types/repairerPricing';
import type { RepairPrice } from '@/types/catalog';

export const useRepairerPrices = () => {
  const [repairerPrices, setRepairerPrices] = useState<RepairerCustomPrice[]>([]);
  const [basePrices, setBasePrices] = useState<RepairPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRepairerPrices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { customPrices, basePrices: fetchedBasePrices } = await RepairerCustomPricesService.fetchRepairerPrices(user.id);
      
      setRepairerPrices(customPrices);
      setBasePrices(fetchedBasePrices);
    } catch (err) {
      console.error('Error fetching repairer prices:', err);
      setError('Erreur lors du chargement des prix personnalisés');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos prix personnalisés',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomPrice = async (customPriceData: CreateCustomPriceData) => {
    if (!user) return;
    
    try {
      await RepairerCustomPricesService.createCustomPrice(user.id, customPriceData);
      
      toast({
        title: 'Prix personnalisé créé',
        description: 'Votre tarif personnalisé a été créé avec succès.',
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error creating custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la création du prix personnalisé');
    }
  };

  const updateCustomPrice = async (id: string, updates: UpdateCustomPriceData) => {
    try {
      await RepairerCustomPricesService.updateCustomPrice(id, updates);
      
      toast({
        title: 'Prix personnalisé modifié',
        description: 'Votre tarif a été mis à jour avec succès.',
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error updating custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la mise à jour du prix personnalisé');
    }
  };

  const deleteCustomPrice = async (id: string) => {
    try {
      await RepairerCustomPricesService.deleteCustomPrice(id);
      
      toast({
        title: 'Prix personnalisé supprimé',
        description: 'Votre tarif personnalisé a été supprimé avec succès.',
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error deleting custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la suppression du prix personnalisé');
    }
  };

  const bulkApplyMargin = async (margin: number, priceIds?: string[]) => {
    if (!user) return;
    
    try {
      const updatedCount = await BulkMarginService.applyMarginToMultiplePrices(
        user.id,
        margin,
        repairerPrices,
        priceIds
      );

      toast({
        title: 'Marge appliquée',
        description: `Marge de ${margin}% appliquée à ${updatedCount} prix.`,
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error applying bulk margin:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'application de la marge',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de l\'application de la marge');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRepairerPrices();
    }
  }, [user]);

  return {
    repairerPrices,
    basePrices,
    loading,
    error,
    createCustomPrice,
    updateCustomPrice,
    deleteCustomPrice,
    bulkApplyMargin,
    refetch: fetchRepairerPrices
  };
};
