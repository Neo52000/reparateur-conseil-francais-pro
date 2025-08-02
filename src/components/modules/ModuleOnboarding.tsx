import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  Video,
  FileText,
  Settings,
  Lightbulb,
  Users,
  MessageSquare
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  isCompleted: boolean;
  action: () => void;
}

interface ModuleOnboardingProps {
  moduleId: string;
  moduleName: string;
  onComplete: () => void;
  onSkip: () => void;
}

const ModuleOnboarding: React.FC<ModuleOnboardingProps> = ({
  moduleId,
  moduleName,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const getOnboardingSteps = (moduleId: string): OnboardingStep[] => {
    switch (moduleId) {
      case 'pos':
        return [
          {
            id: 'welcome',
            title: 'Bienvenue dans le POS',
            description: 'Découvrez les fonctionnalités essentielles de votre nouveau système de caisse',
            icon: <Play className="h-5 w-5" />,
            estimatedTime: '2 min',
            isCompleted: false,
            action: () => completeStep('welcome')
          },
          {
            id: 'setup-inventory',
            title: 'Configuration Inventaire',
            description: 'Ajoutez vos premiers produits et configurez votre stock',
            icon: <Settings className="h-5 w-5" />,
            estimatedTime: '5 min',
            isCompleted: false,
            action: () => completeStep('setup-inventory')
          },
          {
            id: 'first-sale',
            title: 'Première Vente',
            description: 'Effectuez votre première transaction test',
            icon: <CheckCircle className="h-5 w-5" />,
            estimatedTime: '3 min',
            isCompleted: false,
            action: () => completeStep('first-sale')
          },
          {
            id: 'analytics-tour',
            title: 'Tour des Analytics',
            description: 'Apprenez à lire vos statistiques de vente',
            icon: <BookOpen className="h-5 w-5" />,
            estimatedTime: '4 min',
            isCompleted: false,
            action: () => completeStep('analytics-tour')
          }
        ];

      case 'ecommerce':
        return [
          {
            id: 'store-setup',
            title: 'Configuration Boutique',
            description: 'Personnalisez l\'apparence de votre boutique en ligne',
            icon: <Settings className="h-5 w-5" />,
            estimatedTime: '8 min',
            isCompleted: false,
            action: () => completeStep('store-setup')
          },
          {
            id: 'product-catalog',
            title: 'Catalogue Produits',
            description: 'Synchronisez votre inventaire avec la boutique',
            icon: <FileText className="h-5 w-5" />,
            estimatedTime: '6 min',
            isCompleted: false,
            action: () => completeStep('product-catalog')
          },
          {
            id: 'payment-setup',
            title: 'Configuration Paiements',
            description: 'Connectez vos moyens de paiement',
            icon: <CheckCircle className="h-5 w-5" />,
            estimatedTime: '5 min',
            isCompleted: false,
            action: () => completeStep('payment-setup')
          },
          {
            id: 'first-order',
            title: 'Première Commande Test',
            description: 'Testez le parcours client complet',
            icon: <Play className="h-5 w-5" />,
            estimatedTime: '4 min',
            isCompleted: false,
            action: () => completeStep('first-order')
          }
        ];

      case 'advertising':
        return [
          {
            id: 'audience-setup',
            title: 'Définir votre Audience',
            description: 'Configurez votre zone de chalandise et cibles',
            icon: <Users className="h-5 w-5" />,
            estimatedTime: '6 min',
            isCompleted: false,
            action: () => completeStep('audience-setup')
          },
          {
            id: 'first-campaign',
            title: 'Première Campagne IA',
            description: 'Créez votre première publicité automatisée',
            icon: <Lightbulb className="h-5 w-5" />,
            estimatedTime: '8 min',
            isCompleted: false,
            action: () => completeStep('first-campaign')
          },
          {
            id: 'performance-tracking',
            title: 'Suivi Performance',
            description: 'Apprenez à analyser vos résultats publicitaires',
            icon: <BookOpen className="h-5 w-5" />,
            estimatedTime: '5 min',
            isCompleted: false,
            action: () => completeStep('performance-tracking')
          }
        ];

      default:
        return [
          {
            id: 'getting-started',
            title: 'Prise en Main',
            description: 'Découvrez les fonctionnalités de base du module',
            icon: <Play className="h-5 w-5" />,
            estimatedTime: '5 min',
            isCompleted: false,
            action: () => completeStep('getting-started')
          },
          {
            id: 'advanced-features',
            title: 'Fonctions Avancées',
            description: 'Explorez les options de configuration avancées',
            icon: <Settings className="h-5 w-5" />,
            estimatedTime: '8 min',
            isCompleted: false,
            action: () => completeStep('advanced-features')
          }
        ];
    }
  };

  const steps = getOnboardingSteps(moduleId);
  const totalSteps = steps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const completeStep = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    const nextStepIndex = steps.findIndex(step => step.id === stepId) + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
    } else {
      // Toutes les étapes sont terminées - complétion immédiate
      onComplete();
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Configuration de {moduleName}
        </h1>
        <p className="text-gray-600">
          Suivez ces étapes pour tirer le meilleur parti de votre nouveau module
        </p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{completedCount}/{totalSteps} étapes</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep || isCompleted;
          
          return (
            <Card 
              key={step.id} 
              className={`relative cursor-pointer transition-all ${
                isCurrent ? 'ring-2 ring-primary shadow-lg' : ''
              } ${
                isCompleted ? 'bg-green-50 border-green-200' : ''
              } ${
                !isAccessible ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              onClick={() => isAccessible && goToStep(index)}
            >
              {isCompleted && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <p className="text-sm text-gray-500">{step.estimatedTime}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">
                  {step.description}
                </p>
                
                {isCurrent && !isCompleted && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      step.action();
                    }}
                    className="w-full"
                  >
                    Commencer cette étape
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Étape terminée
                  </div>
                )}
                
                {!isAccessible && (
                  <div className="text-gray-400 text-sm">
                    Terminez les étapes précédentes pour débloquer
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help & Skip */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Tutoriel vidéo
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Aide en direct
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {completedCount === totalSteps ? (
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Configuration Terminée
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onSkip}>
                Passer la configuration
              </Button>
              <span className="text-sm text-gray-500">
                {totalSteps - completedCount} étapes restantes
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleOnboarding;