
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  FileText, 
  Settings, 
  MapPin, 
  Smartphone, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ScrapingJob {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  results: number;
  startTime?: Date;
  endTime?: Date;
  config: any;
  logs: string[];
}

const NewScrapingInterface: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'scraping' | 'import' | 'export'>('scraping');
  const [scrapingJob, setScrapingJob] = useState<ScrapingJob | null>(null);

  // Configuration du scraping
  const [config, setConfig] = useState({
    source: 'both' as 'pages_jaunes' | 'google_maps' | 'both',
    searchTerm: 'réparation téléphone smartphone',
    location: 'Paris',
    maxResults: 50,
    testMode: false,
    mistralEnabled: true
  });

  // Import CSV
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const startScraping = async () => {
    const job: ScrapingJob = {
      id: Date.now().toString(),
      status: 'running',
      progress: 0,
      results: 0,
      startTime: new Date(),
      config,
      logs: ['🚀 Démarrage du scraping...']
    };

    setScrapingJob(job);

    try {
      // Simuler le processus de scraping (à remplacer par l'appel réel)
      const steps = [
        'Initialisation du navigateur...',
        'Scraping Pages Jaunes...',
        'Scraping Google Maps...',
        'Classification IA avec Mistral...',
        'Géocodage des adresses...',
        'Sauvegarde en base de données...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setScrapingJob(prev => prev ? {
          ...prev,
          progress: ((i + 1) / steps.length) * 100,
          logs: [...prev.logs, `✅ ${steps[i]}`]
        } : null);
      }

      const finalResults = Math.floor(Math.random() * 30) + 10;
      
      setScrapingJob(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        results: finalResults,
        endTime: new Date(),
        logs: [...prev.logs, `🎉 Scraping terminé: ${finalResults} réparateurs trouvés`]
      } : null);

      toast({
        title: "Scraping terminé",
        description: `${finalResults} nouveaux réparateurs ajoutés à la base de données`,
      });

    } catch (error) {
      setScrapingJob(prev => prev ? {
        ...prev,
        status: 'error',
        logs: [...prev.logs, `❌ Erreur: ${error}`]
      } : null);

      toast({
        title: "Erreur de scraping",
        description: "Une erreur est survenue pendant le scraping",
        variant: "destructive"
      });
    }
  };

  const stopScraping = () => {
    if (scrapingJob) {
      setScrapingJob({
        ...scrapingJob,
        status: 'completed',
        endTime: new Date(),
        logs: [...scrapingJob.logs, '🛑 Scraping arrêté par l\'utilisateur']
      });
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportProgress(0);

    try {
      // Simulation du processus d'import
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setImportProgress(i);
      }

      toast({
        title: "Import terminé",
        description: `Fichier ${file.name} importé avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer le fichier CSV",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    // Simuler l'export
    toast({
      title: "Export en cours",
      description: "Le téléchargement va commencer...",
    });
    
    // Ici on appellerait CSVService.exportToCSV()
  };

  const downloadTemplate = () => {
    // Ici on appellerait CSVService.generateTemplate()
    toast({
      title: "Template téléchargé",
      description: "Le modèle CSV a été téléchargé",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec onglets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6" />
            <span>Système de Scraping Moderne</span>
            <Badge variant="secondary">v2.0 - Open Source</Badge>
          </CardTitle>
          <div className="flex space-x-1">
            {[
              { key: 'scraping', label: 'Scraping', icon: MapPin },
              { key: 'import', label: 'Import CSV', icon: Upload },
              { key: 'export', label: 'Export CSV', icon: Download }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'scraping' && (
            <div className="space-y-6">
              {/* Configuration du scraping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={config.source} onValueChange={(value: any) => setConfig({...config, source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pages_jaunes">Pages Jaunes uniquement</SelectItem>
                      <SelectItem value="google_maps">Google Maps uniquement</SelectItem>
                      <SelectItem value="both">Les deux sources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={config.location}
                    onChange={(e) => setConfig({...config, location: e.target.value})}
                    placeholder="Paris, Lyon, Marseille..."
                  />
                </div>

                <div>
                  <Label htmlFor="searchTerm">Terme de recherche</Label>
                  <Input
                    id="searchTerm"
                    value={config.searchTerm}
                    onChange={(e) => setConfig({...config, searchTerm: e.target.value})}
                    placeholder="réparation téléphone smartphone"
                  />
                </div>

                <div>
                  <Label htmlFor="maxResults">Résultats max</Label>
                  <Input
                    id="maxResults"
                    type="number"
                    value={config.maxResults}
                    onChange={(e) => setConfig({...config, maxResults: parseInt(e.target.value)})}
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              {/* Options avancées */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.testMode}
                    onChange={(e) => setConfig({...config, testMode: e.target.checked})}
                  />
                  <span>Mode test (5 résultats max)</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.mistralEnabled}
                    onChange={(e) => setConfig({...config, mistralEnabled: e.target.checked})}
                  />
                  <span>Classification IA (Mistral)</span>
                </label>
              </div>

              {/* Contrôles de scraping */}
              <div className="flex space-x-2">
                <Button
                  onClick={startScraping}
                  disabled={scrapingJob?.status === 'running'}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Démarrer le scraping</span>
                </Button>

                {scrapingJob?.status === 'running' && (
                  <Button onClick={stopScraping} variant="destructive" size="sm">
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                )}
              </div>

              {/* Progression du scraping */}
              {scrapingJob && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Scraping en cours</span>
                      <Badge variant={
                        scrapingJob.status === 'running' ? 'default' :
                        scrapingJob.status === 'completed' ? 'secondary' :
                        scrapingJob.status === 'error' ? 'destructive' : 'outline'
                      }>
                        {scrapingJob.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={scrapingJob.progress} />
                    
                    <div className="text-sm text-gray-600">
                      {scrapingJob.status === 'completed' && (
                        <p>✅ {scrapingJob.results} réparateurs trouvés en {
                          scrapingJob.endTime && scrapingJob.startTime 
                            ? Math.round((scrapingJob.endTime.getTime() - scrapingJob.startTime.getTime()) / 1000)
                            : 0
                        } secondes</p>
                      )}
                    </div>

                    <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm font-mono">
                      {scrapingJob.logs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Importez vos réparateurs depuis un fichier CSV. Le fichier doit contenir au minimum les colonnes : nom, adresse, ville, code postal.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Sélectionner un fichier CSV</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                  />
                </div>

                {importProgress > 0 && (
                  <div>
                    <Label>Progression de l'import</Label>
                    <Progress value={importProgress} />
                  </div>
                )}

                <Button onClick={downloadTemplate} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Télécharger le modèle CSV
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Exportez vos données de réparateurs au format CSV pour analyse ou sauvegarde.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Options d'export</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Réparateurs vérifiés uniquement</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Inclure les coordonnées GPS</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter au format CSV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur le nouveau système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Améliorations du Système v2.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Scraping Open Source</h4>
                <p className="text-sm text-gray-600">Playwright remplace Firecrawl pour un scraping gratuit et performant</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">IA Mistral</h4>
                <p className="text-sm text-gray-600">Classification intelligente des réparateurs avec l'API Mistral</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Géocodage Gratuit</h4>
                <p className="text-sm text-gray-600">Nominatim (OpenStreetMap) pour la géolocalisation précise</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewScrapingInterface;
