
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureFlagAdmin: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Feature Flags</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contrôlez l'activation des fonctionnalités selon les plans d'abonnement
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-center p-8 text-muted-foreground">
            🚧 Cette interface est maintenant disponible dans "Gestion des fonctionnalités" → "Plans & Fonctionnalités"
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagAdmin;
