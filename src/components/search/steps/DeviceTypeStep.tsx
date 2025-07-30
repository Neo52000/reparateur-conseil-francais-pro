import React from 'react';
import { Card } from '@/components/ui/card';
import { useCatalog } from '@/hooks/useCatalog';
import { Smartphone, Tablet, Laptop, Watch, Gamepad2, MoreHorizontal } from 'lucide-react';
import type { SearchStepData } from '../AdvancedProductSearch';

interface DeviceTypeStepProps {
  searchData: Partial<SearchStepData>;
  onDataChange: (data: Partial<SearchStepData>) => void;
}

const DeviceTypeStep: React.FC<DeviceTypeStepProps> = ({
  searchData,
  onDataChange
}) => {
  const { deviceTypes, loading } = useCatalog();

  const getDeviceIcon = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('smartphone') || normalizedName.includes('téléphone')) {
      return Smartphone;
    } else if (normalizedName.includes('tablette') || normalizedName.includes('tablet')) {
      return Tablet;
    } else if (normalizedName.includes('ordinateur') || normalizedName.includes('laptop')) {
      return Laptop;
    } else if (normalizedName.includes('montre') || normalizedName.includes('watch')) {
      return Watch;
    } else if (normalizedName.includes('console') || normalizedName.includes('jeux')) {
      return Gamepad2;
    }
    return MoreHorizontal;
  };

  const handleSelect = (deviceType: any) => {
    onDataChange({
      deviceTypeId: deviceType.id,
      deviceTypeName: deviceType.name,
      // Reset suivantes étapes
      brandId: '',
      brandName: '',
      modelId: '',
      modelName: '',
      repairTypeId: '',
      repairTypeName: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des types de produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Quel type de produit souhaitez-vous réparer ?
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {deviceTypes.map((deviceType) => {
          const IconComponent = getDeviceIcon(deviceType.name);
          const isSelected = searchData.deviceTypeId === deviceType.id;
          
          return (
            <Card
              key={deviceType.id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(deviceType)}
            >
              <div className="text-center">
                <IconComponent 
                  className={`h-12 w-12 mx-auto mb-3 ${
                    isSelected ? 'text-primary' : 'text-gray-600'
                  }`} 
                />
                <h4 className={`font-medium ${
                  isSelected ? 'text-primary' : 'text-gray-900'
                }`}>
                  {deviceType.name}
                </h4>
                {deviceType.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {deviceType.description}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceTypeStep;