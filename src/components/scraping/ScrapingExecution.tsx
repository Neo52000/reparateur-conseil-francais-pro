
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  StopCircle, 
  PauseCircle,
  RefreshCw,
  Brain,
  TrendingUp,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';

const ScrapingExecution = () => {
  const { logs, loading, isScrapingRunning, startScraping } = useScrapingStatus();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);

  const sources = [
    { 
      id: 'pages_jaunes', 
      name: 'Pages Jaunes', 
      icon: '📞', 
      description: 'Annuaire français traditionnel',
      estimatedItems: '~2,500 entreprises'
    },
    { 
      id: 'google_places', 
      name: 'Google Places', 
      icon: '🗺️', 
      description: 'API Google My Business',
      estimatedItems: '~5,000 entreprises'
    },
    { 
      id: 'facebook', 
      name: 'Facebook Business', 
      icon: '📘', 
      description: 'Pages entreprises Facebook',
      estimatedItems: '~1,200 entreprises'
    },
    { 
      id: 'yelp', 
      name: 'Yelp Business', 
      icon: '⭐', 
      description: 'Avis et entreprises Yelp',
      estimatedItems: '~800 entreprises'
    }
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleStartScraping = async () => {
    if (selectedSources.length === 0) return;
    
    for (const source of selectedSources) {
      await startScraping(source);
    }
  };

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

  const getTotalStats = () => {
    const completedLogs = logs.filter(log => log.status === 'completed');
    const totalAdded = completedLogs.reduce((sum, log) => sum + (log.items_added || 0), 0);
    const totalUpdated = completedLogs.reduce((sum, log) => sum + (log.items_updated || 0), 0);
    const totalScraped = completedLogs.reduce((sum, log) => sum + (log.items_scraped || 0), 0);
    return { totalAdded, totalUpdated, totalScraped };
  };

  const { totalAdded, totalUpdated, totalScraped } = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Stats en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Ajoutés</p>
                <p className="text-3xl font-bold text-blue-900">{totalAdded}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Mis à jour</p>
                <p className="text-3xl font-bold text-green-900">{totalUpdated}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Traités</p>
                <p className="text-3xl font-bold text-purple-900">{totalScraped}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Précision IA</p>
                <p className="text-3xl font-bold text-orange-900">94%</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélection des sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Sélection des Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedSources.includes(source.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSourceToggle(source.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{source.icon}</span>
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-xs text-gray-500">{source.description}</p>
                    </div>
                  </div>
                  {selectedSources.includes(source.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {source.estimatedItems}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex space-x-3">
            <Button
              onClick={handleStartScraping}
              disabled={isScrapingRunning || selectedSources.length === 0}
              className="flex-1"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Démarrer le Scraping IA
            </Button>
            <Button
              variant="outline"
              disabled={!isScrapingRunning}
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              variant="destructive"
              disabled={!isScrapingRunning}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Arrêter
            </Button>
          </div>

          {isScrapingRunning && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression du scraping</span>
                <span className="text-sm text-gray-600">{executionProgress}%</span>
              </div>
              <Progress value={executionProgress} className="mb-2" />
              <div className="flex items-center text-xs text-gray-600">
                <Brain className="h-3 w-3 mr-1" />
                IA en cours d'analyse des données...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des exécutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Historique des Exécutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-gray-300" />
              <p className="text-gray-500 mt-2">Aucun scraping effectué</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{log.source}</span>
                        <Badge 
                          variant={
                            log.status === 'completed' ? 'default' : 
                            log.status === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      +{log.items_added || 0} • ↻{log.items_updated || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.items_scraped || 0} traités
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingExecution;
