
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DeviceModel, RepairType } from '@/types/catalog';

interface RepairPricesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedRepairType: string;
  setSelectedRepairType: (type: string) => void;
  deviceModels: DeviceModel[];
  repairTypes: RepairType[];
}

const RepairPricesFilters: React.FC<RepairPricesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  selectedRepairType,
  setSelectedRepairType,
  deviceModels,
  repairTypes
}) => {
  const brands = [...new Set(deviceModels.map(model => model.brand).filter(Boolean))];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un modèle ou type de réparation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Toutes les marques" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les marques</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedRepairType} onValueChange={setSelectedRepairType}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Tous les types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {repairTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RepairPricesFilters;
