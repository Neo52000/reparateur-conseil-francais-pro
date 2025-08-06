import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  ArrowRightLeft,
  Database,
  ShoppingCart,
  CreditCard,
  Package,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemJobs } from '@/hooks/useSystemJobs';
import { supabase } from '@/integrations/supabase/client';

interface SyncStatus {
  id: string;
  repairer_id: string;
  sync_type: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  sync_status: string;
  before_data: any;
  after_data: any;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

interface SyncStats {
  total: number;
  pending: number;
  success: number;
  failed: number;
  lastSync: string | null;
}

const SyncManager: React.FC = () => {
  const [syncLogs, setSyncLogs] = useState<SyncStatus[]>([]);
  const [stats, setStats] = useState<SyncStats>({
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
    lastSync: null
  });
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();
  const { syncJobs, createSyncJob, loading } = useSystemJobs();

  const isSyncing = syncJobs.some(job => job.status === 'pending' || job.status === 'running');

  useEffect(() => {
    fetchSyncData();
    const interval = setInterval(fetchSyncData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSyncData = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('sync_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      
      const logs = (logsData as unknown as SyncStatus[]) || [];
      setSyncLogs(logs);

      const total = logs.length;
      const pending = logs.filter(log => log.sync_status === 'pending').length;
      const success = logs.filter(log => log.sync_status === 'success').length;
      const failed = logs.filter(log => log.sync_status === 'failed').length;
      const lastSync = logs.length > 0 ? logs[0].created_at : null;

      setStats({ total, pending, success, failed, lastSync });

    } catch (error) {
      console.error('Erreur lors de la récupération des données de sync:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de synchronisation",
        variant: "destructive"
      });
    }
  };

  const handleFullSync = async () => {
    try {
      await createSyncJob(
        'full_sync',
        'pos',
        'ecommerce',
        { type: 'complete' }
      );

      toast({
        title: "Synchronisation démarrée",
        description: "La synchronisation complète a commencé...",
      });

    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "La synchronisation a échoué",
        variant: "destructive"
      });
    }
  };

  const handleRetryFailed = async () => {
    try {
      const failedLogs = syncLogs.filter(log => log.sync_status === 'failed');
      
      if (failedLogs.length === 0) {
        toast({
          title: "Aucune synchronisation échouée",
          description: "Il n'y a pas de synchronisations échouées à relancer",
        });
        return;
      }

      // Create retry sync jobs for each failed sync
      for (const failedLog of failedLogs) {
        await createSyncJob(
          failedLog.sync_type,
          'pos',
          'ecommerce',
          { retry: true, original_id: failedLog.id }
        );
      }

      toast({
        title: "Relance des synchronisations",
        description: `${failedLogs.length} synchronisations ont été relancées`,
      });
      
      await fetchSyncData();
    } catch (error: any) {
      console.error('Erreur lors de la relance:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de relancer les synchronisations",
        variant: "destructive"
      });
    }
  };

  const getSyncIcon = (syncType: string) => {
    switch (syncType) {
      case 'pos_to_ecommerce':
        return <CreditCard className="h-4 w-4" />;
      case 'ecommerce_to_pos':
        return <ShoppingCart className="h-4 w-4" />;
      case 'inventory_sync':
        return <Package className="h-4 w-4" />;
      default:
        return <ArrowRightLeft className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="text-admin-green"><CheckCircle className="h-3 w-3 mr-1" />Réussi</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échec</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire de Synchronisation</h2>
          <p className="text-muted-foreground">Synchronisation POS ↔ E-commerce</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRetryFailed}
            disabled={isSyncing || stats.failed === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Relancer les échecs
          </Button>
          
          <Button 
            onClick={handleFullSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Synchronisation complète
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progression de synchronisation */}
      {isSyncing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Synchronisation en cours...</span>
                <span className="text-sm text-muted-foreground">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-admin-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Réussis</p>
                <p className="text-2xl font-bold">{stats.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-admin-red" />
              <div>
                <p className="text-sm text-muted-foreground">Échecs</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Dernière sync</p>
                <p className="text-sm font-medium">
                  {stats.lastSync 
                    ? new Date(stats.lastSync).toLocaleString('fr-FR')
                    : 'Jamais'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs de synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Synchronisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncLogs.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun log de synchronisation disponible</p>
              </div>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getSyncIcon(log.sync_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">
                          {log.sync_type.replace('_', ' → ').replace('_', ' ')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {log.entity_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {log.operation.charAt(0).toUpperCase() + log.operation.slice(1)}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </p>
                        
                        {log.processed_at && (
                          <p className="text-xs text-muted-foreground">
                            Traité: {new Date(log.processed_at).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                      
                      {log.error_message && (
                        <p className="text-xs text-destructive mt-1">
                          Erreur: {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getStatusBadge(log.sync_status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncManager;