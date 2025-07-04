import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  Search,
  Brain,
  MapPin,
  Database
} from 'lucide-react';

interface ScrapingStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ReactNode;
  message?: string;
  details?: string;
  progress?: number;
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
      id: 'search',
      name: 'Recherche de données',
      status: 'pending',
      icon: <Search className="h-4 w-4" />,
      message: 'En attente de démarrage...'
    },
    {
      id: 'scraping',
      name: 'Scraping web',
      status: 'pending',
      icon: <Activity className="h-4 w-4" />,
      message: 'Extraction des données web'
    },
    {
      id: 'classification',
      name: 'Classification IA',
      status: 'pending',
      icon: <Brain className="h-4 w-4" />,
      message: 'Analyse et classification des résultats'
    },
    {
      id: 'geocoding',
      name: 'Géocodage',
      status: 'pending',
      icon: <MapPin className="h-4 w-4" />,
      message: 'Calcul des coordonnées géographiques'
    },
    {
      id: 'validation',
      name: 'Validation',
      status: 'pending',
      icon: <CheckCircle className="h-4 w-4" />,
      message: 'Validation des données finales'
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
    const stepSequence = ['search', 'scraping', 'classification', 'geocoding', 'validation'];
    
    for (let i = 0; i < stepSequence.length; i++) {
      const stepId = stepSequence[i];
      
      // Démarrer l'étape
      updateStepStatus(stepId, 'running', `${steps.find(s => s.id === stepId)?.name} en cours...`);
      addLog(`🚀 Démarrage: ${steps.find(s => s.id === stepId)?.name}`);
      
      // Simuler le travail
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Compléter l'étape
      updateStepStatus(stepId, 'completed', `${steps.find(s => s.id === stepId)?.name} terminée`);
      addLog(`✅ Terminé: ${steps.find(s => s.id === stepId)?.name}`);
      
      // Mettre à jour le progrès global
      setOverallProgress(((i + 1) / stepSequence.length) * 100);
    }
    
    addLog(`🎉 Scraping terminé avec succès!`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-admin-blue animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-admin-green" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-admin-red" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-admin-blue text-white';
      case 'completed':
        return 'bg-admin-green text-white';
      case 'error':
        return 'bg-admin-red text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
            Progrès du Scraping
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
          <CardTitle>Étapes du Traitement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    <Badge variant="secondary" className={getStatusColor(step.status)}>
                      {step.status === 'pending' && 'En attente'}
                      {step.status === 'running' && 'En cours'}
                      {step.status === 'completed' && 'Terminé'}
                      {step.status === 'error' && 'Erreur'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-admin-purple" />
            Logs du Processus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 w-full">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono p-2 bg-muted/50 rounded">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-xs text-muted-foreground p-2">
                  Aucun log disponible
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapingProgressViewer;