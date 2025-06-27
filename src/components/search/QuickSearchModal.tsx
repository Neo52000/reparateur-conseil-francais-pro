
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, MapPin, Smartphone } from 'lucide-react';
import { useBrands } from '@/hooks/catalog/useBrands';
import { useDeviceModels } from '@/hooks/catalog/useDeviceModels';
import { useRepairTypes } from '@/hooks/catalog/useRepairTypes';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  brand: string;
  model: string;
  repairType: string;
  location: string;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRepairType, setSelectedRepairType] = useState('');
  const [location, setLocation] = useState('');

  const { brands } = useBrands();
  const { deviceModels } = useDeviceModels();
  const { repairTypes } = useRepairTypes();

  const filteredModels = deviceModels.filter(model => model.brand_id === selectedBrand);
  const filteredRepairTypes = repairTypes.filter(type => type.is_active);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel('');
    setStep(2);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setStep(3);
  };

  const handleRepairTypeSelect = (repairTypeId: string) => {
    setSelectedRepairType(repairTypeId);
    setStep(4);
  };

  const handleSearch = () => {
    if (selectedBrand && selectedModel && selectedRepairType && location) {
      onSearch({
        brand: selectedBrand,
        model: selectedModel,
        repairType: selectedRepairType,
        location
      });
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedRepairType('');
    setLocation('');
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) setSelectedModel('');
      if (step === 3) setSelectedRepairType('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="h-6 w-6 mr-2 text-blue-600" />
            Recherche rapide - Étape {step}/4
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Brand Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sélectionnez la marque</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {brands.map((brand) => (
                  <Card
                    key={brand.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                    onClick={() => handleBrandSelect(brand.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="h-12 w-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{brand.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Model Selection */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sélectionnez le modèle</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredModels.map((model) => (
                  <Card
                    key={model.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{model.model_name}</p>
                      <p className="text-sm text-gray-500">{model.release_date}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Repair Type Selection */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Type de réparation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredRepairTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => handleRepairTypeSelect(type.id)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {type.difficulty_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{type.estimated_time_minutes || 60}min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Localisation</h3>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ville ou code postal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        setLocation(`${position.coords.latitude},${position.coords.longitude}`);
                      });
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Utiliser ma position actuelle
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 1 && (
              <Button onClick={goBack} variant="outline">
                Retour
              </Button>
            )}
            <div className="ml-auto">
              {step < 4 ? (
                <Button disabled className="opacity-50">
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSearch}
                  disabled={!location}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Rechercher des réparateurs
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSearchModal;
