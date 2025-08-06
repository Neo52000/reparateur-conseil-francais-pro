
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import DeviceTypeDialog from './DeviceTypeDialog';
import type { DeviceType } from '@/types/catalog';

const DeviceTypesManagement = () => {
  const { 
    deviceTypes, 
    loading, 
    createDeviceType, 
    updateDeviceType, 
    deleteDeviceType 
  } = useCatalog();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeviceType, setEditingDeviceType] = useState<DeviceType | null>(null);

  const filteredDeviceTypes = deviceTypes.filter(deviceType =>
    deviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deviceType.description && deviceType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (deviceType: DeviceType) => {
    setEditingDeviceType(deviceType);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'appareil ?')) {
      try {
        await deleteDeviceType(id);
        toast({
          title: 'Type d\'appareil supprimé',
          description: 'Le type d\'appareil a été supprimé avec succès.',
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le type d\'appareil.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async (deviceTypeData: Omit<DeviceType, 'id' | 'created_at'>) => {
    try {
      if (editingDeviceType) {
        await updateDeviceType(editingDeviceType.id, deviceTypeData);
        toast({
          title: 'Type d\'appareil mis à jour',
          description: 'Le type d\'appareil a été mis à jour avec succès.',
        });
      } else {
        await createDeviceType(deviceTypeData);
        toast({
          title: 'Type d\'appareil créé',
          description: 'Le nouveau type d\'appareil a été créé avec succès.',
        });
      }
      setIsDialogOpen(false);
      setEditingDeviceType(null);
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
    setEditingDeviceType(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des types d'appareils...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestion des types d'appareils</h2>
          <p className="text-sm text-gray-600">
            {filteredDeviceTypes.length} type{filteredDeviceTypes.length > 1 ? 's' : ''} trouvé{filteredDeviceTypes.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau type d'appareil
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un type d'appareil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Icône</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeviceTypes.map((deviceType) => (
              <TableRow key={deviceType.id}>
                <TableCell>
                  <div className="font-medium">{deviceType.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {deviceType.description || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {deviceType.icon || 'Aucune'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(deviceType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(deviceType.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredDeviceTypes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun type d'appareil trouvé</p>
        </div>
      )}

      <DeviceTypeDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        deviceType={editingDeviceType}
      />
    </div>
  );
};

export default DeviceTypesManagement;
