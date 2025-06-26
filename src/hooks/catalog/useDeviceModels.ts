
import { useState, useEffect } from 'react';
import { deviceModelsService } from '@/services/catalog/deviceModelsService';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

export const useDeviceModels = () => {
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceModels = async () => {
    try {
      setLoading(true);
      const data = await deviceModelsService.getAll();
      setDeviceModels(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching device models:', err);
      setError('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const createDeviceModel = async (modelData: DeviceModelFormData) => {
    try {
      const newModel = await deviceModelsService.create(modelData);
      await fetchDeviceModels();
      return newModel;
    } catch (err) {
      console.error('Error creating device model:', err);
      throw new Error('Erreur lors de la création du modèle');
    }
  };

  const updateDeviceModel = async (id: string, modelData: DeviceModelFormData) => {
    try {
      const updatedModel = await deviceModelsService.update(id, modelData);
      await fetchDeviceModels();
      return updatedModel;
    } catch (err) {
      console.error('Error updating device model:', err);
      throw new Error('Erreur lors de la mise à jour du modèle');
    }
  };

  const deleteDeviceModel = async (id: string) => {
    try {
      await deviceModelsService.delete(id);
      await fetchDeviceModels();
    } catch (err) {
      console.error('Error deleting device model:', err);
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
