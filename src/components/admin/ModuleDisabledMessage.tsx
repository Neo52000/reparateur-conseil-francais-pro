import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Power, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleDisabledMessageProps {
  module: string;
  description?: string;
}

const ModuleDisabledMessage: React.FC<ModuleDisabledMessageProps> = ({ 
  module, 
  description = "Ce module est actuellement désactivé dans la configuration." 
}) => {
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    navigate('/admin/features');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
          <Power className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Module {module} Désactivé</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Pour activer ce module, rendez-vous dans la gestion des feature flags.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button onClick={handleGoToSettings} className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            Gérer les Modules
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Pourquoi ce module est-il désactivé ?</h4>
          <ul className="text-muted-foreground space-y-1">
            <li>• Diagnostic en cours pour identifier des problèmes</li>
            <li>• Maintenance préventive du système</li>
            <li>• Configuration spécifique à votre environnement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleDisabledMessage;