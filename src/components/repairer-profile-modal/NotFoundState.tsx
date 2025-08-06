
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface NotFoundStateProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="not-found-description">
        <DialogHeader>
          <DialogTitle>Profil introuvable</DialogTitle>
          <DialogDescription id="not-found-description">
            Le profil du réparateur demandé n'a pas pu être trouvé ou chargé.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Profil non trouvé
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Le profil du réparateur n'a pas pu être chargé. 
            Il se peut qu'il ait été supprimé ou qu'il y ait un problème de connexion.
          </p>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotFoundState;
