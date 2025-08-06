
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DeviceType } from '@/types/catalog';

interface DeviceTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceTypeData: Omit<DeviceType, 'id' | 'created_at'>) => Promise<void>;
  deviceType?: DeviceType | null;
}

const DeviceTypeDialog: React.FC<DeviceTypeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  deviceType
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    if (deviceType) {
      setFormData({
        name: deviceType.name,
        description: deviceType.description || '',
        icon: deviceType.icon || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: ''
      });
    }
  }, [deviceType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving device type:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {deviceType ? 'Modifier le type d\'appareil' : 'Nouveau type d\'appareil'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Smartphone"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du type d'appareil"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="icon">Icône (Lucide React)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ex: smartphone, tablet, laptop"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {deviceType ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceTypeDialog;
