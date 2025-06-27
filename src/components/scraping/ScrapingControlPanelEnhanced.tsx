
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useScrapingOperations } from '@/hooks/scraping/useScrapingOperations';
import { Play, Square, TestTube, Zap, MapPin, Database } from 'lucide-react';
import AISelector from './AISelector';

const ScrapingControlPanelEnhanced = () => {
  const { toast } = useToast();
  const { startScraping, stopScraping } = useScrapingOperations();
  const [selectedSource, setSelectedSource] = useState('pages_jaunes');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedAI, setSelectedAI] = useState('mistral');
  const [aiApiKey, setAiApiKey] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const SOURCES = [
    { id: 'pages_jaunes', name: 'Pages Jaunes', icon: '📞', description: 'Réparateurs référencés' },
    { id: 'google_places', name: 'Google Places', icon: '🗺️', description: 'Établissements Google' },
    { id: 'mixed', name: 'Sources Mixtes', icon: '🔄', description: 'Combinaison de sources' }
  ];

  const DEPARTMENTS = [
    { code: 'all', name: 'Toute la France' },
    { code: '75', name: '75 - Paris' },
    { code: '69', name: '69 - Rhône (Lyon)' },
    { code: '13', name: '13 - Bouches-du-Rhône (Marseille)' },
    { code: '31', name: '31 - Haute-Garonne (Toulouse)' },
    { code: '06', name: '06 - Alpes-Maritimes (Nice)' },
    { code: '33', name: '33 - Gironde (Bordeaux)' },
    { code: '59', name: '59 - Nord (Lille)' },
    { code: '67', name: '67 - Bas-Rhin (Strasbourg)' },
    { code: '44', name: '44 - Loire-Atlantique (Nantes)' },
    { code: '35', name: '35 - Ille-et-Vilaine (Rennes)' }
  ];

  const handleStartScraping = async (testMode: boolean = false) => {
    try {
      setIsRunning(true);
      
      const scrapingType = testMode ? 'test' : 'production';
      console.log(`🚀 Démarrage du scraping ${scrapingType}:`, {
        source: selectedSource,
        department: selectedDepartment,
        ai: selectedAI
      });

      // Convertir "all" en null pour l'API
      const departmentCode = selectedDepartment === 'all' ? null : selectedDepartment;
      await startScraping(selectedSource, testMode, departmentCode);
      
      toast({
        title: `✅ Scraping ${testMode ? 'test' : 'massif'} démarré`,
        description: `Source: ${selectedSource}, Département: ${selectedDepartment === 'all' ? 'Tous' : selectedDepartment}, IA: ${selectedAI}`,
      });

    } catch (error) {
      console.error('Erreur démarrage scraping:', error);
      setIsRunning(false);
    }
  };

  const handleStopScraping = async () => {
    try {
      await stopScraping();
      setIsRunning(false);
      
      toast({
        title: "🛑 Scraping arrêté",
        description: "Toutes les opérations de scraping ont été interrompues",
      });
    } catch (error) {
      console.error('Erreur arrêt scraping:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur d'IA */}
      <AISelector
        selectedAI={selectedAI}
        onAIChange={setSelectedAI}
        onApiKeyChange={setAiApiKey}
      />

      {/* Panneau de contrôle principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-purple-600" />
            Contrôle de Scraping Avancé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection de source */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source de données</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{source.icon}</span>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-xs text-gray-500">{source.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection de département */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Département cible</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations sur la configuration */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Configuration actuelle</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-blue-600" />
                <span><strong>Source:</strong> {SOURCES.find(s => s.id === selectedSource)?.name}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                <span><strong>Zone:</strong> {selectedDepartment === 'all' ? 'Toute la France' : `Département ${selectedDepartment}`}</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-600" />
                <span><strong>IA:</strong> {selectedAI}</span>
              </div>
            </div>
          </div>

          {/* Contrôles de scraping */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleStartScraping(true)}
              disabled={isRunning}
              variant="outline"
              className="flex-1 min-w-0"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test (10 résultats)
            </Button>
            
            <Button
              onClick={() => handleStartScraping(false)}
              disabled={isRunning}
              className="flex-1 min-w-0"
            >
              <Play className="h-4 w-4 mr-2" />
              Scraping Massif
            </Button>
            
            <Button
              onClick={handleStopScraping}
              disabled={!isRunning}
              variant="destructive"
              className="flex-1 min-w-0"
            >
              <Square className="h-4 w-4 mr-2" />
              Arrêter
            </Button>
          </div>

          {/* Statut */}
          {isRunning && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
                <span className="text-green-800 font-medium">Scraping en cours...</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Le scraping est en cours d'exécution. Les résultats apparaîtront automatiquement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingControlPanelEnhanced;
