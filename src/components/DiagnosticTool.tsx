
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import DiagnosticProgress from './DiagnosticProgress';
import DiagnosticQuestion from './DiagnosticQuestion';
import DiagnosticResult from './DiagnosticResult';
import DiagnosticSummary from './DiagnosticSummary';

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

  const completedStepsCount = diagnosticSteps.filter(step => step.completed).length;

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
        <DiagnosticProgress 
          completedSteps={completedStepsCount} 
          totalSteps={diagnosticSteps.length} 
        />

        {!diagnosis ? (
          <div className="space-y-6">
            <DiagnosticQuestion
              step={diagnosticSteps[currentStep]}
              stepNumber={currentStep + 1}
              totalSteps={diagnosticSteps.length}
              onAnswer={handleAnswer}
            />

            <DiagnosticSummary 
              steps={diagnosticSteps} 
              currentStep={currentStep} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <DiagnosticResult 
              diagnosis={diagnosis} 
              onReset={resetDiagnostic} 
            />

            <DiagnosticSummary 
              steps={diagnosticSteps} 
              showTitle={true} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticTool;
