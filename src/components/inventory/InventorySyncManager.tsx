import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useInventorySync } from '@/hooks/useInventorySync';

const InventorySyncManager = () => {
  const { 
    movements, 
    syncStatus, 
    loading, 
    syncPOSToEcommerce, 
    syncEcommerceToPOS, 
    checkSyncStatus,
    bulkSync
  } = useInventorySync();
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'synced':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredStatus = Object.values(syncStatus).filter(item => {
    const matchesFilter = filter === 'all' || item.sync_status === filter;
    const matchesSearch = search === '' || item.product_sku.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = Object.values(syncStatus).filter(item => item.sync_status === 'pending').length;
  const syncedCount = Object.values(syncStatus).filter(item => item.sync_status === 'synced').length;
  const errorCount = Object.values(syncStatus).filter(item => item.sync_status === 'error').length;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            Synchronisation Inventaire
          </h2>
          <p className="text-muted-foreground">
            Gérez la synchronisation entre POS et E-commerce
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => checkSyncStatus()}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(syncStatus).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synchronisés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{syncedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Statut de synchronisation</TabsTrigger>
          <TabsTrigger value="movements">Historique des mouvements</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>État de synchronisation</CardTitle>
                  <CardDescription>
                    Comparez les stocks entre POS et E-commerce
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => bulkSync('pos_to_ecom')}
                    disabled={loading || pendingCount === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    POS → E-com
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => bulkSync('ecom_to_pos')}
                    disabled={loading || pendingCount === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    E-com → POS
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher par SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="synced">Synchronisés</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="error">Erreurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredStatus.map((item) => (
                    <Card key={item.product_sku} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.sync_status)}
                          <div>
                            <h4 className="font-medium">{item.product_sku}</h4>
                            <p className="text-sm text-muted-foreground">
                              Dernière sync: {formatDate(item.last_synced)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">POS</div>
                            <div className="text-lg">{item.pos_stock}</div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            {item.pos_stock !== item.ecommerce_stock && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => syncPOSToEcommerce(item.product_sku)}
                                  disabled={loading}
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => syncEcommerceToPOS(item.product_sku)}
                                  disabled={loading}
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium">E-commerce</div>
                            <div className="text-lg">{item.ecommerce_stock}</div>
                          </div>
                          
                          <Badge variant={getStatusColor(item.sync_status)}>
                            {item.sync_status === 'synced' ? 'Sync' : 
                             item.sync_status === 'pending' ? 'Attente' : 'Erreur'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des mouvements</CardTitle>
              <CardDescription>
                Consultez l'historique des mouvements d'inventaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {movements.map((movement) => (
                    <Card key={movement.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium">{movement.product_sku}</h4>
                            <p className="text-sm text-muted-foreground">
                              {movement.reason || 'Mouvement manuel'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge variant={movement.movement_type === 'in' ? 'default' : 
                                         movement.movement_type === 'out' ? 'destructive' : 'secondary'}>
                            {movement.movement_type === 'in' ? 'Entrée' : 
                             movement.movement_type === 'out' ? 'Sortie' : 
                             movement.movement_type === 'adjustment' ? 'Ajustement' : 'Transfert'}
                          </Badge>
                          
                          <div className={`text-lg font-medium ${
                            movement.movement_type === 'in' ? 'text-green-600' : 
                            movement.movement_type === 'out' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {movement.movement_type === 'in' ? '+' : 
                             movement.movement_type === 'out' ? '-' : '±'}{movement.quantity}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {formatDate(movement.created_at)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventorySyncManager;