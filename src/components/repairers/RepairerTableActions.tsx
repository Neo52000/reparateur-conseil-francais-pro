
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface RepairerTableActionsProps {
  repairerId: string;
  currentStatus: boolean;
  loading: string | null;
  onViewProfile: (repairerId: string) => void;
  onToggleStatus: (repairerId: string, currentStatus: boolean) => void;
  onDelete: (repairerId: string) => void;
}

const RepairerTableActions: React.FC<RepairerTableActionsProps> = ({
  repairerId,
  currentStatus,
  loading,
  onViewProfile,
  onToggleStatus,
  onDelete
}) => {
  const isLoading = loading === repairerId;

  return (
    <div className="flex space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewProfile(repairerId)}
            disabled={isLoading}
            aria-label="Voir le profil"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Voir le profil</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onToggleStatus(repairerId, currentStatus)}
            disabled={isLoading}
            aria-label="Activer/Désactiver"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {currentStatus ? "Désactiver le réparateur" : "Activer le réparateur"}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={isLoading}
                aria-label="Supprimer le réparateur"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce réparateur ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(repairerId)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipTrigger>
        <TooltipContent>Supprimer le réparateur</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default RepairerTableActions;
