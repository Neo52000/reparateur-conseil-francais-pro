
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="device_brand">Marque *</Label>
        <Select value={deviceBrand} onValueChange={onBrandChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une marque" />
          </SelectTrigger>
          <SelectContent>
            {brands.length === 0 ? (
              <SelectItem value="" disabled>
                Aucune marque disponible
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
          disabled={!deviceBrand || filteredModels.length === 0}
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
            {filteredModels.length === 0 ? (
              <SelectItem value="" disabled>
                {!deviceBrand ? "Sélectionnez d'abord une marque" : "Aucun modèle disponible"}
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
  );
};

export default BrandModelSection;
