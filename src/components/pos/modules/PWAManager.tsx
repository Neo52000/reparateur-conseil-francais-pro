import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, Smartphone, Monitor, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PWAManagerProps {
  onInstallPrompt?: () => void;
}

export const PWAManager: React.FC<PWAManagerProps> = ({ onInstallPrompt }) => {
  const { isOnline, isInstalled, canInstall, installApp, updateAvailable, updateApp } = usePWA();

  const handleInstallClick = async () => {
    const accepted = await installApp();
    if (accepted) onInstallPrompt?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Statut PWA & Connectivité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'CONNECTÉ' : 'HORS LIGNE'}
          </Badge>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isInstalled ? 'Application installée' : 'Application web'}
            </span>
          </div>
          {canInstall && !isInstalled && (
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Installer
            </Button>
          )}
          {isInstalled && (
            <Badge variant="secondary">Installée</Badge>
          )}
        </div>

        {/* Update available */}
        {updateAvailable && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Mise à jour disponible
            </span>
            <Button size="sm" variant="outline" onClick={updateApp}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Mettre à jour
            </Button>
          </div>
        )}

        {/* Offline Capabilities */}
        <div className="text-xs text-muted-foreground">
          <p>✓ Transactions sauvegardées localement</p>
          <p>✓ Synchronisation automatique</p>
          <p>✓ Cache intelligent des données</p>
        </div>
      </CardContent>
    </Card>
  );
};
