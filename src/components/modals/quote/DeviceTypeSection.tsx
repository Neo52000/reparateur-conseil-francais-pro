
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DeviceType } from '@/types/catalog';

interface DeviceTypeSectionProps {
  deviceType: string;
  deviceTypes: DeviceType[];
  onDeviceTypeChange: (value: string) => void;
}

const DeviceTypeSection: React.FC<DeviceTypeSectionProps> = ({
  deviceType,
  deviceTypes,
  onDeviceTypeChange
}) => {
  return (
    <div>
      <Label htmlFor="device_type">Type de produit *</Label>
      <Select value={deviceType} onValueChange={onDeviceTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un type de produit" />
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
  );
};

export default DeviceTypeSection;
