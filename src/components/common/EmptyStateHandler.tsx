
import React from 'react';
import { AlertCircle, Database, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateHandlerProps {
  type: 'no-data' | 'loading' | 'error' | 'network' | 'unauthorized';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

const EmptyStateHandler: React.FC<EmptyStateHandlerProps> = ({
  type,
  title,
  description,
  action,
  children
}) => {
  const getStateConfig = () => {
    switch (type) {
      case 'no-data':
        return {
          icon: Database,
          defaultTitle: 'Aucune donnée disponible',
          defaultDescription: 'Il n\'y a pas encore de données à afficher.',
          iconColor: 'text-gray-400'
        };
      
      case 'loading':
        return {
          icon: RefreshCw,
          defaultTitle: 'Chargement en cours...',
          defaultDescription: 'Veuillez patienter pendant le chargement des données.',
          iconColor: 'text-blue-500',
          animate: true
        };
      
      case 'error':
        return {
          icon: AlertCircle,
          defaultTitle: 'Une erreur s\'est produite',
          defaultDescription: 'Impossible de charger les données. Veuillez réessayer.',
          iconColor: 'text-red-500'
        };
      
      case 'network':
        return {
          icon: Wifi,
          defaultTitle: 'Problème de connexion',
          defaultDescription: 'Vérifiez votre connexion internet et réessayez.',
          iconColor: 'text-orange-500'
        };
      
      case 'unauthorized':
        return {
          icon: AlertCircle,
          defaultTitle: 'Accès non autorisé',
          defaultDescription: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
          iconColor: 'text-red-500'
        };
      
      default:
        return {
          icon: AlertCircle,
          defaultTitle: 'État inconnu',
          defaultDescription: 'Une situation inattendue s\'est produite.',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Icon 
            className={`h-12 w-12 ${config.iconColor} ${config.animate ? 'animate-spin' : ''}`}
          />
        </div>
        <CardTitle className="text-lg">
          {title || config.defaultTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-6">
          {description || config.defaultDescription}
        </p>
        
        {action && (
          <Button onClick={action.onClick} className="mb-4">
            {action.label}
          </Button>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default EmptyStateHandler;
