
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Clock, Phone, Mail } from 'lucide-react';

interface RepairerActionsProps {
  repairer: any;
  onViewProfile: () => void;
  onQuoteRequest: () => void;
  onAppointmentRequest: () => void;
}

const RepairerActions: React.FC<RepairerActionsProps> = ({
  repairer,
  onViewProfile,
  onQuoteRequest,
  onAppointmentRequest
}) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={onViewProfile}
        className="w-full bg-gray-800 hover:bg-gray-900"
      >
        <User className="h-4 w-4 mr-2" />
        Voir la fiche complète
      </Button>
      
      <Button 
        onClick={onQuoteRequest}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Demander un devis
      </Button>
      
      <Button 
        onClick={onAppointmentRequest}
        variant="outline" 
        className="w-full"
      >
        <Clock className="h-4 w-4 mr-2" />
        Prendre rendez-vous
      </Button>

      {repairer.phone && (
        <Button 
          onClick={() => window.location.href = `tel:${repairer.phone}`}
          variant="outline" 
          className="w-full"
        >
          <Phone className="h-4 w-4 mr-2" />
          Appeler
        </Button>
      )}

      {repairer.email && (
        <Button 
          onClick={() => window.location.href = `mailto:${repairer.email}`}
          variant="outline" 
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      )}
    </div>
  );
};

export default RepairerActions;
