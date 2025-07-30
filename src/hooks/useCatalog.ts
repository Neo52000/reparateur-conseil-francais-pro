
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

  // Fonction pour vérifier si un modèle existe déjà
  const checkModelExists = (modelName: string, brandId: string, deviceTypeId: string) => {
    return deviceModelsHook.deviceModels.some(model => 
      model.model_name.toLowerCase().trim() === modelName.toLowerCase().trim() &&
      model.brand_id === brandId &&
      model.device_type_id === deviceTypeId
    );
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
    checkModelExists,
    
    // Device Types CRUD
    createDeviceType: deviceTypesHook.createDeviceType,
    updateDeviceType: deviceTypesHook.updateDeviceType,
    deleteDeviceType: deviceTypesHook.deleteDeviceType,
    
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
