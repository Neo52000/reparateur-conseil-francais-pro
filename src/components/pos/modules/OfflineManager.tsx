import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Download,
  Upload,
  RefreshCw,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface OfflineData {
  type: string;
  count: number;
  size: string;
  lastUpdate: string;
}

interface PendingSync {
  id: string;
  type: 'transaction' | 'inventory' | 'customer';
  action: 'create' | 'update' | 'delete';
  description: string;
  timestamp: string;
  retries: number;
}

const OfflineManager: React.FC = () => {
  const { toast } = useToast();
  const {
    isOnline,
    syncInProgress,
    hasPendingActions,
    stats,
    syncPendingActions,
    cleanup,
    loadStats
  } = useOfflineSync({ autoSync: true });

  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [pendingSyncs, setPendingSyncs] = useState<PendingSync[]>([]);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [storageUsage, setStorageUsage] = useState(0);
  const [cacheStats, setCacheStats] = useState({
    products: 0,
    customers: 0,
    transactions: 0,
    totalSize: 0
  });

  useEffect(() => {
    loadOfflineData();
    loadPendingSyncs();
    checkStorageUsage();
  }, []);

  const loadOfflineData = async () => {
    // Simuler le chargement des données hors ligne depuis IndexedDB
    const mockData: OfflineData[] = [
      {
        type: 'Produits',
        count: 1247,
        size: '2.3 MB',
        lastUpdate: new Date(Date.now() - 3600000).toISOString()
      },
      {
        type: 'Clients',
        count: 89,
        size: '156 KB',
        lastUpdate: new Date(Date.now() - 7200000).toISOString()
      },
      {
        type: 'Transactions',
        count: 23,
        size: '45 KB',
        lastUpdate: new Date(Date.now() - 1800000).toISOString()
      },
      {
        type: 'Images',
        count: 342,
        size: '15.7 MB',
        lastUpdate: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    setOfflineData(mockData);
    
    setCacheStats({
      products: 1247,
      customers: 89,
      transactions: 23,
      totalSize: 18.201 // MB
    });
  };

  const loadPendingSyncs = async () => {
    // Simuler les synchronisations en attente
    const mockPending: PendingSync[] = [
      {
        id: '1',
        type: 'transaction',
        action: 'create',
        description: 'Vente #TXN-2024-001 - 149.90€',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        retries: 0
      },
      {
        id: '2',
        type: 'inventory',
        action: 'update',
        description: 'Stock Écran iPhone 13 - Qty: 3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        retries: 1
      }
    ];
    
    if (!isOnline) {
      setPendingSyncs(mockPending);
    }
  };

  const checkStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 1;
        setStorageUsage((used / quota) * 100);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stockage:', error);
    }
  };

  const forceSync = async () => {
    try {
      await syncPendingActions();
      await loadPendingSyncs();
      toast({
        title: "Synchronisation terminée",
        description: "Toutes les données ont été synchronisées avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser certaines données",
        variant: "destructive"
      });
    }
  };

  const clearCache = async (dataType?: string) => {
    try {
      if (dataType) {
        // Nettoyer un type spécifique
        await cleanup(7); // Nettoyer les données de plus de 7 jours
        toast({
          title: "Cache nettoyé",
          description: `Les données ${dataType} ont été supprimées`
        });
      } else {
        // Nettoyer tout le cache
        await cleanup(0); // Nettoyer toutes les données
        toast({
          title: "Cache vidé",
          description: "Toutes les données hors ligne ont été supprimées"
        });
      }
      
      await loadOfflineData();
      await checkStorageUsage();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer le cache",
        variant: "destructive"
      });
    }
  };

  const downloadForOffline = async (dataType: string) => {
    toast({
      title: "Téléchargement en cours",
      description: `Synchronisation des données ${dataType} pour usage hors ligne...`
    });

    // Simuler le téléchargement
    setTimeout(() => {
      toast({
        title: "Téléchargement terminé",
        description: `${dataType} disponibles hors ligne`
      });
      loadOfflineData();
    }, 2000);
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-600" />,
        text: "En ligne",
        color: "text-green-600"
      };
    } else {
      return {
        icon: <WifiOff className="h-4 w-4 text-red-600" />,
        text: "Hors ligne",
        color: "text-red-600"
      };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Gestion Hors Ligne
          </h2>
          <p className="text-muted-foreground">
            Contrôlez la synchronisation et les données en mode déconnecté
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`font-medium ${status.color}`}>{status.text}</span>
          </div>
          {hasPendingActions && (
            <Badge variant="destructive" className="animate-pulse">
              {stats?.pendingActions || 0} en attente
            </Badge>
          )}
        </div>
      </div>

      {/* Statut et actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Statut de connexion</h3>
              {status.icon}
            </div>
            <p className={`text-2xl font-bold ${status.color} mb-2`}>
              {status.text}
            </p>
            {!isOnline && pendingSyncs.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {pendingSyncs.length} actions en attente de synchronisation
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Stockage local</h3>
              <HardDrive className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-2">
              {cacheStats.totalSize.toFixed(1)} MB
            </p>
            <Progress value={storageUsage} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {storageUsage.toFixed(1)}% de l'espace utilisé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Synchronisation automatique</h3>
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Switch 
                id="auto-sync" 
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
              />
              <Label htmlFor="auto-sync">Activer</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Synchronise automatiquement quand la connexion est rétablie
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Statut</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="space-y-6">
            {!isOnline && (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mode hors ligne activé.</strong> Vos données sont sauvegardées localement 
                  et seront synchronisées dès que la connexion sera rétablie.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{cacheStats.products}</p>
                  <p className="text-sm text-muted-foreground">Produits en cache</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{cacheStats.transactions}</p>
                  <p className="text-sm text-muted-foreground">Transactions en attente</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{stats?.pendingActions || 0}</p>
                  <p className="text-sm text-muted-foreground">Actions à synchroniser</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{stats?.cachedItems || 0}</p>
                  <p className="text-sm text-muted-foreground">Syncs réussies</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cache">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Données en cache</h3>
              <Button 
                variant="outline" 
                onClick={() => clearCache()}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le cache
              </Button>
            </div>

            <div className="grid gap-4">
              {offlineData.map((data) => (
                <Card key={data.type}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{data.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.count} éléments • {data.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dernière MAJ: {new Date(data.lastUpdate).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadForOffline(data.type)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Actualiser
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => clearCache(data.type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sync">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Actions en attente</h3>
              <Button 
                onClick={forceSync}
                disabled={syncInProgress || !isOnline}
                size="sm"
              >
                {syncInProgress ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Synchroniser maintenant
              </Button>
            </div>

            {pendingSyncs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-medium mb-2">Tout est synchronisé</h3>
                  <p className="text-muted-foreground">
                    Aucune action en attente de synchronisation
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingSyncs.map((sync) => (
                  <Card key={sync.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize">
                              {sync.type}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {sync.action}
                            </Badge>
                          </div>
                          <p className="font-medium">{sync.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sync.timestamp).toLocaleString('fr-FR')}
                            {sync.retries > 0 && ` • ${sync.retries} tentatives`}
                          </p>
                        </div>
                        
                        {sync.retries > 0 && (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de synchronisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync-setting">Synchronisation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Synchronise automatiquement quand la connexion est rétablie
                    </p>
                  </div>
                  <Switch 
                    id="auto-sync-setting"
                    checked={autoSyncEnabled}
                    onCheckedChange={setAutoSyncEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sauvegarde offline des images</Label>
                    <p className="text-sm text-muted-foreground">
                      Télécharge les images produits pour consultation hors ligne
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode économie de données</Label>
                    <p className="text-sm text-muted-foreground">
                      Limite la synchronisation aux données essentielles
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestion du stockage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Espace de stockage utilisé</Label>
                  <Progress value={storageUsage} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {cacheStats.totalSize.toFixed(1)} MB utilisés ({storageUsage.toFixed(1)}%)
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => clearCache()}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Nettoyer le cache et libérer l'espace
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfflineManager;