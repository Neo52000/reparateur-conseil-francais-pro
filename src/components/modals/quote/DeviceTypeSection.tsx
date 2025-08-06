
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalog } from '@/hooks/useCatalog';

interface DeviceTypeSectionProps {
  deviceType: string;
  onDeviceTypeChange: (value: string) => void;
}

const DeviceTypeSection: React.FC<DeviceTypeSectionProps> = ({
  deviceType,
  onDeviceTypeChange
}) => {
  const { deviceTypes, loading } = useCatalog();

  if (loading) {
    return (
      <div>
        <Label htmlFor="device_type">Type de produit *</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Chargement..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

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
