import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { APP_CONFIG } from '@/config';

const FeatureFlagsToggle: React.FC = () => {
  const [features, setFeatures] = useState(APP_CONFIG.features);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFeatureToggle = (featureKey: keyof typeof APP_CONFIG.features, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: enabled
    }));
    setHasChanges(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const featuresList = [
    {
      key: 'enableSuppliersDirectory' as keyof typeof APP_CONFIG.features,
      title: 'Annuaire Fournisseurs',
      description: 'Module d\'annuaire des fournisseurs de pièces détachées',
      status: features.enableSuppliersDirectory,
      category: 'Modules Business'
    },
    {
      key: 'enableAdvancedSearch' as keyof typeof APP_CONFIG.features,
      title: 'Recherche Avancée',
      description: 'Fonctionnalités de recherche et filtrage avancés',
      status: features.enableAdvancedSearch,
      category: 'Fonctionnalités Core'
    },
    {
      key: 'enableNotifications' as keyof typeof APP_CONFIG.features,
      title: 'Notifications',
      description: 'Système de notifications utilisateurs',
      status: features.enableNotifications,
      category: 'Fonctionnalités Core'
    },
    {
      key: 'enableAnalytics' as keyof typeof APP_CONFIG.features,
      title: 'Analytics',
      description: 'Suivi et analyse des données utilisateurs',
      status: features.enableAnalytics,
      category: 'Fonctionnalités Core'
    },
    {
      key: 'enableDemo' as keyof typeof APP_CONFIG.features,
      title: 'Mode Démo',
      description: 'Mode démonstration pour les tests (PRODUCTION: désactivé)',
      status: features.enableDemo,
      category: 'Développement',
      readonly: true
    }
  ];

  const groupedFeatures = featuresList.reduce((groups, feature) => {
    const category = feature.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
    return groups;
  }, {} as Record<string, typeof featuresList>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Gestion des Feature Flags</CardTitle>
          </div>
          <CardDescription>
            Activez ou désactivez les modules et fonctionnalités de l'application en temps réel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasChanges && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Des modifications ont été apportées. Vous devez recharger la page pour les appliquer.
                <Button 
                  onClick={handleReload} 
                  size="sm" 
                  className="ml-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recharger la page
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {Object.entries(groupedFeatures).map(([category, features]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={feature.key} className="font-medium">
                          {feature.title}
                        </Label>
                        {feature.readonly && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            PRODUCTION
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      id={feature.key}
                      checked={feature.status}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                      disabled={feature.readonly}
                    />
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
            </div>
          ))}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instructions d'utilisation :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Activez/désactivez les modules selon vos besoins</li>
              <li>• Les changements nécessitent un rechargement de page</li>
              <li>• Les modules désactivés affichent un message informatif</li>
              <li>• Le mode démo est verrouillé en production</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagsToggle;