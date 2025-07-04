import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock,
  Database,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { offlineService } from '@/services/offlineService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [stats, setStats] = useState({
    pendingActions: 0,
    cachedItems: 0,
    lastSync: null as number | null
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation en cours...",
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors ligne",
        description: "Vous pouvez continuer à travailler. Les données seront synchronisées au retour en ligne.",
        variant: "destructive",
        duration: 5000
      });
    };

    const handleOfflineModeActivated = () => {
      loadStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offlineModeActivated', handleOfflineModeActivated);

    // Charger les statistiques initiales
    loadStats();

    // Mettre à jour les stats périodiquement
    const interval = setInterval(loadStats, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineModeActivated', handleOfflineModeActivated);
      clearInterval(interval);
    };
  }, [toast]);

  const loadStats = async () => {
    try {
      const newStats = await offlineService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Erreur chargement stats offline:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Pas de connexion",
        description: "Impossible de synchroniser sans connexion internet",
        variant: "destructive"
      });
      return;
    }

    setSyncInProgress(true);
    try {
      await offlineService.syncPendingActions();
      await loadStats();
      toast({
        title: "Synchronisation réussie",
        description: "Toutes les données ont été synchronisées",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Certaines données n'ont pas pu être synchronisées",
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Jamais';
    return format(new Date(timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowDetails(true)}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {isOnline ? 'En ligne' : 'Hors ligne'}
          {stats.pendingActions > 0 && (
            <span className="ml-1 bg-yellow-500 text-yellow-50 px-1.5 py-0.5 rounded-full text-xs">
              {stats.pendingActions}
            </span>
          )}
        </Badge>

        {stats.pendingActions > 0 && isOnline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncInProgress}
            className="h-6 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${syncInProgress ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              État de la connexion
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Statut principal */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {isOnline ? 'Connecté' : 'Mode hors ligne'}
                    </span>
                  </div>
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                </div>
                
                {!isOnline && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Vos actions sont sauvegardées et seront synchronisées automatiquement 
                    dès que la connexion sera rétablie.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">En attente</p>
                      <p className="text-lg font-bold">{stats.pendingActions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">En cache</p>
                      <p className="text-lg font-bold">{stats.cachedItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dernière synchronisation */}
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Dernière synchronisation</span>
                  </div>
                <p className="text-sm text-muted-foreground">
                  {formatLastSync(stats.lastSync)}
                </p>
              </CardContent>
            </Card>

            {/* Actions de synchronisation */}
            {stats.pendingActions > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Synchronisation</span>
                    </div>
                    {syncInProgress && (
                      <div className="animate-spin">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  {syncInProgress && (
                    <div className="mb-3">
                      <Progress value={undefined} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Synchronisation en cours...
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSync}
                    disabled={!isOnline || syncInProgress}
                    className="w-full"
                    size="sm"
                  >
                    {syncInProgress ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Synchronisation...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Synchroniser maintenant
                      </>
                    )}
                  </Button>
                  
                  {!isOnline && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Synchronisation disponible uniquement en ligne
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};