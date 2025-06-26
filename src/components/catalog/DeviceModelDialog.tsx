
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { DeviceModel, DeviceType, Brand, DeviceModelFormData } from '@/types/catalog';

interface DeviceModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DeviceModelFormData) => void;
  deviceModel?: DeviceModel | null;
  deviceTypes: DeviceType[];
  brands: Brand[];
}

const DeviceModelDialog: React.FC<DeviceModelDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  deviceModel,
  deviceTypes,
  brands
}) => {
  const [formData, setFormData] = useState<DeviceModelFormData>({
    device_type_id: '',
    brand_id: '',
    model_name: '',
    model_number: '',
    release_date: '',
    screen_size: '',
    screen_resolution: '',
    screen_type: '',
    battery_capacity: '',
    operating_system: '',
    is_active: true
  });

  useEffect(() => {
    if (deviceModel) {
      setFormData({
        device_type_id: deviceModel.device_type_id,
        brand_id: deviceModel.brand_id,
        model_name: deviceModel.model_name,
        model_number: deviceModel.model_number || '',
        release_date: deviceModel.release_date || '',
        screen_size: deviceModel.screen_size?.toString() || '',
        screen_resolution: deviceModel.screen_resolution || '',
        screen_type: deviceModel.screen_type || '',
        battery_capacity: deviceModel.battery_capacity?.toString() || '',
        operating_system: deviceModel.operating_system || '',
        is_active: deviceModel.is_active
      });
    } else {
      setFormData({
        device_type_id: '',
        brand_id: '',
        model_name: '',
        model_number: '',
        release_date: '',
        screen_size: '',
        screen_resolution: '',
        screen_type: '',
        battery_capacity: '',
        operating_system: '',
        is_active: true
      });
    }
  }, [deviceModel, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof DeviceModelFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {deviceModel ? 'Modifier le modèle' : 'Nouveau modèle d\'appareil'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_type">Type d'appareil *</Label>
              <Select
                value={formData.device_type_id}
                onValueChange={(value) => handleInputChange('device_type_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
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

            <div className="space-y-2">
              <Label htmlFor="brand">Marque *</Label>
              <Select
                value={formData.brand_id}
                onValueChange={(value) => handleInputChange('brand_id', value)}
              >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model_name">Nom du modèle *</Label>
              <Input
                id="model_name"
                value={formData.model_name}
                onChange={(e) => handleInputChange('model_name', e.target.value)}
                placeholder="ex: iPhone 15 Pro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model_number">Référence</Label>
              <Input
                id="model_number"
                value={formData.model_number}
                onChange={(e) => handleInputChange('model_number', e.target.value)}
                placeholder="ex: A3108"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="release_date">Date de sortie</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
                onChange={(e) => handleInputChange('release_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operating_system">Système d'exploitation</Label>
              <Input
                id="operating_system"
                value={formData.operating_system}
                onChange={(e) => handleInputChange('operating_system', e.target.value)}
                placeholder="ex: iOS, Android"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="screen_size">Taille écran (pouces)</Label>
              <Input
                id="screen_size"
                type="number"
                step="0.1"
                value={formData.screen_size}
                onChange={(e) => handleInputChange('screen_size', e.target.value)}
                placeholder="ex: 6.7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screen_resolution">Résolution</Label>
              <Input
                id="screen_resolution"
                value={formData.screen_resolution}
                onChange={(e) => handleInputChange('screen_resolution', e.target.value)}
                placeholder="ex: 2796x1290"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screen_type">Type d'écran</Label>
              <Input
                id="screen_type"
                value={formData.screen_type}
                onChange={(e) => handleInputChange('screen_type', e.target.value)}
                placeholder="ex: OLED, LCD"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battery_capacity">Capacité batterie (mAh)</Label>
            <Input
              id="battery_capacity"
              type="number"
              value={formData.battery_capacity}
              onChange={(e) => handleInputChange('battery_capacity', e.target.value)}
              placeholder="ex: 4441"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Modèle actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {deviceModel ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceModelDialog;
