
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Wrench,
  Eye,
  ChevronRight
} from 'lucide-react';

interface RepairStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  tools: string[];
  warnings?: string[];
  completed: boolean;
}

const RepairGuide = () => {
  const [selectedRepair, setSelectedRepair] = useState<string>('screen-replacement');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const repairTypes = [
    { id: 'screen-replacement', name: 'Remplacement écran', difficulty: 'moyen', duration: '45-60 min' },
    { id: 'battery-replacement', name: 'Remplacement batterie', difficulty: 'facile', duration: '20-30 min' },
    { id: 'charging-port', name: 'Réparation port de charge', difficulty: 'difficile', duration: '60-90 min' },
    { id: 'camera-repair', name: 'Réparation caméra', difficulty: 'moyen', duration: '30-45 min' },
  ];

  const [repairSteps, setRepairSteps] = useState<RepairStep[]>([
    {
      id: 1,
      title: "Préparation de l'espace de travail",
      description: "Nettoyez votre espace de travail et rassemblez tous les outils nécessaires. Éteignez complètement le téléphone.",
      duration: "5 min",
      difficulty: 'facile',
      tools: ['Tapis antistatique', 'Bacs de vis', 'Chiffon microfibres'],
      completed: false
    },
    {
      id: 2,
      title: "Retrait des vis du connecteur Lightning",
      description: "Utilisez le tournevis pentalobe pour retirer les deux vis situées de chaque côté du connecteur Lightning.",
      duration: "3 min",
      difficulty: 'facile',
      tools: ['Tournevis pentalobe P2'],
      warnings: ['Gardez les vis dans un bac séparé'],
      completed: false
    },
    {
      id: 3,
      title: "Ouverture de l'écran",
      description: "Utilisez les ventouses et les médiators pour soulever délicatement l'écran. Attention aux nappes connectées.",
      duration: "10 min",
      difficulty: 'moyen',
      tools: ['Ventouses', 'Médiators en plastique', 'Levier en plastique'],
      warnings: ['Ne pas forcer', 'Angle d\'ouverture maximum 90°'],
      completed: false
    },
    {
      id: 4,
      title: "Déconnexion des nappes",
      description: "Déconnectez soigneusement les nappes de l'écran et de la caméra frontale avant de retirer complètement l'écran.",
      duration: "8 min",
      difficulty: 'moyen',
      tools: ['Spatule en plastique', 'Pincettes'],
      warnings: ['Manipuler avec précaution', 'Mémoriser l\'ordre des connections'],
      completed: false
    },
    {
      id: 5,
      title: "Installation du nouvel écran",
      description: "Connectez les nappes du nouvel écran dans l'ordre inverse. Testez le fonctionnement avant de refermer.",
      duration: "15 min",
      difficulty: 'moyen',
      tools: ['Nouvel écran', 'Spatule en plastique'],
      warnings: ['Tester avant de refermer complètement'],
      completed: false
    }
  ]);

  const progress = (repairSteps.filter(step => step.completed).length / repairSteps.length) * 100;

  const toggleStepCompletion = (stepId: number) => {
    setRepairSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-600 bg-green-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'difficile': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Repair Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-blue-600" />
            Types de Réparation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {repairTypes.map((repair) => (
            <div
              key={repair.id}
              onClick={() => setSelectedRepair(repair.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedRepair === repair.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{repair.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className={getDifficultyColor(repair.difficulty)}>
                      {repair.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {repair.duration}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guide de Réparation - Remplacement Écran</CardTitle>
              <Badge variant="outline" className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Mode Guidé
              </Badge>
            </div>
            <CardDescription>
              Suivez chaque étape pour une réparation réussie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{Math.round(progress)}% terminé</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Repair Steps */}
        <div className="space-y-4">
          {repairSteps.map((step, index) => (
            <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.id}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="outline" className={getDifficultyColor(step.difficulty)}>
                          {step.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {step.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={step.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStepCompletion(step.id)}
                  >
                    {step.completed ? 'Terminé' : 'Marquer terminé'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{step.description}</p>
                
                {/* Tools Required */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Outils requis :</h5>
                  <div className="flex flex-wrap gap-2">
                    {step.tools.map((tool, toolIndex) => (
                      <Badge key={toolIndex} variant="secondary">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h6 className="font-medium text-yellow-800 mb-1">Attention :</h6>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {step.warnings.map((warning, warningIndex) => (
                            <li key={warningIndex}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timer Controls */}
                {index === currentStep && (
                  <div className="flex items-center space-x-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                    >
                      {isTimerRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {isTimerRunning ? 'Pause' : 'Démarrer'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepairGuide;
