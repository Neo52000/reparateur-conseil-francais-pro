
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';

const ScrapingControl = () => {
  const { logs, loading, isScrapingRunning, startScraping } = useScrapingStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Gestion du Scraping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contrôles de scraping */}
        <div className="flex space-x-2">
          <Button
            onClick={() => startScraping('pages_jaunes')}
            disabled={isScrapingRunning}
            size="sm"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Scraper Pages Jaunes
          </Button>
          <Button
            onClick={() => startScraping('google_places')}
            disabled={isScrapingRunning}
            size="sm"
            variant="outline"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Scraper Google Places
          </Button>
        </div>

        {/* Status des derniers scraping */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Historique des scraping</h4>
          {loading ? (
            <div className="text-sm text-gray-500">Chargement...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-gray-500">Aucun scraping effectué</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <span className="text-sm font-medium">{log.source}</span>
                    <Badge variant={log.status === 'completed' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.items_added} ajoutés • {formatDate(log.started_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingControl;
