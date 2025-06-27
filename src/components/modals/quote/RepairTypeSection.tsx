
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RepairType } from '@/types/catalog';

interface RepairTypeSectionProps {
  repairType: string;
  repairTypes: RepairType[];
  onRepairTypeChange: (value: string) => void;
}

const RepairTypeSection: React.FC<RepairTypeSectionProps> = ({
  repairType,
  repairTypes,
  onRepairTypeChange
}) => {
  return (
    <div>
      <Label htmlFor="repair_type">Type de réparation *</Label>
      <Select value={repairType} onValueChange={onRepairTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner le type de réparation" />
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
  );
};

export default RepairTypeSection;
