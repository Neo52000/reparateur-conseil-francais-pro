
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="loading-description">
        <DialogHeader>
          <DialogTitle>Chargement...</DialogTitle>
          <DialogDescription id="loading-description">
            Récupération des informations du profil réparateur en cours.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Chargement du profil...</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingState;
