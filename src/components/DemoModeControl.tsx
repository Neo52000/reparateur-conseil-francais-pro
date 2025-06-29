
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Database, Eye, EyeOff } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

const DemoModeControl: React.FC = () => {
  const { demoModeEnabled, loading, toggleDemoMode } = useDemoMode();

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Contrôle du Mode Démo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {demoModeEnabled ? (
              <Eye className="h-4 w-4 text-blue-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-600" />
            )}
            <Label htmlFor="demo-mode-switch" className="text-sm font-medium">
              Mode démo
            </Label>
          </div>
          <Switch
            id="demo-mode-switch"
            checked={demoModeEnabled}
            onCheckedChange={toggleDemoMode}
            disabled={loading}
          />
        </div>

        <div className="flex items-start gap-2 p-3 bg-white rounded-lg border">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Mode démo activé :</strong> Affiche les données factices pour les démonstrations
            </p>
            <p>
              <strong>Mode démo désactivé :</strong> Affiche uniquement les vraies données de production
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          État actuel : {demoModeEnabled ? (
            <span className="text-blue-600 font-medium">Données de démonstration visibles</span>
          ) : (
            <span className="text-gray-600 font-medium">Données réelles uniquement</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoModeControl;
