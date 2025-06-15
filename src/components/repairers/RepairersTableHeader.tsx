
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RepairersTableHeaderProps {
  onAddRepairer: () => void;
}

const RepairersTableHeader: React.FC<RepairersTableHeaderProps> = ({ onAddRepairer }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Gestion des Réparateurs</CardTitle>
      <Button onClick={onAddRepairer}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un réparateur
      </Button>
    </CardHeader>
  );
};

export default RepairersTableHeader;
