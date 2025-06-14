
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Info, Phone } from 'lucide-react';

interface DiagnosticStep {
  id: number;
  question: string;
  type: 'select' | 'boolean';
  options?: string[];
  completed: boolean;
  answer?: string;
}

const DiagnosticTool = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosticSteps, setDiagnosticSteps] = useState<DiagnosticStep[]>([
    {
      id: 1,
      question: "Quel est le modèle du téléphone ?",
      type: 'select',
      options: ['iPhone 14', 'iPhone 13', 'iPhone 12', 'Samsung Galaxy S23', 'Samsung Galaxy S22', 'Xiaomi Mi 13'],
      completed: false
    },
    {
      id: 2,
      question: "Le téléphone s'allume-t-il ?",
      type: 'boolean',
      completed: false
    },
    {
      id: 3,
      question: "L'écran affiche-t-il quelque chose ?",
      type: 'boolean',
      completed: false
    },
    {
      id: 4,
      question: "Y a-t-il des fissures visibles sur l'écran ?",
      type: 'boolean',
      completed: false
    }
  ]);

  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const progress = (diagnosticSteps.filter(step => step.completed).length / diagnosticSteps.length) * 100;

  const handleAnswer = (answer: string) => {
    const updatedSteps = [...diagnosticSteps];
    updatedSteps[currentStep] = {
      ...updatedSteps[currentStep],
      completed: true,
      answer: answer
    };
    setDiagnosticSteps(updatedSteps);

    if (currentStep < diagnosticSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateDiagnosis(updatedSteps);
    }
  };

  const generateDiagnosis = (steps: DiagnosticStep[]) => {
    const answers = steps.map(step => step.answer);
    
    // Simple diagnostic logic
    if (answers[1] === 'Non') {
      setDiagnosis("Problème d'alimentation - Vérifiez la batterie et le port de charge");
    } else if (answers[2] === 'Non') {
      setDiagnosis("Problème d'écran - L'écran ou la nappe LCD peuvent être défaillants");
    } else if (answers[3] === 'Oui') {
      setDiagnosis("Écran fissuré - Remplacement de la vitre tactile nécessaire");
    } else {
      setDiagnosis("Diagnostic complémentaire nécessaire - Testez les fonctionnalités une par une");
    }
  };

  const resetDiagnostic = () => {
    setCurrentStep(0);
    setDiagnosis(null);
    setDiagnosticSteps(prev => prev.map(step => ({ ...step, completed: false, answer: undefined })));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2 text-blue-600" />
          Diagnostic Interactif
        </CardTitle>
        <CardDescription>
          Suivez les étapes pour identifier le problème
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {!diagnosis ? (
          <div className="space-y-6">
            {/* Current Question */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-4">
                Étape {currentStep + 1}/{diagnosticSteps.length}
              </h3>
              <p className="text-lg text-gray-800 mb-4">
                {diagnosticSteps[currentStep]?.question}
              </p>

              {diagnosticSteps[currentStep]?.type === 'select' ? (
                <Select onValueChange={handleAnswer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez une option" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnosticSteps[currentStep]?.options?.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex space-x-4">
                  <Button onClick={() => handleAnswer('Oui')} className="flex-1">
                    Oui
                  </Button>
                  <Button onClick={() => handleAnswer('Non')} variant="outline" className="flex-1">
                    Non
                  </Button>
                </div>
              )}
            </div>

            {/* Previous Answers */}
            {diagnosticSteps.slice(0, currentStep).map((step, index) => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">{step.question}</span>
                </div>
                <Badge variant="secondary">{step.answer}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Diagnosis Result */}
            <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Diagnostic</h3>
                  <p className="text-gray-700 mb-4">{diagnosis}</p>
                  <div className="flex space-x-3">
                    <Button size="sm">
                      Voir le guide de réparation
                    </Button>
                    <Button size="sm" variant="outline">
                      Calculer le prix
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <Button onClick={resetDiagnostic} variant="outline" className="w-full">
              Nouveau diagnostic
            </Button>

            {/* Previous Answers Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Résumé des réponses :</h4>
              {diagnosticSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-700">{step.question}</span>
                  <Badge variant="outline">{step.answer}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticTool;
