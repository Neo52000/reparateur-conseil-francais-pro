import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  Filter,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';
import { supabase } from '@/integrations/supabase/client';

interface CleanupOption {
  value: string;
  label: string;
  description: string;
}

const ScrapingHistoryManager = () => {
  const { toast } = useToast();
  const { logs, loading, refetch } = useScrapingStatus();
  const [cleanupFilter, setCleanupFilter] = useState<string>('older_than_week');
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const cleanupOptions: CleanupOption[] = [
    { value: 'older_than_day', label: 'Plus de 24h', description: 'Logs de plus de 24 heures' },
    { value: 'older_than_week', label: 'Plus de 7 jours', description: 'Logs de plus d\'une semaine' },
    { value: 'older_than_month', label: 'Plus de 30 jours', description: 'Logs de plus d\'un mois' },
    { value: 'failed_only', label: 'Échecs uniquement', description: 'Tous les logs en erreur' },
    { value: 'successful_only', label: 'Succès uniquement', description: 'Logs terminés avec succès' },
    { value: 'all', label: 'Tout l\'historique', description: 'Supprimer tous les logs' }
  ];

  const getCleanupQuery = (filter: string) => {
    const now = new Date();
    
    switch (filter) {
      case 'older_than_day':
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return { column: 'started_at', operator: 'lt', value: oneDayAgo.toISOString() };
      
      case 'older_than_week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { column: 'started_at', operator: 'lt', value: oneWeekAgo.toISOString() };
      
      case 'older_than_month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { column: 'started_at', operator: 'lt', value: oneMonthAgo.toISOString() };
      
      case 'failed_only':
        return { column: 'status', operator: 'eq', value: 'failed' };
      
      case 'successful_only':
        return { column: 'status', operator: 'eq', value: 'completed' };
      
      case 'all':
        return null;
      
      default:
        return null;
    }
  };

  const getLogsToDelete = (filter: string) => {
    const query = getCleanupQuery(filter);
    if (!query) return logs;
    
    return logs.filter(log => {
      if (query.column === 'started_at') {
        const logDate = new Date(log.started_at);
        const compareDate = new Date(query.value);
        return query.operator === 'lt' ? logDate < compareDate : logDate > compareDate;
      }
      
      if (query.column === 'status') {
        return query.operator === 'eq' ? log.status === query.value : log.status !== query.value;
      }
      
      return false;
    });
  };

  const handleCleanup = async () => {
    const logsToDelete = getLogsToDelete(cleanupFilter);
    
    if (logsToDelete.length === 0) {
      toast({
        title: "Aucun log à supprimer",
        description: "Aucun log ne correspond aux critères sélectionnés.",
        variant: "destructive"
      });
      return;
    }

    setIsCleaningUp(true);
    
    try {
      const query = getCleanupQuery(cleanupFilter);
      
      // Créer la requête de suppression de manière plus simple
      if (query) {
        if (query.operator === 'lt') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .lt(query.column, query.value);
          if (error) throw error;
        } else if (query.operator === 'eq') {
          const { error } = await supabase
            .from('scraping_logs')
            .delete()
            .eq(query.column, query.value);
          if (error) throw error;
        }
      } else {
        // Pour supprimer tout, on utilise une condition simple
        const { error } = await supabase
          .from('scraping_logs')
          .delete()
          .neq('id', '');
        if (error) throw error;
      }
      
      toast({
        title: "Nettoyage réussi",
        description: `${logsToDelete.length} log(s) supprimé(s) avec succès.`
      });
      
      await refetch();
      
    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      toast({
        title: "Erreur de nettoyage",
        description: error.message || "Impossible de supprimer les logs.",
        variant: "destructive"
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedOption = cleanupOptions.find(opt => opt.value === cleanupFilter);
  const logsToDelete = getLogsToDelete(cleanupFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Gestion de l'Historique
          </div>
          <Badge variant="outline">
            {logs.length} logs total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section de nettoyage */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Nettoyage de l'historique
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Critère de suppression</Label>
              <Select value={cleanupFilter} onValueChange={setCleanupFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cleanupOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOption && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedOption.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col justify-end">
              <Button
                onClick={handleCleanup}
                disabled={isCleaningUp || logsToDelete.length === 0}
                variant="destructive"
                className="w-full"
              >
                {isCleaningUp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Nettoyage...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ({logsToDelete.length})
                  </>
                )}
              </Button>
            </div>
          </div>

          {logsToDelete.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{logsToDelete.length} log(s)</strong> seront supprimés avec ce critère.
                {cleanupFilter === 'all' && (
                  <span className="text-red-600 font-medium"> Cette action supprimera TOUT l'historique !</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Aperçu de l'historique */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Aperçu de l'historique
            </h4>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Chargement...
            </div>
          ) : logs.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Aucun log de scraping trouvé. L'historique apparaîtra ici après les premières exécutions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{log.source}</span>
                        <Badge className={getStatusColor(log.status)} variant="secondary">
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <div>{log.items_added || 0} ajoutés</div>
                    <div>{log.items_updated || 0} mis à jour</div>
                  </div>
                </div>
              ))}
              {logs.length > 10 && (
                <div className="text-center text-sm text-gray-500">
                  ... et {logs.length - 10} autres logs
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {logs.filter(l => l.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Succès</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {logs.filter(l => l.status === 'failed').length}
            </div>
            <div className="text-xs text-gray-500">Échecs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {logs.filter(l => l.status === 'running').length}
            </div>
            <div className="text-xs text-gray-500">En cours</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingHistoryManager;
