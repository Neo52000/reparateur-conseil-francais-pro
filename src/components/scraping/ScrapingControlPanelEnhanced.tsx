
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useScrapingOperations } from '@/hooks/scraping/useScrapingOperations';
import { Zap } from 'lucide-react';
import AISelector from './AISelector';
import ScrapingSourceSelector from './controls/ScrapingSourceSelector';
import ScrapingDepartmentSelector from './controls/ScrapingDepartmentSelector';
import ScrapingConfigDisplay from './controls/ScrapingConfigDisplay';
import ScrapingActionButtons from './controls/ScrapingActionButtons';
import ScrapingStatusDisplay from './controls/ScrapingStatusDisplay';

const ScrapingControlPanelEnhanced = () => {
  const { toast } = useToast();
  const { startScraping, stopScraping } = useScrapingOperations();
  const [selectedSource, setSelectedSource] = useState('pages_jaunes');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedAI, setSelectedAI] = useState('mistral');
  const [aiApiKey, setAiApiKey] = useState('');
  const [isRunning, setIsRunning] = useState(false);

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
            <ScrapingSourceSelector
              selectedSource={selectedSource}
              onSourceChange={setSelectedSource}
            />
            <ScrapingDepartmentSelector
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
            />
          </div>

          {/* Informations sur la configuration */}
          <ScrapingConfigDisplay
            selectedSource={selectedSource}
            selectedDepartment={selectedDepartment}
            selectedAI={selectedAI}
          />

          {/* Contrôles de scraping */}
          <ScrapingActionButtons
            isRunning={isRunning}
            onStartTest={() => handleStartScraping(true)}
            onStartMassive={() => handleStartScraping(false)}
            onStop={handleStopScraping}
          />

          {/* Statut */}
          <ScrapingStatusDisplay isRunning={isRunning} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingControlPanelEnhanced;
