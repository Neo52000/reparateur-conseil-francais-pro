
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Users, Save } from 'lucide-react';

/**
 * Composant pour contrôler l'accès global des clients à la plateforme
 * Utilise le système de feature flags pour gérer l'état
 */
const ClientAccessControl = () => {
  const { getFlag, handleToggleFlag, handleSave, saving } = useFeatureFlags();

  // Vérifier l'état du flag pour le plan "Premium" (plan le plus élevé)
  const clientAccessFlag = getFlag("Premium", "client_access_enabled");
  const isClientAccessEnabled = clientAccessFlag?.enabled || false;

  const handleToggle = (enabled: boolean) => {
    // Activer/désactiver pour tous les plans
    handleToggleFlag("Gratuit", "client_access_enabled", enabled);
    handleToggleFlag("Visibilité", "client_access_enabled", enabled);
    handleToggleFlag("Pro", "client_access_enabled", enabled);
    handleToggleFlag("Premium", "client_access_enabled", enabled);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Contrôle d'accès client</span>
          <Badge variant={isClientAccessEnabled ? "default" : "secondary"}>
            {isClientAccessEnabled ? "Activé" : "Désactivé"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Accès client global</p>
            <p className="text-sm text-muted-foreground">
              {isClientAccessEnabled 
                ? "Les clients peuvent accéder à leurs espaces personnels"
                : "L'accès client est désactivé sur toute la plateforme"
              }
            </p>
          </div>
          <Switch
            checked={isClientAccessEnabled}
            onCheckedChange={handleToggle}
            aria-label="Activer/désactiver l'accès client"
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>💡 Cette fonctionnalité sera implémentée prochainement.</p>
          <p>Le contrôle permet de préparer l'activation de l'espace client.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientAccessControl;
