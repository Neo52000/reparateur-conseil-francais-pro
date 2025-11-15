import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { OnboardingTourTooltip } from '@/components/onboarding/OnboardingTourTooltip';
import { useAuth } from '@/hooks/useAuth';

export const RepairerOnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const onboarding = useOnboardingTour({ 
    role: 'repairer', 
    userId: user?.id 
  });

  useEffect(() => {
    if (user && !onboarding.hasCompletedTour) {
      const timer = setTimeout(() => {
        onboarding.startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, onboarding.hasCompletedTour]);

  return (
    <AnimatePresence>
      {onboarding.isActive && (
        <OnboardingTourTooltip
          title={onboarding.steps[onboarding.currentStep].title}
          description={onboarding.steps[onboarding.currentStep].description}
          currentStep={onboarding.currentStep}
          totalSteps={onboarding.totalSteps}
          target={onboarding.steps[onboarding.currentStep].target}
          placement={onboarding.steps[onboarding.currentStep].placement}
          onNext={onboarding.nextStep}
          onPrevious={onboarding.previousStep}
          onSkip={onboarding.skipTour}
          isFirstStep={onboarding.isFirstStep}
          isLastStep={onboarding.isLastStep}
        />
      )}
    </AnimatePresence>
  );
};
