
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RepairersTableHeaderProps {
  onAddRepairer: () => void;
}

const RepairersTableHeader: React.FC<RepairersTableHeaderProps> = ({ onAddRepairer }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Gestion des réparateurs</CardTitle>
        <Button onClick={onAddRepairer} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un réparateur
        </Button>
      </div>
    </CardHeader>
  );
};

export default RepairersTableHeader;
