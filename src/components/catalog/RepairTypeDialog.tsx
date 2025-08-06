
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { RepairType, RepairCategory } from '@/types/catalog';

interface RepairTypeFormData {
  category_id: string;
  name: string;
  description: string;
  difficulty_level: string;
  estimated_time_minutes: string;
  warranty_days: string;
  is_active: boolean;
}

interface RepairTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RepairTypeFormData) => void;
  repairType?: RepairType | null;
  repairCategories: RepairCategory[];
}

const RepairTypeDialog: React.FC<RepairTypeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  repairType,
  repairCategories
}) => {
  const [formData, setFormData] = useState<RepairTypeFormData>({
    category_id: '',
    name: '',
    description: '',
    difficulty_level: 'Moyen',
    estimated_time_minutes: '',
    warranty_days: '90',
    is_active: true
  });

  useEffect(() => {
    if (repairType) {
      setFormData({
        category_id: repairType.category_id,
        name: repairType.name,
        description: repairType.description || '',
        difficulty_level: repairType.difficulty_level,
        estimated_time_minutes: repairType.estimated_time_minutes?.toString() || '',
        warranty_days: repairType.warranty_days.toString(),
        is_active: repairType.is_active
      });
    } else {
      setFormData({
        category_id: '',
        name: '',
        description: '',
        difficulty_level: 'Moyen',
        estimated_time_minutes: '',
        warranty_days: '90',
        is_active: true
      });
    }
  }, [repairType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof RepairTypeFormData, value: string | boolean) => {
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
            {repairType ? 'Modifier le type de réparation' : 'Nouveau type de réparation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {repairCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Niveau de difficulté *</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleInputChange('difficulty_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facile">Facile</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Difficile">Difficile</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la réparation *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="ex: Remplacement écran LCD/OLED complet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description détaillée de la réparation..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_time_minutes">Temps estimé (minutes)</Label>
              <Input
                id="estimated_time_minutes"
                type="number"
                value={formData.estimated_time_minutes}
                onChange={(e) => handleInputChange('estimated_time_minutes', e.target.value)}
                placeholder="ex: 45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_days">Garantie (jours)</Label>
              <Input
                id="warranty_days"
                type="number"
                value={formData.warranty_days}
                onChange={(e) => handleInputChange('warranty_days', e.target.value)}
                placeholder="ex: 90"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Type de réparation actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {repairType ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RepairTypeDialog;
