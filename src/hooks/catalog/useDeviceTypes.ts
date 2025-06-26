
import { useState, useEffect } from 'react';
import { deviceTypesService } from '@/services/catalog/deviceTypesService';
import type { DeviceType } from '@/types/catalog';

export const useDeviceTypes = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceTypes = async () => {
    try {
      setLoading(true);
      const data = await deviceTypesService.getAll();
      setDeviceTypes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching device types:', err);
      setError('Erreur lors du chargement des types d\'appareils');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  return {
    deviceTypes,
    loading,
    error,
    refetch: fetchDeviceTypes
  };
};
