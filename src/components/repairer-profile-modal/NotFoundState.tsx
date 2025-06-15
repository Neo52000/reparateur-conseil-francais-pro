
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NotFoundStateProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Profil non trouvé</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun profil trouvé pour ce réparateur.</p>
          <p className="text-sm text-gray-400 mt-2">Le réparateur n'a peut-être pas encore créé son profil.</p>
          <Button onClick={onClose} className="mt-4">Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotFoundState;
