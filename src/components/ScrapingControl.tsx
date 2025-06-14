
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
  RefreshCw,
  Brain,
  TrendingUp
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

  const getTotalStats = () => {
    const completedLogs = logs.filter(log => log.status === 'completed');
    const totalAdded = completedLogs.reduce((sum, log) => sum + (log.items_added || 0), 0);
    const totalUpdated = completedLogs.reduce((sum, log) => sum + (log.items_updated || 0), 0);
    return { totalAdded, totalUpdated };
  };

  const { totalAdded, totalUpdated } = getTotalStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Scraping IA Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Réparateurs ajoutés</p>
                  <p className="text-2xl font-bold text-blue-900">{totalAdded}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Réparateurs mis à jour</p>
                  <p className="text-2xl font-bold text-green-900">{totalUpdated}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total traité</p>
                  <p className="text-2xl font-bold text-purple-900">{totalAdded + totalUpdated}</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

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
            <Button
              onClick={() => startScraping('facebook')}
              disabled={isScrapingRunning}
              size="sm"
              variant="outline"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Scraper Facebook
            </Button>
          </div>

          {/* Informations sur l'IA */}
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">🤖 Analyse IA avec Mistral</h4>
            <ul className="text-xs text-indigo-800 space-y-1">
              <li>• Classification automatique des entreprises (réparateur ou non)</li>
              <li>• Détection des services proposés (réparation iPhone, Samsung, etc.)</li>
              <li>• Évaluation de la gamme de prix (low, medium, high)</li>
              <li>• Vérification du statut d'ouverture/fermeture</li>
              <li>• Score de confiance pour filtrer les faux positifs</li>
            </ul>
          </div>

          {/* Historique des scraping */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Historique des scraping</h4>
            {loading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : logs.length === 0 ? (
              <div className="text-sm text-gray-500">Aucun scraping effectué</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <span className="text-sm font-medium">{log.source}</span>
                        <Badge 
                          variant={log.status === 'completed' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}
                          className="ml-2"
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        {log.items_added || 0} ajoutés • {log.items_updated || 0} mis à jour
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(log.started_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingControl;
