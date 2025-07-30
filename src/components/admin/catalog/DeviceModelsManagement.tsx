import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

interface DeviceModelsManagementProps {
  onStatsUpdate?: (count: number) => void;
}

interface EditingDeviceModel {
  model_name: string;
  model_number: string;
  device_type_id: string;
  brand_id: string;
  is_active: boolean;
}

const DeviceModelsManagement: React.FC<DeviceModelsManagementProps> = ({ onStatsUpdate }) => {
  const { 
    deviceModels, 
    deviceTypes, 
    brands, 
    loading, 
    createDeviceModel, 
    updateDeviceModel, 
    deleteDeviceModel 
  } = useCatalog();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [formData, setFormData] = useState<EditingDeviceModel>({
    model_name: '',
    model_number: '',
    device_type_id: '',
    brand_id: '',
    is_active: true
  });

  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(deviceModels.length);
    }
  }, [deviceModels.length, onStatsUpdate]);

  const filteredModels = deviceModels.filter(model => {
    const matchesSearch = model.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.model_number && model.model_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = !selectedBrand || model.brand_id === selectedBrand;
    const matchesType = !selectedType || model.device_type_id === selectedType;
    
    return matchesSearch && matchesBrand && matchesType;
  });

  const handleEdit = (model: DeviceModel) => {
    setEditingModel(model);
    setFormData({
      model_name: model.model_name || '',
      model_number: model.model_number || '',
      device_type_id: model.device_type_id,
      brand_id: model.brand_id,
      is_active: model.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        await deleteDeviceModel(id);
        toast({
          title: 'Modèle supprimé',
          description: 'Le modèle a été supprimé avec succès.',
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le modèle.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const modelData: DeviceModelFormData = {
        model_name: formData.model_name,
        device_type_id: formData.device_type_id,
        brand_id: formData.brand_id,
        model_number: formData.model_number,
        release_date: '',
        screen_size: '',
        screen_resolution: '',
        screen_type: '',
        battery_capacity: '',
        operating_system: '',
        is_active: formData.is_active
      };

      if (editingModel) {
        await updateDeviceModel(editingModel.id, modelData);
        toast({
          title: 'Modèle mis à jour',
          description: 'Le modèle a été mis à jour avec succès.',
        });
      } else {
        await createDeviceModel(modelData);
        toast({
          title: 'Modèle créé',
          description: 'Le nouveau modèle a été créé avec succès.',
        });
      }
      setIsDialogOpen(false);
      setEditingModel(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      model_name: '',
      model_number: '',
      device_type_id: '',
      brand_id: '',
      is_active: true
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingModel(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des modèles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestion des modèles d'appareils</h2>
          <p className="text-sm text-muted-foreground">
            {filteredModels.length} modèle{filteredModels.length > 1 ? 's' : ''} trouvé{filteredModels.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un modèle, marque ou référence..."
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
            <SelectItem value="">Toutes les marques</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            {deviceTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modèles d'appareils</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    {model.model_name}
                  </TableCell>
                  <TableCell>
                    {model.brand?.name || 'Non définie'}
                  </TableCell>
                  <TableCell>
                    {model.device_type?.name || 'Non défini'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={model.model_number || ''}>
                      {model.model_number || 'Aucun numéro de modèle'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={model.is_active ? "default" : "secondary"}>
                      {model.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(model)} 
                        aria-label={`Modifier ${model.model_name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                        aria-label={`Supprimer ${model.model_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredModels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun modèle trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>
                {editingModel ? 'Modifier le modèle' : 'Nouveau modèle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du modèle</label>
                <Input
                  value={formData.model_name}
                  onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                  placeholder="iPhone 15 Pro"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Numéro de modèle</label>
                <Input
                  value={formData.model_number}
                  onChange={(e) => setFormData({...formData, model_number: e.target.value})}
                  placeholder="A2896"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type d'appareil</label>
                <Select 
                  value={formData.device_type_id} 
                  onValueChange={(value) => setFormData({...formData, device_type_id: value})}
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

              <div>
                <label className="text-sm font-medium">Marque</label>
                <Select 
                  value={formData.brand_id} 
                  onValueChange={(value) => setFormData({...formData, brand_id: value})}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Modèle actif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {editingModel ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeviceModelsManagement;