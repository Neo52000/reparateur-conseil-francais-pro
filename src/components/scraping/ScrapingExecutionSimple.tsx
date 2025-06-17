
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  TestTube,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';
import { useToast } from '@/hooks/use-toast';

const ScrapingExecutionSimple = () => {
  const { startScraping, isScrapingRunning, logs } = useScrapingStatus();
  const { toast } = useToast();
  const [testMode, setTestMode] = useState(false);

  const handleScraping = async (source: string, test: boolean = false) => {
    try {
      setTestMode(test);
      await startScraping(source, test);
    } catch (error) {
      console.error('Erreur scraping:', error);
      toast({
        title: "Erreur de scraping",
        description: "Impossible de démarrer le scraping. Vérifiez les logs.",
        variant: "destructive"
      });
    }
  };

  const latestLog = logs[0];
  const getProgress = () => {
    if (!latestLog) return 0;
    if (latestLog.status === 'completed') return 100;
    if (latestLog.status === 'running') return 50;
    return 0;
  };

  const getTotalStats = () => {
    const completedLogs = logs.filter(log => log.status === 'completed');
    const totalAdded = completedLogs.reduce((sum, log) => sum + (log.items_added || 0), 0);
    const totalUpdated = completedLogs.reduce((sum, log) => sum + (log.items_updated || 0), 0);
    return { totalAdded, totalUpdated, totalProcessed: totalAdded + totalUpdated };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réparateurs ajoutés</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalAdded}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mis à jour</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUpdated}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total traité</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalProcessed}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface de scraping principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlayCircle className="h-5 w-5 mr-2 text-blue-600" />
            Scraping Simplifié - Réparateurs Téléphone France
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status du scraping en cours */}
          {isScrapingRunning && latestLog && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Scraping en cours: {latestLog.source}
                  </span>
                </div>
                <Badge variant="secondary">
                  {testMode ? 'Mode Test' : 'Mode Réel'}
                </Badge>
              </div>
              <Progress value={getProgress()} className="mb-2" />
              <p className="text-sm text-blue-700">
                Classification par mots-clés en cours...
              </p>
            </div>
          )}

          {/* Boutons de scraping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pages Jaunes */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Pages Jaunes</h3>
                    <Badge variant="outline">~10 réparateurs</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Réparateurs de smartphones dans les grandes villes françaises
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleScraping('pages_jaunes', true)}
                      disabled={isScrapingRunning}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test (3 items)
                    </Button>
                    <Button
                      onClick={() => handleScraping('pages_jaunes', false)}
                      disabled={isScrapingRunning}
                      size="sm"
                      className="flex-1"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Scraper Tout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Places */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Google Places</h3>
                    <Badge variant="outline">~3 réparateurs</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ateliers et services de réparation mobile
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleScraping('google_places', true)}
                      disabled={isScrapingRunning}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test (2 items)
                    </Button>
                    <Button
                      onClick={() => handleScraping('google_places', false)}
                      disabled={isScrapingRunning}
                      size="sm"
                      className="flex-1"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Scraper Tout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations techniques */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
              Classification Simplifiée Active
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Analyse par mots-clés : "réparation", "smartphone", "iPhone", etc.</li>
              <li>• Géolocalisation automatique des villes françaises</li>
              <li>• Détection et évitement des doublons</li>
              <li>• Ajout automatique des coordonnées GPS</li>
            </ul>
          </div>

          {/* Derniers résultats */}
          {latestLog && latestLog.status === 'completed' && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">
                  Dernier scraping terminé
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Éléments traités</p>
                  <p className="font-bold text-green-900">{latestLog.items_scraped}</p>
                </div>
                <div>
                  <p className="text-green-700">Ajoutés</p>
                  <p className="font-bold text-green-900">{latestLog.items_added}</p>
                </div>
                <div>
                  <p className="text-green-700">Mis à jour</p>
                  <p className="font-bold text-green-900">{latestLog.items_updated}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingExecutionSimple;
