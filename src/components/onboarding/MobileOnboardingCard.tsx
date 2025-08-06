import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Star, Award } from 'lucide-react';

interface MobileOnboardingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  currentStep: number;
  totalSteps: number;
  required: boolean;
  completed: boolean;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  estimatedBadges?: string[];
  children: React.ReactNode;
}

const MobileOnboardingCard: React.FC<MobileOnboardingCardProps> = ({
  title,
  description,
  icon,
  progress,
  currentStep,
  totalSteps,
  required,
  completed,
  onNext,
  onPrevious,
  canProceed,
  estimatedBadges = [],
  children
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      {/* Header mobile */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b p-4 -mx-4 mb-6 z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {completed ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <div className="p-2 bg-primary/10 rounded-full">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="font-semibold text-lg">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {required && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Obligatoire
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>

      {/* Badges preview (mobile) */}
      {estimatedBadges.length > 0 && (
        <Card className="mt-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-sm">Badges à débloquer</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {estimatedBadges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="flex gap-3 max-w-md mx-auto">
          {onPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              className="flex-1"
            >
              Précédent
            </Button>
          )}
          
          <Button
            onClick={onNext}
            disabled={required && !canProceed}
            className="flex-1"
          >
            {currentStep === totalSteps - 1 ? 'Terminer' : 'Suivant'}
            {currentStep !== totalSteps - 1 && (
              <ArrowRight className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>
        
        {required && !canProceed && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Complétez les champs obligatoires pour continuer
          </p>
        )}
      </div>

      {/* Espace pour éviter que le contenu soit masqué par la navigation fixe */}
      <div className="h-20" />
    </div>
  );
};

export default MobileOnboardingCard;