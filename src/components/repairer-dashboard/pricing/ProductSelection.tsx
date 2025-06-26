
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductSelectionProps {
  brands: any[];
  deviceModels: any[];
  repairTypes: any[];
  selectedBrand: string;
  selectedModel: string;
  selectedRepairType: string;
  editingPrice?: any;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onRepairTypeChange: (value: string) => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  brands,
  deviceModels,
  repairTypes,
  selectedBrand,
  selectedModel,
  selectedRepairType,
  editingPrice,
  onBrandChange,
  onModelChange,
  onRepairTypeChange
}) => {
  const filteredModels = deviceModels.filter(model => model.brand_id === selectedBrand);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marque</Label>
          <Select value={selectedBrand} onValueChange={onBrandChange} disabled={!!editingPrice}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modèle</Label>
          <Select value={selectedModel} onValueChange={onModelChange} disabled={!!editingPrice || !selectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un modèle" />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="repairType">Type de réparation</Label>
        <Select value={selectedRepairType} onValueChange={onRepairTypeChange} disabled={!!editingPrice}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type de réparation" />
          </SelectTrigger>
          <SelectContent>
            {repairTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ProductSelection;
