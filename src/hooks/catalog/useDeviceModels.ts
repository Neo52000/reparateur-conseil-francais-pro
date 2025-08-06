
import { useState, useEffect } from 'react';
import { deviceModelsService } from '@/services/catalog/deviceModelsService';
import { useToast } from '@/hooks/use-toast';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

export const useDeviceModels = () => {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeviceModels = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching device models...');
      const data = await deviceModelsService.getAll();
      console.log('Device models fetched:', data.length, 'models');
      console.log('Sample models:', data.slice(0, 3));
      setDeviceModels(data);
    } catch (err) {
      console.error('Error fetching device models:', err);
      setError('Erreur lors du chargement des modèles');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les modèles d\'appareils',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeviceModel = async (modelData: DeviceModelFormData) => {
    try {
      console.log('Creating device model:', modelData);
      const newModel = await deviceModelsService.create(modelData);
      console.log('Device model created:', newModel);
      toast({
        title: 'Modèle créé',
        description: 'Le nouveau modèle a été créé avec succès.',
      });
      await fetchDeviceModels();
      return newModel;
    } catch (err) {
      console.error('Error creating device model:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du modèle',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la création du modèle');
    }
  };

  const updateDeviceModel = async (id: string, modelData: DeviceModelFormData) => {
    try {
      console.log('Updating device model:', id, modelData);
      const updatedModel = await deviceModelsService.update(id, modelData);
      console.log('Device model updated:', updatedModel);
      toast({
        title: 'Modèle modifié',
        description: 'Le modèle a été mis à jour avec succès.',
      });
      await fetchDeviceModels();
      return updatedModel;
    } catch (err) {
      console.error('Error updating device model:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du modèle',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la mise à jour du modèle');
    }
  };

  const deleteDeviceModel = async (id: string) => {
    try {
      console.log('Deleting device model:', id);
      await deviceModelsService.delete(id);
      console.log('Device model deleted');
      toast({
        title: 'Modèle supprimé',
        description: 'Le modèle a été supprimé avec succès.',
      });
      await fetchDeviceModels();
    } catch (err) {
      console.error('Error deleting device model:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du modèle',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la suppression du modèle');
    }
  };

  useEffect(() => {
    fetchDeviceModels();
  }, []);

  return {
    deviceModels,
    loading,
    error,
    createDeviceModel,
    updateDeviceModel,
    deleteDeviceModel,
    refetch: fetchDeviceModels
  };
};
