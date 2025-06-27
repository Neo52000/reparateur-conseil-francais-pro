
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import type { DeviceType } from '@/types/catalog';

const DeviceTypesManagement = () => {
  const { deviceTypes, loading } = useCatalog();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeviceTypes = deviceTypes.filter(deviceType =>
    deviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deviceType.description && deviceType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (deviceType: DeviceType) => {
    // TODO: Implement edit functionality
    toast({
      title: "Fonctionnalité en développement",
      description: "L'édition des types d'appareils sera bientôt disponible",
    });
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    toast({
      title: "Fonctionnalité en développement",
      description: "La suppression des types d'appareils sera bientôt disponible",
    });
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
        <Button>
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
    </div>
  );
};

export default DeviceTypesManagement;
