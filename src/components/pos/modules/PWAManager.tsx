import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface PWAManagerProps {
  onInstallPrompt?: () => void;
}

export const PWAManager: React.FC<PWAManagerProps> = ({ onInstallPrompt }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Network status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connexion rétablie - Synchronisation en cours...');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Mode hors ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('Application installée avec succès!');
    });

    // Check display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType || 'unknown');
      });
    }

    // Register Service Worker (production only; centralized elsewhere)
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.error('SW registration failed:', error);
          });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
      onInstallPrompt?.();
    }
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
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {connectionType.toUpperCase()}
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
          {installPrompt && !isInstalled && (
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