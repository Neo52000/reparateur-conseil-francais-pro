import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Database, 
  Search,
  Save,
  X,
  Filter
} from 'lucide-react';

interface DeviceModelsManagementProps {
  onStatsUpdate: (count: number) => void;
}

interface EditingDeviceModel {
  id?: string;
  model_name: string;
  brand_id: string;
  device_type_id: string;
}

const DeviceModelsManagement: React.FC<DeviceModelsManagementProps> = ({ onStatsUpdate }) => {
  const { deviceModels, brands, deviceTypes, loading, createDeviceModel, updateDeviceModel, deleteDeviceModel } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [editingItem, setEditingItem] = useState<EditingDeviceModel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    onStatsUpdate(deviceModels.length);
  }, [deviceModels.length, onStatsUpdate]);

  const filteredDeviceModels = deviceModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !selectedBrand || model.brand_id === selectedBrand;
    const matchesDeviceType = !selectedDeviceType || model.device_type_id === selectedDeviceType;
    
    return matchesSearch && matchesBrand && matchesDeviceType;
  });

  const getBrandName = (brandId: string) => {
    return brands.find(brand => brand.id === brandId)?.name || 'Marque inconnue';
  };

  const getDeviceTypeName = (deviceTypeId: string) => {
    return deviceTypes.find(type => type.id === deviceTypeId)?.name || 'Type inconnu';
  };

  const handleSave = async () => {
    if (!editingItem?.name.trim() || !editingItem?.brand_id || !editingItem?.device_type_id) {
      toast({
        title: "Erreur",
        description: "Tous les champs obligatoires doivent être renseignés",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingItem.id) {
        // Mise à jour
        await updateDeviceModel(editingItem.id, {
          name: editingItem.name.trim(),
          brand_id: editingItem.brand_id,
          device_type_id: editingItem.device_type_id,
          specifications: editingItem.specifications
        });
        toast({
          title: "Succès",
          description: "Modèle mis à jour"
        });
      } else {
        // Création
        await createDeviceModel({
          name: editingItem.name.trim(),
          brand_id: editingItem.brand_id,
          device_type_id: editingItem.device_type_id,
          specifications: editingItem.specifications
        });
        toast({
          title: "Succès",
          description: "Modèle créé"
        });
        setIsCreating(false);
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) return;

    try {
      await deleteDeviceModel(id);
      toast({
        title: "Succès",
        description: "Modèle supprimé"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet élément",
        variant: "destructive"
      });
    }
  };

  const startCreating = () => {
    setEditingItem({ 
      name: '', 
      brand_id: '', 
      device_type_id: '',
      specifications: ''
    });
    setIsCreating(true);
  };

  const startEditing = (deviceModel: any) => {
    setEditingItem({
      id: deviceModel.id,
      name: deviceModel.name,
      brand_id: deviceModel.brand_id,
      device_type_id: deviceModel.device_type_id,
      specifications: deviceModel.specifications || ''
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedDeviceType('');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Modèles d'appareils ({deviceModels.length})
            </CardTitle>
            <Button onClick={startCreating} disabled={isCreating || !!editingItem}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau modèle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Recherche</Label>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label>Marque</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les marques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les marques</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label>Type d'appareil</Label>
              <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {deviceTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Formulaire de création/édition */}
          {(isCreating || editingItem) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {isCreating ? 'Nouveau modèle d\'appareil' : 'Modifier le modèle d\'appareil'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom du modèle *</Label>
                      <Input
                        id="name"
                        value={editingItem?.name || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                        placeholder="ex: iPhone 15 Pro"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="brand">Marque *</Label>
                      <Select 
                        value={editingItem?.brand_id || ''} 
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev!, brand_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="device_type">Type d'appareil *</Label>
                      <Select 
                        value={editingItem?.device_type_id || ''} 
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev!, device_type_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="specifications">Spécifications</Label>
                      <Input
                        id="specifications"
                        value={editingItem?.specifications || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, specifications: e.target.value }))}
                        placeholder="ex: 128GB, Titanium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des modèles */}
          <div className="space-y-2">
            {filteredDeviceModels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || selectedBrand || selectedDeviceType 
                  ? 'Aucun modèle trouvé avec ces critères' 
                  : 'Aucun modèle configuré'}
              </div>
            ) : (
              filteredDeviceModels.map((deviceModel) => (
                <div key={deviceModel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium">{deviceModel.name}</h4>
                      <Badge variant="secondary">{getBrandName(deviceModel.brand_id)}</Badge>
                      <Badge variant="outline">{getDeviceTypeName(deviceModel.device_type_id)}</Badge>
                    </div>
                    {deviceModel.specifications && (
                      <p className="text-sm text-muted-foreground">{deviceModel.specifications}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(deviceModel)}
                      disabled={!!editingItem}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(deviceModel.id, deviceModel.name)}
                      disabled={!!editingItem}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceModelsManagement;