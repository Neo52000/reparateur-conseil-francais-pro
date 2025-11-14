import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OnboardingTourTooltipProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const OnboardingTourTooltip: React.FC<OnboardingTourTooltipProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  target,
  placement = 'bottom',
  onNext,
  onPrevious,
  onSkip,
  isFirstStep,
  isLastStep,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (target) {
      const element = document.querySelector(target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Highlight l'élément ciblé
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'rounded-lg');

        // Calculer la position
        const rect = element.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 16;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 16;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 16;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 16;
            break;
        }

        setPosition({ top, left });

        // Scroll vers l'élément
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'rounded-lg');
      }
    };
  }, [target, placement, targetElement]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000]"
        onClick={onSkip}
      />

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'absolute',
            top: target ? position.top : '50%',
            left: target ? position.left : '50%',
            transform: target
              ? placement === 'left' || placement === 'right'
                ? 'translateY(-50%)'
                : 'translateX(-50%)'
              : 'translate(-50%, -50%)',
          }}
          className="z-[1002] w-96 max-w-[90vw]"
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{title}</CardTitle>
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Étape {currentStep + 1} sur {totalSteps}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="h-8 w-8 p-0 -mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <p className="text-muted-foreground">{description}</p>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground"
              >
                Passer le tour
              </Button>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={onPrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                )}
                <Button size="sm" onClick={onNext}>
                  {isLastStep ? 'Terminer' : 'Suivant'}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
