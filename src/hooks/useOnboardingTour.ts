import { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector pour l'élément à cibler
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const CLIENT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur iRepair Pro',
    description: 'Trouvez le réparateur idéal pour votre appareil en quelques clics',
  },
  {
    id: 'search',
    title: 'Recherchez un réparateur',
    description: 'Utilisez notre moteur de recherche intelligent pour trouver des réparateurs près de chez vous',
    target: '[data-tour="search-input"]',
    placement: 'bottom',
  },
  {
    id: 'filters',
    title: 'Affinez votre recherche',
    description: 'Utilisez les filtres pour trouver exactement ce que vous cherchez',
    target: '[data-tour="search-filters"]',
    placement: 'right',
  },
  {
    id: 'quote',
    title: 'Demandez un devis',
    description: 'Contactez directement les réparateurs et recevez des devis gratuits',
    target: '[data-tour="quote-button"]',
    placement: 'top',
  },
  {
    id: 'tracking',
    title: 'Suivez vos réparations',
    description: 'Accédez à votre tableau de bord pour suivre toutes vos demandes',
    target: '[data-tour="dashboard-link"]',
    placement: 'bottom',
  },
];

const REPAIRER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue réparateur',
    description: 'Développez votre activité avec iRepair Pro',
  },
  {
    id: 'profile',
    title: 'Complétez votre profil',
    description: 'Un profil complet augmente vos chances d\'être contacté',
    target: '[data-tour="profile-progress"]',
    placement: 'bottom',
  },
  {
    id: 'quotes',
    title: 'Gérez vos devis',
    description: 'Répondez rapidement aux demandes pour améliorer votre taux de conversion',
    target: '[data-tour="quotes-section"]',
    placement: 'right',
  },
  {
    id: 'analytics',
    title: 'Suivez vos performances',
    description: 'Analysez vos statistiques pour optimiser votre activité',
    target: '[data-tour="analytics"]',
    placement: 'top',
  },
];

interface UseOnboardingTourProps {
  role: 'client' | 'repairer';
  userId?: string;
}

export const useOnboardingTour = ({ role, userId }: UseOnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  const steps = role === 'client' ? CLIENT_ONBOARDING_STEPS : REPAIRER_ONBOARDING_STEPS;
  const storageKey = `onboarding_tour_${role}_${userId || 'guest'}`;

  useEffect(() => {
    // Vérifier si le tour a déjà été complété
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') {
      setHasCompletedTour(true);
    }
  }, [storageKey]);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(storageKey, 'true');
  };

  const resetTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem(storageKey);
  };

  return {
    currentStep,
    steps,
    isActive,
    hasCompletedTour,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    resetTour,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
};
