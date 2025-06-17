
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlayCircle, 
  TestTube,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';
import { useToast } from '@/hooks/use-toast';

const MassiveScrapingControl = () => {
  const { startScraping, isScrapingRunning, logs } = useScrapingStatus();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Départements français avec codes
  const departments = [
    { code: 'all', name: 'Toute la France (101 départements)' },
    { code: '75', name: '75 - Paris' },
    { code: '69', name: '69 - Rhône (Lyon)' },
    { code: '13', name: '13 - Bouches-du-Rhône (Marseille)' },
    { code: '31', name: '31 - Haute-Garonne (Toulouse)' },
    { code: '06', name: '06 - Alpes-Maritimes (Nice)' },
    { code: '33', name: '33 - Gironde (Bordeaux)' },
    { code: '59', name: '59 - Nord (Lille)' },
    { code: '44', name: '44 - Loire-Atlantique (Nantes)' },
    { code: '67', name: '67 - Bas-Rhin (Strasbourg)' },
    { code: '35', name: '35 - Ille-et-Vilaine (Rennes)' },
    { code: '34', name: '34 - Hérault (Montpellier)' },
    { code: '38', name: '38 - Isère (Grenoble)' },
    { code: '76', name: '76 - Seine-Maritime (Rouen)' },
    { code: '62', name: '62 - Pas-de-Calais' },
    { code: '83', name: '83 - Var (Toulon)' },
    { code: '42', name: '42 - Loire (Saint-Étienne)' },
  ];

  const handleMassiveScraping = async (source: string, test: boolean = false) => {
    try {
      const departmentCode = selectedDepartment === 'all' ? null : selectedDepartment;
      
      await startScraping(source, test, departmentCode);
      
      if (!test) {
        toast({
          title: "🚀 Scraping Massif Démarré",
          description: `Extraction en cours ${departmentCode ? `pour le département ${departmentCode}` : 'pour toute la France'}. Cela peut prendre plusieurs heures.`,
        });
      }
    } catch (error) {
      console.error('Erreur scraping massif:', error);
      toast({
        title: "Erreur de scraping",
        description: "Impossible de démarrer le scraping massif. Vérifiez les logs.",
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

      {/* Interface de scraping massif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-red-600" />
            Scraping Massif - Tous les Réparateurs de France
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection du département */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zone géographique</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une zone" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.code} value={dept.code}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status du scraping en cours */}
          {isScrapingRunning && latestLog && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                  <span className="font-medium text-red-900">
                    Scraping MASSIF en cours: {latestLog.source}
                  </span>
                </div>
                <Badge variant="destructive">
                  Extraction Illimitée
                </Badge>
              </div>
              <Progress value={getProgress()} className="mb-2" />
              <p className="text-sm text-red-700">
                Scraping éthique avec anti-blocage en cours...
              </p>
            </div>
          )}

          {/* Boutons de scraping massif */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pages Jaunes Massif */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Pages Jaunes</h3>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      ~15,000 réparateurs
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scraping massif par département avec rotation anti-blocage
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleMassiveScraping('pages_jaunes', true)}
                      disabled={isScrapingRunning}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test (3 items)
                    </Button>
                    <Button
                      onClick={() => handleMassiveScraping('pages_jaunes', false)}
                      disabled={isScrapingRunning}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Scraping MASSIF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Places Massif */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Google Places</h3>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      ~8,000 réparateurs
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extraction géolocalisée par communes françaises
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleMassiveScraping('google_places', true)}
                      disabled={isScrapingRunning}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test (2 items)
                    </Button>
                    <Button
                      onClick={() => handleMassiveScraping('google_places', false)}
                      disabled={isScrapingRunning}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Scraping MASSIF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations techniques */}
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Scraping Massif et Éthique
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>Anti-blocage</strong> : Délais aléatoires 1-3s entre requêtes</li>
              <li>• <strong>User-Agents rotatifs</strong> : Simulation de vrais navigateurs</li>
              <li>• <strong>Classification avancée</strong> : +30 mots-clés de détection</li>
              <li>• <strong>Géolocalisation précise</strong> : 101 départements français</li>
              <li>• <strong>Déduplication intelligente</strong> : Nom + adresse + ville</li>
              <li>• <strong>Objectif</strong> : 20,000+ réparateurs en 2-4 heures</li>
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

export default MassiveScrapingControl;
