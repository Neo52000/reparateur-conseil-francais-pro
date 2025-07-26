import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings,
  RotateCcw,
  Package,
  Wrench,
  Smartphone
} from 'lucide-react';

const mockSyncStatus = {
  last_sync: '2024-01-20T14:30:00Z',
  sync_interval: 'daily',
  auto_sync: true,
  total_items: 156,
  synced_items: 142,
  pending_items: 8,
  error_items: 6
};

const mockCatalogItems = [
  {
    id: '1',
    type: 'product',
    name: 'Écran iPhone 13 Pro',
    category: 'Pièces détachées',
    price: 89.99,
    stock: 15,
    sync_status: 'synced',
    last_synced: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    type: 'service',
    name: 'Réparation écran Samsung Galaxy S21',
    category: 'Services',
    price: 120.00,
    stock: null,
    sync_status: 'pending',
    last_synced: null
  },
  {
    id: '3',
    type: 'product',
    name: 'Batterie iPhone 12',
    category: 'Pièces détachées',
    price: 45.50,
    stock: 8,
    sync_status: 'error',
    last_synced: '2024-01-20T10:15:00Z',
    error: 'Prix manquant dans le système POS'
  }
];

export const CatalogSync = () => {
  const [autoSync, setAutoSync] = useState(mockSyncStatus.auto_sync);
  const [syncInterval, setSyncInterval] = useState(mockSyncStatus.sync_interval);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    // Simulation de synchronisation
    setTimeout(() => {
      setIsManualSyncing(false);
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge className="bg-green-100 text-green-800">Synchronisé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'service':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Synchronisation catalogue</h2>
        <p className="text-muted-foreground">
          Importez automatiquement votre catalogue POS pour créer vos campagnes
        </p>
      </div>

      {/* Status général */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total articles</p>
                <p className="text-2xl font-bold text-foreground">{mockSyncStatus.total_items}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Synchronisés</p>
                <p className="text-2xl font-bold text-foreground">{mockSyncStatus.synced_items}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-foreground">{mockSyncStatus.pending_items}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erreurs</p>
                <p className="text-2xl font-bold text-foreground">{mockSyncStatus.error_items}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration de synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Synchronisation automatique</p>
                <p className="text-sm text-muted-foreground">
                  Mettre à jour automatiquement le catalogue
                </p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fréquence de synchronisation</label>
              <Select value={syncInterval} onValueChange={setSyncInterval} disabled={!autoSync}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Dernière synchronisation : {new Date(mockSyncStatus.last_sync).toLocaleString()}
              </p>
              <Button 
                onClick={handleManualSync} 
                disabled={isManualSyncing}
                className="w-full"
              >
                {isManualSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Synchroniser maintenant
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut de la connexion POS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Connexion active</p>
                <p className="text-sm text-green-600">
                  API TopRéparateurs.fr connectée et fonctionnelle
                </p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Endpoint:</span>
                <span className="font-mono">api.topreparateurs.fr/v1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Version API:</span>
                <span>v1.2.3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Latence:</span>
                <span className="text-green-600">45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles du catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCatalogItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      {getStatusIcon(item.sync_status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                      <span className="text-sm font-medium">€{item.price}</span>
                      {item.stock !== null && (
                        <span className="text-sm text-muted-foreground">
                          Stock: {item.stock}
                        </span>
                      )}
                    </div>
                    {item.error && (
                      <p className="text-sm text-red-600 mt-1">{item.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(item.sync_status)}
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};