
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentBooking from '@/components/AppointmentBooking';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
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
          <DialogTitle>Prendre rendez-vous</DialogTitle>
        </DialogHeader>
        <AppointmentBooking 
          repairerId={repairerId} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
