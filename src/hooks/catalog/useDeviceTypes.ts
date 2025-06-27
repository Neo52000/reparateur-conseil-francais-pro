
import { useState, useEffect } from 'react';
import { deviceTypesService } from '@/services/catalog/deviceTypesService';
import { useToast } from '@/hooks/use-toast';
import type { DeviceType } from '@/types/catalog';

export const useDeviceTypes = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeviceTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deviceTypesService.getAll();
      setDeviceTypes(data);
    } catch (err) {
      console.error('Error fetching device types:', err);
      setError('Erreur lors du chargement des types d\'appareils');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les types d\'appareils',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDeviceType = async (deviceType: Omit<DeviceType, 'id' | 'created_at'>) => {
    try {
      console.log('Creating device type:', deviceType);
      const newDeviceType = await deviceTypesService.create(deviceType);
      console.log('Device type created:', newDeviceType);
      toast({
        title: 'Type d\'appareil créé',
        description: 'Le nouveau type d\'appareil a été créé avec succès.',
      });
      await fetchDeviceTypes();
      return newDeviceType;
    } catch (err) {
      console.error('Error creating device type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du type d\'appareil',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la création du type d\'appareil');
    }
  };

  const updateDeviceType = async (id: string, updates: Partial<DeviceType>) => {
    try {
      console.log('Updating device type:', id, updates);
      const updatedDeviceType = await deviceTypesService.update(id, updates);
      console.log('Device type updated:', updatedDeviceType);
      toast({
        title: 'Type d\'appareil modifié',
        description: 'Le type d\'appareil a été mis à jour avec succès.',
      });
      await fetchDeviceTypes();
      return updatedDeviceType;
    } catch (err) {
      console.error('Error updating device type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du type d\'appareil',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la mise à jour du type d\'appareil');
    }
  };

  const deleteDeviceType = async (id: string) => {
    try {
      console.log('Deleting device type:', id);
      await deviceTypesService.delete(id);
      console.log('Device type deleted');
      toast({
        title: 'Type d\'appareil supprimé',
        description: 'Le type d\'appareil a été supprimé avec succès.',
      });
      await fetchDeviceTypes();
    } catch (err) {
      console.error('Error deleting device type:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du type d\'appareil',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la suppression du type d\'appareil');
    }
  };

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  return {
    deviceTypes,
    loading,
    error,
    createDeviceType,
    updateDeviceType,
    deleteDeviceType,
    refetch: fetchDeviceTypes
  };
};
