import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: Array<{
    id: string;
    label: string;
    completed: boolean;
    current?: boolean;
    optional?: boolean;
  }>;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  className
}) => {
  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de progression globale */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progression</span>
          <span className="text-muted-foreground">
            {completedCount}/{steps.length} étapes
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Liste des étapes */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative flex items-center">
              {/* Ligne de connexion */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-px h-6 bg-gray-200" />
              )}
              
              {/* Icône de statut */}
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                step.completed 
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : step.current
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              )}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.current ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    step.optional ? 'bg-gray-300' : 'bg-gray-400'
                  )} />
                )}
              </div>

              {/* Label de l'étape */}
              <div className="ml-3 flex-1">
                <div className={cn(
                  'text-sm font-medium',
                  step.completed 
                    ? 'text-green-700'
                    : step.current
                    ? 'text-blue-700'
                    : 'text-gray-500'
                )}>
                  {step.label}
                  {step.optional && (
                    <span className="text-xs text-gray-400 ml-1">(optionnel)</span>
                  )}
                </div>
              </div>

              {/* Indicateur d'état */}
              {step.completed && (
                <div className="flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};