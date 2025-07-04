import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Search, Brain, MapPin, CheckCircle } from 'lucide-react';
import ProgressSteps from './progress/ProgressSteps';
import ProgressLogs from './progress/ProgressLogs';

interface ScrapingStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ReactNode;
  message?: string;
}

interface ScrapingProgressViewerProps {
  isActive: boolean;
  currentStep?: string;
  onStepUpdate?: (stepId: string, status: string, message?: string) => void;
}

const ScrapingProgressViewer: React.FC<ScrapingProgressViewerProps> = ({
  isActive,
  currentStep,
  onStepUpdate
}) => {
  const [steps, setSteps] = useState<ScrapingStep[]>([
    {
      id: 'serper',
      name: 'Recherche Serper',
      status: 'pending',
      icon: <Search className="h-4 w-4" />,
      message: 'Recherche Google via Serper API'
    },
    {
      id: 'deepseek',
      name: 'Classification DeepSeek',
      status: 'pending',
      icon: <Brain className="h-4 w-4" />,
      message: 'Classification IA des résultats'
    },
    {
      id: 'mistral',
      name: 'Enrichissement Mistral',
      status: 'pending',
      icon: <Activity className="h-4 w-4" />,
      message: 'Enrichissement des données'
    },
    {
      id: 'perplexity',
      name: 'Validation Perplexity',
      status: 'pending',
      icon: <CheckCircle className="h-4 w-4" />,
      message: 'Validation en ligne des données'
    },
    {
      id: 'geocoding',
      name: 'Géocodage',
      status: 'pending',
      icon: <MapPin className="h-4 w-4" />,
      message: 'Calcul des coordonnées géographiques'
    }
  ]);

  const [logs, setLogs] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      simulateProgress();
    }
  }, [isActive]);

  const simulateProgress = async () => {
    const stepSequence = ['serper', 'deepseek', 'mistral', 'perplexity', 'geocoding'];
    
    for (let i = 0; i < stepSequence.length; i++) {
      const stepId = stepSequence[i];
      const step = steps.find(s => s.id === stepId);
      
      // Démarrer l'étape
      updateStepStatus(stepId, 'running', `${step?.name} en cours...`);
      addLog(`🚀 Démarrage: ${step?.name}`);
      
      // Simuler le travail
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Compléter l'étape
      updateStepStatus(stepId, 'completed', `${step?.name} terminée`);
      addLog(`✅ Terminé: ${step?.name}`);
      
      // Mettre à jour le progrès global
      setOverallProgress(((i + 1) / stepSequence.length) * 100);
    }
    
    addLog(`🎉 Pipeline terminé avec succès!`);
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'running' | 'completed' | 'error', message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message }
        : step
    ));
    
    if (onStepUpdate) {
      onStepUpdate(stepId, status, message);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progrès global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-admin-blue" />
            Progrès du Pipeline Multi-IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Étapes détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes du Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressSteps steps={steps} />
        </CardContent>
      </Card>

      {/* Logs en temps réel */}
      <Card>
        <CardContent className="pt-6">
          <ProgressLogs logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingProgressViewer;