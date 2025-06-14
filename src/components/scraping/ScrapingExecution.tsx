
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
  Globe,
  Bot,
  AlertTriangle
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';

const ScrapingExecution = () => {
  const { logs, loading, isScrapingRunning, startScraping } = useScrapingStatus();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const sources = [
    { 
      id: 'pages_jaunes', 
      name: 'Pages Jaunes', 
      icon: '📞', 
      description: 'Annuaire français spécialisé',
      estimatedItems: '~500 entreprises réelles',
      quality: 'Haute'
    },
    { 
      id: 'google_places', 
      name: 'Google Places', 
      icon: '🗺️', 
      description: 'API Google My Business',
      estimatedItems: '~1,000 entreprises',
      quality: 'Très haute'
    },
    { 
      id: 'facebook', 
      name: 'Facebook Business', 
      icon: '📘', 
      description: 'Pages entreprises Facebook',
      estimatedItems: '~300 entreprises',
      quality: 'Moyenne'
    },
    { 
      id: 'yelp', 
      name: 'Yelp Business', 
      icon: '⭐', 
      description: 'Avis et entreprises Yelp',
      estimatedItems: '~200 entreprises',
      quality: 'Haute'
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
      try {
        await startScraping(source);
      } catch (error) {
        console.error(`Erreur scraping ${source}:`, error);
      }
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
    
    // Calculer la précision IA
    const successfulClassifications = totalAdded + totalUpdated;
    const precision = totalScraped > 0 ? Math.round((successfulClassifications / totalScraped) * 100) : 0;
    
    return { totalAdded, totalUpdated, totalScraped, precision };
  };

  const { totalAdded, totalUpdated, totalScraped, precision } = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Stats en temps réel avec IA */}
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
                <p className="text-3xl font-bold text-orange-900">{precision}%</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Configuration IA Multi-Modèles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-900">🤖 Mistral AI</h4>
                <Badge variant="default">Priorité 1</Badge>
              </div>
              <p className="text-sm text-purple-700">Classification précise des entreprises</p>
              <p className="text-xs text-purple-600 mt-1">Modèle: mistral-small-latest</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-900">🧠 OpenAI</h4>
                <Badge variant="outline">Fallback</Badge>
              </div>
              <p className="text-sm text-green-700">Analyse de secours automatique</p>
              <p className="text-xs text-green-600 mt-1">Modèle: gpt-3.5-turbo</p>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center text-amber-800">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Système de fallback automatique activé</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              En cas d'échec de Mistral AI, le système bascule automatiquement sur OpenAI
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des sources améliorée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Sources de Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedSources.includes(source.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleSourceToggle(source.id)}
              >
                <div className="flex items-center justify-between mb-3">
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
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{source.estimatedItems}</span>
                  <Badge 
                    variant={source.quality === 'Très haute' ? 'default' : 
                            source.quality === 'Haute' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {source.quality}
                  </Badge>
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
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-900">Scraping en cours...</span>
                <div className="flex items-center text-blue-700">
                  <Brain className="h-4 w-4 mr-1 animate-pulse" />
                  <span className="text-xs">IA Active</span>
                </div>
              </div>
              <Progress value={75} className="mb-2" />
              <div className="flex items-center justify-between text-xs text-blue-700">
                <span>Classification automatique des entreprises...</span>
                <span>Mistral AI + OpenAI</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique avec informations IA */}
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
                        {log.status === 'completed' && (
                          <Badge variant="outline" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                      {log.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      +{log.items_added || 0} • ↻{log.items_updated || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.items_scraped || 0} traités
                    </div>
                    {log.status === 'completed' && log.items_scraped > 0 && (
                      <div className="text-xs text-green-600">
                        {Math.round(((log.items_added + log.items_updated) / log.items_scraped) * 100)}% précision
                      </div>
                    )}
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
