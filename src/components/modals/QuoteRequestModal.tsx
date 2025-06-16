
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuoteForm from '@/components/QuoteForm';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  repairerId 
}) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Demande de devis gratuit</DialogTitle>
        </DialogHeader>
        <QuoteForm 
          repairerId={repairerId} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestModal;
