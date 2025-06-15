
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onSetActive: (active: boolean) => void;
  onDelete: () => void;
  disableActions?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onSetActive,
  onDelete,
  disableActions,
}) => {
  return (
    <div className="bg-muted border p-3 rounded flex items-center space-x-4 mb-4">
      <div className="font-medium mr-4">
        {selectedCount} réparateur{selectedCount > 1 ? "s" : ""} sélectionné
        {selectedCount > 1 ? "s" : ""}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetActive(true)}
        disabled={disableActions}
        className="flex items-center"
      >
        <Check className="h-4 w-4 mr-1 text-green-600" />
        Activer
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSetActive(false)}
        disabled={disableActions}
        className="flex items-center"
      >
        <X className="h-4 w-4 mr-1 text-gray-600" />
        Désactiver
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={disableActions}
        className="flex items-center"
      >
        <X className="h-4 w-4 mr-1" />
        Supprimer
      </Button>
    </div>
  );
};

export default BulkActionsBar;

