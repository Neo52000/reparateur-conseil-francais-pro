
import { useDeviceTypes } from './catalog/useDeviceTypes';
import { useBrands } from './catalog/useBrands';
import { useDeviceModels } from './catalog/useDeviceModels';
import { useRepairTypes } from './catalog/useRepairTypes';

export const useCatalog = () => {
  const deviceTypesHook = useDeviceTypes();
  const brandsHook = useBrands();
  const deviceModelsHook = useDeviceModels();
  const repairTypesHook = useRepairTypes();

  const loading = deviceTypesHook.loading || brandsHook.loading || deviceModelsHook.loading || repairTypesHook.loading;
  const error = deviceTypesHook.error || brandsHook.error || deviceModelsHook.error || repairTypesHook.error;

  const fetchAllData = async () => {
    await Promise.all([
      deviceTypesHook.refetch(),
      brandsHook.refetch(),
      deviceModelsHook.refetch(),
      repairTypesHook.refetch()
    ]);
  };

  return {
    // Data
    deviceTypes: deviceTypesHook.deviceTypes,
    brands: brandsHook.brands,
    deviceModels: deviceModelsHook.deviceModels,
    repairCategories: repairTypesHook.repairCategories,
    repairTypes: repairTypesHook.repairTypes,
    
    // State
    loading,
    error,
    
    // Actions
    fetchAllData,
    
    // Brand CRUD
    createBrand: brandsHook.createBrand,
    updateBrand: brandsHook.updateBrand,
    deleteBrand: brandsHook.deleteBrand,
    
    // Device Model CRUD
    createDeviceModel: deviceModelsHook.createDeviceModel,
    updateDeviceModel: deviceModelsHook.updateDeviceModel,
    deleteDeviceModel: deviceModelsHook.deleteDeviceModel,
    
    // Repair Type CRUD
    createRepairType: repairTypesHook.createRepairType,
    updateRepairType: repairTypesHook.updateRepairType,
    deleteRepairType: repairTypesHook.deleteRepairType
  };
};
