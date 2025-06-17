import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Filter, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';

interface HistoryPreviewProps {
  logs: ScrapingLog[];
  loading: boolean;
  onRefetch: () => void;
}

const HistoryPreview: React.FC<HistoryPreviewProps> = ({
  logs,
  loading,
  onRefetch
}) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Aperçu de l'historique
        </h4>
        <Button onClick={onRefetch} variant="outline" size="sm">
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
  );
};

export default HistoryPreview;
