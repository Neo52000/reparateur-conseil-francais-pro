
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface DiagnosticStep {
  id: number;
  question: string;
  type: 'select' | 'boolean';
  options?: string[];
  completed: boolean;
  answer?: string;
}

interface DiagnosticSummaryProps {
  steps: DiagnosticStep[];
  currentStep?: number;
  showTitle?: boolean;
}

const DiagnosticSummary = ({ steps, currentStep, showTitle = false }: DiagnosticSummaryProps) => {
  const completedSteps = currentStep !== undefined 
    ? steps.slice(0, currentStep) 
    : steps.filter(step => step.completed);

  return (
    <div className="space-y-2">
      {showTitle && (
        <h4 className="font-medium text-gray-900">Résumé des réponses :</h4>
      )}
      {completedSteps.map((step) => (
        <div 
          key={step.id} 
          className={`flex items-center justify-between p-${showTitle ? '2' : '3'} ${
            showTitle ? 'bg-gray-50' : 'bg-green-50 border border-green-200'
          } rounded-lg ${showTitle ? 'text-sm' : ''}`}
        >
          <div className="flex items-center">
            {!showTitle && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
            <span className={`${showTitle ? 'text-gray-700' : 'text-sm text-gray-700'}`}>
              {step.question}
            </span>
          </div>
          <Badge variant={showTitle ? "outline" : "secondary"}>
            {step.answer}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticSummary;
