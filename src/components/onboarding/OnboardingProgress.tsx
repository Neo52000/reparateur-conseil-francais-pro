import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Star, Award } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStep: number;
  completionRate: number;
  estimatedBadges?: string[];
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStep,
  completionRate,
  estimatedBadges = []
}) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-4">
        {/* Progress général */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Progression</h3>
            <span className="text-sm text-muted-foreground">
              {completedSteps}/{steps.length}
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Étapes obligatoires */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-500" />
            Étapes obligatoires
          </h4>
          <div className="text-xs text-muted-foreground">
            {completedRequiredSteps}/{requiredSteps.length} terminées
          </div>
          <div className="space-y-1">
            {requiredSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 text-sm">
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={step.completed ? 'text-green-700' : 'text-muted-foreground'}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges estimés */}
        {estimatedBadges.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              Badges à débloquer
            </h4>
            <div className="flex flex-wrap gap-1">
              {estimatedBadges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Message d'encouragement */}
        {completedRequiredSteps === requiredSteps.length ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              🎉 Profil prêt à être publié !
            </p>
            <p className="text-xs text-green-600">
              Toutes les informations obligatoires sont renseignées.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Encore {requiredSteps.length - completedRequiredSteps} étape{requiredSteps.length - completedRequiredSteps > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-600">
              Complétez les informations obligatoires pour publier votre profil.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingProgress;