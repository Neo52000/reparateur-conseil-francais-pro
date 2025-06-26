
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Smartphone, Gamepad, Watch } from 'lucide-react';
import type { DeviceModel } from '@/types/catalog';

interface DeviceModelsTableProps {
  deviceModels: DeviceModel[];
  onEdit: (model: DeviceModel) => void;
  onDelete: (id: string) => void;
}

const DeviceModelsTable: React.FC<DeviceModelsTableProps> = ({
  deviceModels,
  onEdit,
  onDelete
}) => {
  const getDeviceIcon = (deviceTypeName: string) => {
    switch (deviceTypeName) {
      case 'Smartphone':
        return <Smartphone className="h-4 w-4" />;
      case 'Console de jeux':
        return <Gamepad className="h-4 w-4" />;
      case 'Montre connectée':
        return <Watch className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const formatScreenSize = (size?: number) => {
    return size ? `${size}"` : '-';
  };

  const formatBattery = (capacity?: number) => {
    return capacity ? `${capacity} mAh` : '-';
  };

  const formatReleaseDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Modèle</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Date sortie</TableHead>
            <TableHead>Écran</TableHead>
            <TableHead>Résolution</TableHead>
            <TableHead>Batterie</TableHead>
            <TableHead>OS</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviceModels.map((model) => (
            <TableRow key={model.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getDeviceIcon(model.device_type?.name || '')}
                  <span className="text-sm">{model.device_type?.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{model.brand?.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{model.model_name}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">{model.model_number || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatReleaseDate(model.release_date)}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatScreenSize(model.screen_size)}
                  {model.screen_type && (
                    <div className="text-xs text-gray-500">{model.screen_type}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs text-gray-600">{model.screen_resolution || '-'}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatBattery(model.battery_capacity)}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{model.operating_system || '-'}</div>
              </TableCell>
              <TableCell>
                <Badge variant={model.is_active ? 'default' : 'secondary'}>
                  {model.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(model)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(model.id)}
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
  );
};

export default DeviceModelsTable;
