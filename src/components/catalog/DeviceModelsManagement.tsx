
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Smartphone } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

const DeviceModelsManagement = () => {
  const { 
    deviceTypes, 
    brands, 
    deviceModels, 
    loading, 
    createDeviceModel, 
    updateDeviceModel, 
    deleteDeviceModel 
  } = useCatalog();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
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

  const resetForm = () => {
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
    setEditingModel(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeviceModel(formData);
      toast({
        title: "Modèle créé",
        description: `Le modèle ${formData.model_name} a été créé avec succès.`
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le modèle.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;
    
    try {
      await updateDeviceModel(editingModel.id, formData);
      toast({
        title: "Modèle modifié",
        description: `Le modèle ${formData.model_name} a été modifié avec succès.`
      });
      setIsEditOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le modèle.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (model: DeviceModel) => {
    setEditingModel(model);
    setFormData({
      device_type_id: model.device_type_id,
      brand_id: model.brand_id,
      model_name: model.model_name,
      model_number: model.model_number || '',
      release_date: model.release_date || '',
      screen_size: model.screen_size?.toString() || '',
      screen_resolution: model.screen_resolution || '',
      screen_type: model.screen_type || '',
      battery_capacity: model.battery_capacity?.toString() || '',
      operating_system: model.operating_system || '',
      is_active: model.is_active
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (model: DeviceModel) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le modèle ${model.model_name} ?`)) return;
    
    try {
      await deleteDeviceModel(model.id);
      toast({
        title: "Modèle supprimé",
        description: `Le modèle ${model.model_name} a été supprimé.`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  const screenTypes = ['LCD', 'OLED', 'AMOLED', 'Super AMOLED', 'IPS', 'E-Ink', 'LED'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Modèles d'appareils</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un modèle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau modèle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 max-h-96 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type d'appareil</Label>
                  <Select value={formData.device_type_id} onValueChange={(value) => setFormData({ ...formData, device_type_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marque</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_name">Nom du modèle</Label>
                  <Input
                    id="model_name"
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model_number">Numéro de modèle</Label>
                  <Input
                    id="model_number"
                    value={formData.model_number}
                    onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="release_date">Date de sortie</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="operating_system">Système d'exploitation</Label>
                  <Input
                    id="operating_system"
                    value={formData.operating_system}
                    onChange={(e) => setFormData({ ...formData, operating_system: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="screen_size">Taille écran (pouces)</Label>
                  <Input
                    id="screen_size"
                    type="number"
                    step="0.1"
                    value={formData.screen_size}
                    onChange={(e) => setFormData({ ...formData, screen_size: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="screen_resolution">Résolution</Label>
                  <Input
                    id="screen_resolution"
                    value={formData.screen_resolution}
                    onChange={(e) => setFormData({ ...formData, screen_resolution: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type d'écran</Label>
                  <Select value={formData.screen_type} onValueChange={(value) => setFormData({ ...formData, screen_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'écran" />
                    </SelectTrigger>
                    <SelectContent>
                      {screenTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="battery_capacity">Batterie (mAh)</Label>
                <Input
                  id="battery_capacity"
                  type="number"
                  value={formData.battery_capacity}
                  onChange={(e) => setFormData({ ...formData, battery_capacity: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modèle</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Écran</TableHead>
              <TableHead>Batterie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deviceModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <div>{model.model_name}</div>
                      {model.model_number && (
                        <div className="text-xs text-gray-500">{model.model_number}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{model.brand?.name}</TableCell>
                <TableCell>{model.device_type?.name}</TableCell>
                <TableCell>
                  {model.screen_size && (
                    <div className="text-sm">
                      {model.screen_size}" {model.screen_type}
                      {model.screen_resolution && (
                        <div className="text-xs text-gray-500">{model.screen_resolution}</div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {model.battery_capacity && `${model.battery_capacity} mAh`}
                </TableCell>
                <TableCell>
                  <Badge variant={model.is_active ? "default" : "secondary"}>
                    {model.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(model)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(model)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog - Similar structure to create dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le modèle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 max-h-96 overflow-y-auto">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type d'appareil</Label>
                <Select value={formData.device_type_id} onValueChange={(value) => setFormData({ ...formData, device_type_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marque</Label>
                <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_model_name">Nom du modèle</Label>
                <Input
                  id="edit_model_name"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_model_number">Numéro de modèle</Label>
                <Input
                  id="edit_model_number"
                  value={formData.model_number}
                  onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceModelsManagement;
