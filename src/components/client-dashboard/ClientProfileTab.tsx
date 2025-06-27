
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erreur de déconnexion",
          description: "Une erreur s'est produite lors de la déconnexion",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès"
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

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
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Modifier le profil
          </Button>
          
          <Button onClick={handleGoHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>

          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProfileTab;
