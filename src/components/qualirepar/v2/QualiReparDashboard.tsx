import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Recycle, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQualiReparDossiers } from '@/hooks/useQualiReparDossiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QualiReparDossier } from '@/types/qualirepar';

interface DossierStats {
  total: number;
  draft: number;
  processing: number;
  submitted: number;
  approved: number;
  rejected: number;
  totalRequested: number;
  totalApproved: number;
}

const QualiReparDashboard: React.FC = () => {
  const { dossiers, loading, reload } = useQualiReparDossiers();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadApiLogs();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('qualirepar_status_notifications')
        .select('*')
        .eq('recipient_user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadApiLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data } = await supabase
        .from('qualirepar_api_logs')
        .select(`
          *,
          qualirepar_dossiers!inner(
            dossier_number,
            repairer_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setApiLogs(data || []);
    } catch (error) {
      console.error('Error loading API logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStats = (): DossierStats => {
    const stats: DossierStats = {
      total: dossiers.length,
      draft: 0,
      processing: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      totalRequested: 0,
      totalApproved: 0
    };

    dossiers.forEach(dossier => {
      switch (dossier.status) {
        case 'draft':
        case 'metadata_complete':
        case 'documents_uploaded':
          stats.draft++;
          break;
        case 'ready_to_submit':
        case 'submitted':
        case 'processing':
          stats.processing++;
          break;
        case 'approved':
          stats.approved++;
          stats.totalApproved += dossier.requested_bonus_amount || 0;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
      stats.totalRequested += dossier.requested_bonus_amount || 0;
    });

    return stats;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary', icon: FileText, label: 'Brouillon' },
      'metadata_complete': { variant: 'outline', icon: Clock, label: 'Métadonnées OK' },
      'documents_uploaded': { variant: 'outline', icon: Clock, label: 'Documents uploadés' },
      'ready_to_submit': { variant: 'default', icon: Clock, label: 'Prêt à soumettre' },
      'submitted': { variant: 'default', icon: Clock, label: 'Soumis' },
      'processing': { variant: 'default', icon: RefreshCw, label: 'En traitement' },
      'approved': { variant: 'default', icon: CheckCircle, label: 'Approuvé' },
      'paid': { variant: 'default', icon: CheckCircle, label: 'Payé' },
      'rejected': { variant: 'destructive', icon: XCircle, label: 'Rejeté' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleRefresh = () => {
    reload();
    loadNotifications();
    loadApiLogs();
    toast.success('Données actualisées');
  };

  const handleViewDossier = (dossier: QualiReparDossier) => {
    // TODO: Navigation vers le détail du dossier
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Recycle className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord QualiRépar</h1>
            <p className="text-muted-foreground">
              Suivez vos dossiers de bonus réparation en temps réel
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dossiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En traitement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approuvés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant approuvé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.totalApproved.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taux de succès */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taux de succès</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Dossiers approuvés</span>
              <span>{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</span>
            </div>
            <Progress value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} />
          </div>
        </CardContent>
      </Card>

      {/* Contenu avec onglets */}
      <Tabs defaultValue="dossiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dossiers">Mes Dossiers</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="logs">Logs API</TabsTrigger>
        </TabsList>

        <TabsContent value="dossiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dossiers récents</CardTitle>
            </CardHeader>
            <CardContent>
              {dossiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun dossier trouvé. Créez votre premier dossier QualiRépar.
                </div>
              ) : (
                <div className="space-y-3">
                  {dossiers.slice(0, 10).map((dossier) => (
                    <div
                      key={dossier.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">{dossier.dossier_number}</span>
                          {getStatusBadge(dossier.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Client: {dossier.client_name}</div>
                          <div>Produit: {dossier.product_brand} {dossier.product_model}</div>
                          <div>Montant demandé: {dossier.requested_bonus_amount}€</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDossier(dossier)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Alert key={notification.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{notification.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs des appels API</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Chargement des logs...
                </div>
              ) : apiLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun log d'API disponible
                </div>
              ) : (
                <div className="space-y-3">
                  {apiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge
                            variant={log.response_status >= 200 && log.response_status < 300 ? 'default' : 'destructive'}
                          >
                            {log.response_status || 'N/A'}
                          </Badge>
                          <span className="font-medium">{log.api_endpoint}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                          {log.response_time_ms && ` • ${log.response_time_ms}ms`}
                        </div>
                        {log.error_details && (
                          <div className="text-sm text-red-600 mt-1">
                            {log.error_details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualiReparDashboard;