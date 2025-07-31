import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Star, 
  Award, 
  Trophy,
  Target,
  Sparkles,
  Gift
} from 'lucide-react';
import { ConfettiAnimation, AnimatedProgress } from '@/components/animations/AnimatedComponents';

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

interface EnhancedOnboardingProgressProps {
  steps: OnboardingStep[];
  currentStep: number;
  completionRate: number;
  estimatedBadges?: string[];
  onStepClick?: (stepIndex: number) => void;
}

const EnhancedOnboardingProgress: React.FC<EnhancedOnboardingProgressProps> = ({
  steps,
  currentStep,
  completionRate,
  estimatedBadges = [],
  onStepClick
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousCompletionRate, setPreviousCompletionRate] = useState(0);
  const [newlyCompletedSteps, setNewlyCompletedSteps] = useState<string[]>([]);

  const completedSteps = steps.filter(step => step.completed).length;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;
  const allRequiredCompleted = completedRequiredSteps === requiredSteps.length;

  // Détecter les nouvelles étapes complétées
  useEffect(() => {
    if (completionRate > previousCompletionRate && completionRate > 0) {
      const newCompletedSteps = steps
        .filter(step => step.completed)
        .map(step => step.id)
        .filter(id => !newlyCompletedSteps.includes(id));
      
      if (newCompletedSteps.length > 0) {
        setNewlyCompletedSteps(prev => [...prev, ...newCompletedSteps]);
        
        // Confettis si étape importante ou toutes les étapes requises
        if (allRequiredCompleted || completionRate === 100) {
          setShowConfetti(true);
        }
      }
    }
    setPreviousCompletionRate(completionRate);
  }, [completionRate, steps, allRequiredCompleted, newlyCompletedSteps, previousCompletionRate]);

  // Animations pour les étapes
  const stepVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    completed: { 
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    }
  };

  const badgeVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0
    },
    hover: { 
      scale: 1.05,
      rotate: 5
    }
  };

  return (
    <>
      <ConfettiAnimation 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4"
      >
        <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="p-6 space-y-6">
            {/* Header avec icône dynamique */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`p-3 rounded-full ${
                  allRequiredCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-primary/10 text-primary'
                }`}
                animate={allRequiredCompleted ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.8 }}
              >
                {allRequiredCompleted ? (
                  <Trophy className="h-6 w-6" />
                ) : (
                  <Target className="h-6 w-6" />
                )}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">
                  {allRequiredCompleted ? '🎉 Profil prêt !' : 'Configuration du profil'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {allRequiredCompleted 
                    ? 'Votre profil est maintenant visible aux clients'
                    : `${completedSteps}/${steps.length} étapes terminées`
                  }
                </p>
              </div>
            </motion.div>

            {/* Progression animée */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Progression globale</span>
                <motion.span 
                  className="text-sm font-bold text-primary"
                  key={completionRate}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {Math.round(completionRate)}%
                </motion.span>
              </div>
              <AnimatedProgress 
                value={completionRate} 
                color="primary"
                animate={true}
              />
            </div>

            {/* Étapes obligatoires avec animations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                Étapes obligatoires
                <Badge variant="outline" className="text-xs">
                  {completedRequiredSteps}/{requiredSteps.length}
                </Badge>
              </h4>
              
              <div className="space-y-2">
                {requiredSteps.map((step, index) => {
                  const isNewlyCompleted = newlyCompletedSteps.includes(step.id);
                  
                  return (
                    <motion.div
                      key={step.id}
                      variants={stepVariants}
                      initial="initial"
                      animate={isNewlyCompleted ? "completed" : "animate"}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                        step.completed 
                          ? 'bg-green-50 hover:bg-green-100' 
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => onStepClick?.(index)}
                    >
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: step.completed ? [1, 1.2, 1] : 1,
                          rotate: step.completed ? [0, 10, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </motion.div>
                      
                      <span className={`text-sm font-medium ${
                        step.completed ? 'text-green-700' : 'text-foreground'
                      }`}>
                        {step.title}
                      </span>
                      
                      {isNewlyCompleted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="ml-auto"
                        >
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Badges estimés avec animations */}
            <AnimatePresence>
              {estimatedBadges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 border-t pt-4"
                >
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    Badges à débloquer
                    <Gift className="h-4 w-4 text-purple-500" />
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {estimatedBadges.map((badge, index) => (
                      <motion.div
                        key={badge}
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300"
                        >
                          {badge}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message de statut avec animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {allRequiredCompleted ? (
                <motion.div
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <p className="font-bold text-green-800">
                      Félicitations ! 🎉
                    </p>
                  </div>
                  <p className="text-sm text-green-700">
                    Votre profil est maintenant visible aux clients et optimisé pour attirer plus de demandes.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="p-4 bg-gradient-to-r from-blue-50 to-primary/5 border border-blue-200 rounded-lg"
                  animate={{ borderColor: ['#dbeafe', '#60a5fa', '#dbeafe'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-primary">
                      Encore {requiredSteps.length - completedRequiredSteps} étape{requiredSteps.length - completedRequiredSteps > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Complétez les informations obligatoires pour rendre votre profil visible.
                  </p>
                  
                  {onStepClick && (
                    <Button 
                      size="sm" 
                      className="w-full animate-pulse"
                      onClick={() => {
                        const nextIncompleteStep = requiredSteps.findIndex(step => !step.completed);
                        if (nextIncompleteStep !== -1) {
                          onStepClick(nextIncompleteStep);
                        }
                      }}
                    >
                      Continuer la configuration
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default EnhancedOnboardingProgress;