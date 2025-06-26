
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Shield } from 'lucide-react';
import type { RepairType } from '@/types/catalog';

interface RepairTypesTableProps {
  repairTypes: RepairType[];
  onEdit: (repairType: RepairType) => void;
  onDelete: (id: string) => void;
}

const RepairTypesTable: React.FC<RepairTypesTableProps> = ({
  repairTypes,
  onEdit,
  onDelete
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return 'bg-green-100 text-green-800';
      case 'Moyen':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difficile':
        return 'bg-orange-100 text-orange-800';
      case 'Expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`;
  };

  const formatWarranty = (days: number) => {
    if (days < 30) return `${days} jours`;
    if (days < 365) return `${Math.floor(days / 30)} mois`;
    return `${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Catégorie</TableHead>
            <TableHead>Réparation</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Difficulté</TableHead>
            <TableHead>Temps estimé</TableHead>
            <TableHead>Garantie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairTypes.map((repairType) => (
            <TableRow key={repairType.id}>
              <TableCell>
                <div className="font-medium text-sm">
                  {repairType.category?.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{repairType.name}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600 max-w-xs truncate">
                  {repairType.description || '-'}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getDifficultyColor(repairType.difficulty_level)}>
                  {repairType.difficulty_level}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(repairType.estimated_time_minutes)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 text-sm">
                  <Shield className="h-3 w-3" />
                  <span>{formatWarranty(repairType.warranty_days)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={repairType.is_active ? 'default' : 'secondary'}>
                  {repairType.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(repairType)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(repairType.id)}
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

export default RepairTypesTable;
