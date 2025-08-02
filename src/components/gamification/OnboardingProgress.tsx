import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  User, 
  MapPin, 
  Phone, 
  Store, 
  Settings,
  ArrowRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  actionText?: string;
  actionUrl?: string;
}

interface OnboardingProgressProps {
  userType: 'client' | 'repairer';
  steps: OnboardingStep[];
  currentStep: number;
  completionPercentage: number;
  onStepClick?: (stepId: string) => void;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  userType,
  steps,
  currentStep,
  completionPercentage,
  onStepClick
}) => {
  const getNextLevelReward = () => {
    if (userType === 'repairer') {
      if (completionPercentage >= 80) return 'Débloquez votre boutique en ligne !';
      if (completionPercentage >= 60) return 'Accédez aux outils de gestion avancés';
      if (completionPercentage >= 40) return 'Recevez plus de demandes de devis';
      return 'Améliorez votre visibilité';
    } else {
      if (completionPercentage >= 80) return 'Accès aux offres exclusives !';
      if (completionPercentage >= 60) return 'Historique complet de vos réparations';
      if (completionPercentage >= 40) return 'Notifications personnalisées';
      return 'Système de recommandations activé';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{Math.round(completionPercentage)}%</span>
            </div>
            Configuration de votre profil
          </CardTitle>
          <Badge 
            variant={completionPercentage === 100 ? "default" : "secondary"}
            className="ml-2"
          >
            {completionPercentage === 100 ? "Terminé" : `${currentStep}/${steps.length}`}
          </Badge>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Récompense du prochain niveau */}
        {completionPercentage < 100 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <ArrowRight className="h-4 w-4" />
              Prochain débloquage : {getNextLevelReward()}
            </div>
          </div>
        )}

        {/* Liste des étapes */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
                ${step.completed 
                  ? 'bg-green-50 border-green-200' 
                  : index === currentStep 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-shrink-0 text-gray-600">
                {step.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  {step.completed && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      +10 XP
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                
                {!step.completed && step.actionText && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (step.actionUrl) {
                        window.location.href = step.actionUrl;
                      }
                    }}
                  >
                    {step.actionText}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message de félicitations si terminé */}
        {completionPercentage === 100 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-600 mb-2">
              <CheckCircle className="h-8 w-8 mx-auto" />
            </div>
            <h4 className="font-semibold text-green-700 mb-1">
              Félicitations ! Profil complété
            </h4>
            <p className="text-sm text-green-600">
              Vous avez débloqué toutes les fonctionnalités. Profitez pleinement de notre plateforme !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingProgress;