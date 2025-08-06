
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RepairPricesHeaderProps {
  filteredPricesCount: number;
  onAddNew: () => void;
}

const RepairPricesHeader: React.FC<RepairPricesHeaderProps> = ({
  filteredPricesCount,
  onAddNew
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold">Grille tarifaire recommandée</h2>
        <p className="text-sm text-gray-600">
          {filteredPricesCount} prix configuré{filteredPricesCount > 1 ? 's' : ''}
        </p>
      </div>
      <Button onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        Nouveau prix
      </Button>
    </div>
  );
};

export default RepairPricesHeader;
