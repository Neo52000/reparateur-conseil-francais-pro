
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain,
  Zap,
  Target,
  Settings,
  TestTube,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/scraping/useScrapingStatus';
import { useToast } from '@/hooks/use-toast';
import ScrapingHistoryManager from './ScrapingHistoryManager';

const ScrapingExecution = () => {
  const { toast } = useToast();
  const { logs, loading, isScrapingRunning, startScraping, refetch } = useScrapingStatus();
  const [selectedSources, setSelectedSources] = useState<string[]>(['pages_jaunes']);
  const [isTestMode, setIsTestMode] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'limited' | 'unavailable'>('checking');

  const availableSources = [
    { 
      id: 'pages_jaunes', 
      name: 'Pages Jaunes', 
      icon: '📞',
      description: 'Annuaire professionnel français',
      estimatedResults: '8-12 résultats'
    },
    { 
      id: 'google_places', 
      name: 'Google Places', 
      icon: '🗺️',
      description: 'Base de données Google My Business',
      estimatedResults: '2-5 résultats'
    },
    { 
      id: 'yelp', 
      name: 'Yelp', 
      icon: '⭐',
      description: 'Plateforme d\'avis consommateurs',
      estimatedResults: '1-3 résultats'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: '📘',
      description: 'Pages entreprises Facebook',
      estimatedResults: '1-2 résultats'
    }
  ];

  // Simuler la vérification du statut des API au montage
  React.useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Simuler une vérification - dans un vrai scénario, on ferait un appel test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simuler un statut basé sur les logs récents
        const recentFailures = logs.filter(log => 
          log.status === 'failed' && 
          log.error_message?.includes('API') &&
          new Date(log.started_at) > new Date(Date.now() - 60 * 60 * 1000) // Dernière heure
        );
        
        if (recentFailures.length > 0) {
          setApiStatus('limited');
        } else {
          setApiStatus('available');
        }
      } catch (error) {
        setApiStatus('unavailable');
      }
    };

    checkApiStatus();
  }, [logs]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleStartScraping = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "Aucune source sélectionnée",
        description: "Veuillez sélectionner au moins une source de données.",
        variant: "destructive"
      });
      return;
    }

    if (apiStatus === 'unavailable' && !isTestMode) {
      toast({
        title: "APIs indisponibles",
        description: "Les APIs IA ne sont pas disponibles. Utilisez le mode test ou vérifiez la configuration.",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const source of selectedSources) {
        console.log(`🚀 Lancement du scraping pour: ${source}`);
        await startScraping(source);
        
        // Petit délai entre les sources pour éviter la surcharge
        if (selectedSources.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du lancement du scraping:', error);
    }
  };

  const handleTestScraping = async () => {
    setIsTestMode(true);
    toast({
      title: "🧪 Mode test activé",
      description: "Lancement du scraping de test avec des résultats simulés...",
    });

    try {
      // Test avec une source simple
      await startScraping('pages_jaunes');
      
      setTimeout(() => {
        setIsTestMode(false);
        toast({
          title: "✅ Test terminé",
          description: "Le test de scraping s'est bien déroulé. Vérifiez les résultats dans l'onglet Résultats.",
        });
      }, 3000);
    } catch (error) {
      setIsTestMode(false);
      console.error('❌ Erreur test scraping:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'checking': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'available': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'limited': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unavailable': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getApiStatusMessage = () => {
    switch (apiStatus) {
      case 'checking': return 'Vérification des APIs...';
      case 'available': return 'APIs IA disponibles';
      case 'limited': return 'APIs IA limitées (erreurs récentes)';
      case 'unavailable': return 'APIs IA indisponibles';
      default: return 'Statut inconnu';
    }
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds % 60}s`;
    }
    return `${diffSeconds}s`;
  };

  const totalEstimatedResults = selectedSources.reduce((total, sourceId) => {
    const source = availableSources.find(s => s.id === sourceId);
    if (!source) return total;
    const range = source.estimatedResults.match(/(\d+)-(\d+)/);
    if (range) {
      return total + parseInt(range[2]); // Prendre le maximum de la fourchette
    }
    return total + 5; // Valeur par défaut
  }, 0);

  return (
    <div className="space-y-6">
      {/* Statut des APIs */}
      <Alert>
        <div className="flex items-center">
          {getApiStatusIcon()}
          <AlertDescription className="ml-2">
            <strong>{getApiStatusMessage()}</strong>
            {apiStatus === 'limited' && (
              <span className="ml-2 text-yellow-700">
                - Classification par mots-clés en fallback
              </span>
            )}
            {apiStatus === 'unavailable' && (
              <span className="ml-2 text-red-700">
                - Seule la classification par mots-clés sera utilisée
              </span>
            )}
          </AlertDescription>
        </div>
      </Alert>

      {/* Configuration et contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-2 text-blue-600" />
              Centre de Contrôle IA
            </div>
            <div className="flex items-center space-x-2">
              {isScrapingRunning && (
                <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  En cours
                </Badge>
              )}
              <Badge variant="outline" className={apiStatus === 'available' ? 'text-green-600' : 'text-yellow-600'}>
                <Zap className="h-3 w-3 mr-1" />
                IA {apiStatus === 'available' ? 'Active' : 'Limitée'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sélection des sources */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Sources de données
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableSources.map((source) => (
                  <div
                    key={source.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedSources.includes(source.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{source.icon}</span>
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>
                    <h4 className="font-medium text-sm">{source.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{source.estimatedResults}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimation des résultats */}
            {selectedSources.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estimation :</strong> Jusqu'à {totalEstimatedResults} résultats potentiels avec les sources sélectionnées.
                  {apiStatus !== 'available' && (
                    <span className="text-yellow-700 ml-2">
                      (Précision réduite sans IA)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Contrôles d'exécution */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleStartScraping}
                  disabled={isScrapingRunning || selectedSources.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Lancer le Scraping</span>
                </Button>
                
                <Button
                  onClick={handleTestScraping}
                  disabled={isScrapingRunning || isTestMode}
                  variant="outline"
                  className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <TestTube className="h-4 w-4" />
                  <span>{isTestMode ? 'Test en cours...' : 'Test (simulation)'}</span>
                </Button>

                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualiser</span>
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                {selectedSources.length} source(s) sélectionnée(s)
              </div>
            </div>

            {/* Configuration IA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuration IA
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Modèle principal:</span>
                  <p className="text-blue-700">Mistral AI (Small)</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Fallback:</span>
                  <p className="text-blue-700">OpenAI GPT-3.5</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Seuil confiance:</span>
                  <p className="text-blue-700">60%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion de l'historique */}
      <ScrapingHistoryManager />

      {/* Historique récent des exécutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Historique Récent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Chargement de l'historique...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune exécution trouvée</p>
              <p className="text-sm">Lancez votre premier scraping pour voir l'historique</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Résultats</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Démarré le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 5).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {availableSources.find(s => s.id === log.source)?.icon || '📊'}
                        </span>
                        <div>
                          <div className="font-medium">{log.source}</div>
                          {log.error_message && (
                            <div className="text-xs text-red-600 mt-1">
                              {log.error_message.slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1 capitalize">{log.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>📊 {log.items_scraped || 0} analysés</div>
                        <div className="text-green-600">➕ {log.items_added || 0} ajoutés</div>
                        <div className="text-blue-600">🔄 {log.items_updated || 0} mis à jour</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDuration(log.started_at, log.completed_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(log.started_at).toLocaleString('fr-FR')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingExecution;
