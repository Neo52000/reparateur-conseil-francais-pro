
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Brand, DeviceModel } from '@/types/catalog';

interface BrandModelSectionProps {
  deviceBrand: string;
  deviceModel: string;
  brands: Brand[];
  filteredModels: DeviceModel[];
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
}

const BrandModelSection: React.FC<BrandModelSectionProps> = ({
  deviceBrand,
  deviceModel,
  brands,
  filteredModels,
  onBrandChange,
  onModelChange
}) => {
  console.log('🏷️ BrandModelSection render:', { 
    brandsCount: brands.length, 
    modelsCount: filteredModels.length,
    selectedBrand: deviceBrand,
    selectedModel: deviceModel
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="device_brand">Marque *</Label>
          <Select value={deviceBrand} onValueChange={onBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.length === 0 ? (
                <SelectItem value="loading" disabled>
                  Chargement des marques...
                </SelectItem>
              ) : (
                brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="device_model">Modèle *</Label>
          <Select 
            value={deviceModel} 
            onValueChange={onModelChange}
            disabled={!deviceBrand}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !deviceBrand 
                  ? "Sélectionnez d'abord une marque"
                  : filteredModels.length === 0
                  ? "Aucun modèle disponible"
                  : "Sélectionner un modèle"
              } />
            </SelectTrigger>
            <SelectContent>
              {!deviceBrand ? (
                <SelectItem value="select-brand" disabled>
                  Sélectionnez d'abord une marque
                </SelectItem>
              ) : filteredModels.length === 0 ? (
                <SelectItem value="no-models" disabled>
                  Aucun modèle disponible pour cette marque
                </SelectItem>
              ) : (
                filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.model_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message d'information si aucune marque n'est disponible */}
      {brands.length === 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            📱 Chargement des marques disponibles...
          </p>
        </div>
      )}

      {/* Message d'information si aucun modèle n'est disponible pour la marque sélectionnée */}
      {deviceBrand && filteredModels.length === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Aucun modèle disponible pour cette marque dans le type d'appareil sélectionné.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandModelSection;
