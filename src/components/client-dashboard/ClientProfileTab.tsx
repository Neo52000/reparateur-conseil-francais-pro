
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings
} from 'lucide-react';

interface ClientProfileTabProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    memberSince: string;
  };
}

const ClientProfileTab: React.FC<ClientProfileTabProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nom complet</label>
            <p className="text-gray-900">{profile.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Téléphone</label>
            <p className="text-gray-900">{profile.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Adresse</label>
            <p className="text-gray-900">{profile.address}</p>
          </div>
        </div>
        
        <div className="flex pt-4 border-t">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Modifier le profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProfileTab;
