
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiagnosticStep {
  id: number;
  question: string;
  type: 'select' | 'boolean';
  options?: string[];
  completed: boolean;
  answer?: string;
}

interface DiagnosticQuestionProps {
  step: DiagnosticStep;
  stepNumber: number;
  totalSteps: number;
  onAnswer: (answer: string) => void;
}

const DiagnosticQuestion = ({ step, stepNumber, totalSteps, onAnswer }: DiagnosticQuestionProps) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-medium text-gray-900 mb-4">
        Étape {stepNumber}/{totalSteps}
      </h3>
      <p className="text-lg text-gray-800 mb-4">
        {step.question}
      </p>

      {step.type === 'select' ? (
        <Select onValueChange={onAnswer}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez une option" />
          </SelectTrigger>
          <SelectContent>
            {step.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex space-x-4">
          <Button onClick={() => onAnswer('Oui')} className="flex-1">
            Oui
          </Button>
          <Button onClick={() => onAnswer('Non')} variant="outline" className="flex-1">
            Non
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiagnosticQuestion;
