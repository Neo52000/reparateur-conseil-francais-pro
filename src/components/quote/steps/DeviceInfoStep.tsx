import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'OnePlus', 'Autre'];

export const DeviceInfoStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations sur l'appareil</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Commencez par nous indiquer la marque et le modèle de votre appareil
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="deviceBrand">Marque *</Label>
          <Select
            value={data.deviceBrand}
            onValueChange={(value) => onChange({ deviceBrand: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Sélectionnez une marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="deviceModel">Modèle *</Label>
          <Input
            id="deviceModel"
            placeholder="Ex: iPhone 14 Pro, Galaxy S23..."
            value={data.deviceModel || ''}
            onChange={(e) => onChange({ deviceModel: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};
