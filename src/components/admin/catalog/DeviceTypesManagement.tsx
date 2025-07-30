import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Smartphone, 
  Search,
  Save,
  X
} from 'lucide-react';

interface DeviceTypesManagementProps {
  onStatsUpdate: (count: number) => void;
}

interface EditingDeviceType {
  id?: string;
  name: string;
  icon?: string;
  description?: string;
}

const DeviceTypesManagement: React.FC<DeviceTypesManagementProps> = ({ onStatsUpdate }) => {
  const { deviceTypes, loading, createDeviceType, updateDeviceType, deleteDeviceType } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingDeviceType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    onStatsUpdate(deviceTypes.length);
  }, [deviceTypes.length, onStatsUpdate]);

  const filteredDeviceTypes = deviceTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async () => {
    if (!editingItem?.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingItem.id) {
        // Mise à jour
        await updateDeviceType(editingItem.id, {
          name: editingItem.name.trim(),
          icon: editingItem.icon,
          description: editingItem.description
        });
        toast({
          title: "Succès",
          description: "Type d'appareil mis à jour"
        });
      } else {
        // Création
        await createDeviceType({
          name: editingItem.name.trim(),
          icon: editingItem.icon,
          description: editingItem.description
        });
        toast({
          title: "Succès",
          description: "Type d'appareil créé"
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
      await deleteDeviceType(id);
      toast({
        title: "Succès",
        description: "Type d'appareil supprimé"
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
    setEditingItem({ name: '', icon: '', description: '' });
    setIsCreating(true);
  };

  const startEditing = (deviceType: any) => {
    setEditingItem({
      id: deviceType.id,
      name: deviceType.name,
      icon: deviceType.icon || '',
      description: deviceType.description || ''
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
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
              <Smartphone className="h-5 w-5" />
              Types d'appareils ({deviceTypes.length})
            </CardTitle>
            <Button onClick={startCreating} disabled={isCreating || !!editingItem}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un type d'appareil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Formulaire de création/édition */}
          {(isCreating || editingItem) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {isCreating ? 'Nouveau type d\'appareil' : 'Modifier le type d\'appareil'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={editingItem?.name || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                        placeholder="ex: Smartphone"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="icon">Icône</Label>
                      <Input
                        id="icon"
                        value={editingItem?.icon || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev!, icon: e.target.value }))}
                        placeholder="ex: smartphone"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editingItem?.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                      placeholder="Description du type d'appareil"
                    />
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

          {/* Liste des types d'appareils */}
          <div className="space-y-2">
            {filteredDeviceTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Aucun type d\'appareil trouvé' : 'Aucun type d\'appareil configuré'}
              </div>
            ) : (
              filteredDeviceTypes.map((deviceType) => (
                <div key={deviceType.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{deviceType.name}</h4>
                      </div>
                      {deviceType.icon && (
                        <Badge variant="secondary">{deviceType.icon}</Badge>
                      )}
                    </div>
                    {deviceType.description && (
                      <p className="text-sm text-muted-foreground mt-1">{deviceType.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(deviceType)}
                      disabled={!!editingItem}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(deviceType.id, deviceType.name)}
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

export default DeviceTypesManagement;