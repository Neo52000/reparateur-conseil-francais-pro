
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingStateProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingState;
