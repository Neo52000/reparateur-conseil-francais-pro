
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Smartphone, Loader2 } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import type { DeviceType, Brand, DeviceModel, RepairType } from '@/types/catalog';

interface SearchModeSelectorProps {
  onQuickSearch: () => void;
  onMapSearch: () => void;
}

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  const { deviceTypes, brands, deviceModels, repairTypes, loading } = useCatalog();
  
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedRepairType, setSelectedRepairType] = useState<string>('');

  // Filtered data based on selections
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [filteredModels, setFilteredModels] = useState<DeviceModel[]>([]);
  const [filteredRepairTypes, setFilteredRepairTypes] = useState<RepairType[]>([]);

  // Update filtered brands when device type changes
  useEffect(() => {
    if (selectedDeviceType && deviceModels.length > 0) {
      const modelsForType = deviceModels.filter(model => 
        model.device_type_id === selectedDeviceType
      );
      const brandIds = [...new Set(modelsForType.map(model => model.brand_id))];
      const availableBrands = brands.filter(brand => brandIds.includes(brand.id));
      setFilteredBrands(availableBrands);
    } else {
      setFilteredBrands([]);
    }
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedRepairType('');
  }, [selectedDeviceType, deviceModels, brands]);

  // Update filtered models when brand changes
  useEffect(() => {
    if (selectedBrand && selectedDeviceType) {
      const modelsForBrand = deviceModels.filter(model => 
        model.brand_id === selectedBrand && model.device_type_id === selectedDeviceType
      );
      setFilteredModels(modelsForBrand);
    } else {
      setFilteredModels([]);
    }
    setSelectedModel('');
    setSelectedRepairType('');
  }, [selectedBrand, selectedDeviceType, deviceModels]);

  // Update filtered repair types when model changes
  useEffect(() => {
    if (selectedModel && repairTypes.length > 0) {
      // For now, show all repair types. In a real scenario, you might filter based on compatibility
      setFilteredRepairTypes(repairTypes);
    } else {
      setFilteredRepairTypes([]);
    }
    setSelectedRepairType('');
  }, [selectedModel, repairTypes]);

  const handleQuickSearch = () => {
    if (selectedDeviceType && selectedBrand && selectedModel && selectedRepairType) {
      // Pass the search criteria
      console.log('Search criteria:', {
        deviceType: selectedDeviceType,
        brand: selectedBrand,
        model: selectedModel,
        repairType: selectedRepairType
      });
      onQuickSearch();
    }
  };

  const isSearchReady = selectedDeviceType && selectedBrand && selectedModel && selectedRepairType;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Les meilleurs réparateurs proche de chez vous
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Recherche rapide
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Chargement du catalogue...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Device Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de produit
                  </label>
                  <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={!selectedDeviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.model_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Repair Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de panne
                  </label>
                  <Select value={selectedRepairType} onValueChange={setSelectedRepairType} disabled={!selectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une panne" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRepairTypes.map((repairType) => (
                        <SelectItem key={repairType.id} value={repairType.id}>
                          {repairType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleQuickSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-6"
                  size="lg"
                  disabled={!isSearchReady}
                >
                  Rechercher des réparateurs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Carte interactive
              </h3>
              
              <p className="text-gray-600 mb-6 text-lg">
                Explorez les réparateurs près de chez vous sur une carte géolocalisée
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>Géolocalisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Visuel</span>
                </div>
              </div>
              
              <Button 
                onClick={onMapSearch}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                size="lg"
              >
                Voir la carte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchModeSelector;
