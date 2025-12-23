import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Phone } from 'lucide-react';

interface PremiumAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

const PremiumAppointmentModal: React.FC<PremiumAppointmentModalProps> = ({
  isOpen, onClose, profile
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prendre rendez-vous
          </DialogTitle>
          <DialogDescription>
            Réservez un créneau avec {profile.business_name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            La prise de RDV en ligne sera bientôt disponible pour ce réparateur.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            En attendant, contactez directement le réparateur par téléphone.
          </p>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Fermer</Button>
            <Button 
              onClick={() => window.open(`tel:${profile.phone}`, '_self')} 
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumAppointmentModal;
