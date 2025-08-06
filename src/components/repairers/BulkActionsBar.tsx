
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onSetActive: () => void;
  onDelete: () => void;
  disableActions: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onSetActive,
  onDelete,
  disableActions
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{selectedCount} sélectionné(s)</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSetActive}
          disabled={disableActions}
          className="flex items-center gap-1"
        >
          <CheckCircle className="h-4 w-4" />
          Activer
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={disableActions}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
