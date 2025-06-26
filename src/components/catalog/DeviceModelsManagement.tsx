
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import DeviceModelsTable from './DeviceModelsTable';
import DeviceModelDialog from './DeviceModelDialog';
import type { DeviceModel, DeviceModelFormData } from '@/types/catalog';

const DeviceModelsManagement = () => {
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

  const filteredModels = deviceModels.filter(model => {
    const matchesSearch = model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.model_number && model.model_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = !selectedBrand || model.brand_id === selectedBrand;
    const matchesType = !selectedType || model.device_type_id === selectedType;
    
    return matchesSearch && matchesBrand && matchesType;
  });

  const handleEdit = (model: DeviceModel) => {
    setEditingModel(model);
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

  const handleSave = async (modelData: DeviceModelFormData) => {
    try {
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingModel(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des modèles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestion des modèles d'appareils</h2>
          <p className="text-sm text-gray-600">
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
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            <SelectItem value="all">Toutes les marques</SelectItem>
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
            <SelectItem value="all">Tous les types</SelectItem>
            {deviceTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DeviceModelsTable
        deviceModels={filteredModels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DeviceModelDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        deviceModel={editingModel}
        deviceTypes={deviceTypes}
        brands={brands}
      />
    </div>
  );
};

export default DeviceModelsManagement;
