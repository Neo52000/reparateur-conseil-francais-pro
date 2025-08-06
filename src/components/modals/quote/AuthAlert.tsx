
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AuthAlert: React.FC = () => {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Vous devez être connecté pour envoyer une demande de devis. 
        Vos données seront sauvegardées pendant l'inscription.
      </AlertDescription>
    </Alert>
  );
};

export default AuthAlert;
