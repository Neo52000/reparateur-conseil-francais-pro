
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DiagnosticProgressProps {
  completedSteps: number;
  totalSteps: number;
}

const DiagnosticProgress = ({ completedSteps, totalSteps }: DiagnosticProgressProps) => {
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progression</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default DiagnosticProgress;
