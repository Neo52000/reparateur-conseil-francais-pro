
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Euro, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RepairPrice } from '@/types/catalog';

interface RepairPricesTableProps {
  repairPrices: RepairPrice[];
  onEdit: (repairPrice: RepairPrice) => void;
  onDelete: (id: string) => void;
}

const RepairPricesTable: React.FC<RepairPricesTableProps> = ({
  repairPrices,
  onEdit,
  onDelete
}) => {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modèle</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Type de réparation</TableHead>
            <TableHead>Prix total</TableHead>
            <TableHead>Prix pièce</TableHead>
            <TableHead>Main d'œuvre</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairPrices.map((repairPrice) => (
            <TableRow key={repairPrice.id}>
              <TableCell>
                <div className="font-medium">
                  {repairPrice.device_model?.model_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {repairPrice.device_model?.brand?.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {repairPrice.repair_type?.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1 font-medium text-green-600">
                  <Euro className="h-3 w-3" />
                  <span>{formatPrice(repairPrice.price_eur)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {repairPrice.part_price_eur ? formatPrice(repairPrice.part_price_eur) : '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {repairPrice.labor_price_eur ? formatPrice(repairPrice.labor_price_eur) : '-'}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={repairPrice.is_available ? 'default' : 'secondary'}>
                  {repairPrice.is_available ? 'Disponible' : 'Indisponible'}
                </Badge>
              </TableCell>
              <TableCell>
                {repairPrice.notes && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{repairPrice.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(repairPrice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(repairPrice.id)}
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

export default RepairPricesTable;
