import { useState, useEffect } from 'react';
import { RepairerProfile } from '@/types/repairerProfile';

export interface OnboardingStepData {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  validationErrors?: string[];
}

export interface OnboardingFlowState {
  currentStep: number;
  steps: OnboardingStepData[];
  completionRate: number;
  canProceed: boolean;
  estimatedBadges: string[];
}

export const useOnboardingFlow = (profile: RepairerProfile) => {
  const [flowState, setFlowState] = useState<OnboardingFlowState>({
    currentStep: 0,
    steps: [],
    completionRate: 0,
    canProceed: false,
    estimatedBadges: []
  });

  // Définition des étapes d'onboarding
  const defineSteps = (profile: RepairerProfile): OnboardingStepData[] => {
    return [
      {
        id: 'basic',
        title: 'Informations de base',
        description: 'Nom commercial et SIRET',
        required: true,
        completed: !!(profile.business_name?.trim() && profile.siret_number?.trim())
      },
      {
        id: 'contact',
        title: 'Coordonnées',
        description: 'Adresse et contact',
        required: true,
        completed: !!(profile.address?.trim() && profile.phone?.trim())
      },
      {
        id: 'services',
        title: 'Services',
        description: 'Types de réparations',
        required: true,
        completed: !!(profile.repair_types?.length > 0)
      },
      {
        id: 'business',
        title: 'Entreprise',
        description: 'Informations complémentaires',
        required: false,
        completed: !!(profile.website?.trim() || profile.description?.trim())
      },
      {
        id: 'hours',
        title: 'Horaires',
        description: 'Heures d\'ouverture',
        required: false,
        completed: !!(profile.opening_hours && Object.keys(profile.opening_hours).length > 0)
      }
    ];
  };

  // Calcul des badges estimés
  const calculateEstimatedBadges = (profile: RepairerProfile): string[] => {
    const badges: string[] = [];
    
    if (profile.siret_number?.trim()) {
      badges.push('SIRET Vérifié');
    }
    
    if (profile.has_qualirepar_label) {
      badges.push('QualiRépar Certifié');
    }
    
    if (profile.repair_types?.length >= 3) {
      badges.push('Multi-spécialiste');
    }
    
    if (profile.opening_hours && Object.keys(profile.opening_hours).length >= 6) {
      badges.push('Service 6j/7');
    }
    
    if (profile.website?.trim()) {
      badges.push('Présence Web');
    }
    
    if (profile.description?.trim() && profile.description.length > 100) {
      badges.push('Profil Détaillé');
    }

    return badges;
  };

  // Mise à jour du state en fonction du profil
  useEffect(() => {
    const steps = defineSteps(profile);
    const completedSteps = steps.filter(step => step.completed).length;
    const requiredSteps = steps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;
    
    const completionRate = (completedSteps / steps.length) * 100;
    const canProceed = completedRequiredSteps === requiredSteps.length;
    const estimatedBadges = calculateEstimatedBadges(profile);

    setFlowState({
      currentStep: flowState.currentStep,
      steps,
      completionRate,
      canProceed,
      estimatedBadges
    });
  }, [profile]);

  // Fonctions de navigation
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < flowState.steps.length) {
      setFlowState(prev => ({
        ...prev,
        currentStep: stepIndex
      }));
    }
  };

  const nextStep = () => {
    if (flowState.currentStep < flowState.steps.length - 1) {
      goToStep(flowState.currentStep + 1);
    }
  };

  const previousStep = () => {
    if (flowState.currentStep > 0) {
      goToStep(flowState.currentStep - 1);
    }
  };

  // Validation d'une étape
  const validateStep = (stepId: string, data: RepairerProfile): string[] => {
    const errors: string[] = [];
    
    switch (stepId) {
      case 'basic':
        if (!data.business_name?.trim()) errors.push('Le nom commercial est obligatoire');
        if (!data.siret_number?.trim()) errors.push('Le numéro SIRET est obligatoire');
        break;
      case 'contact':
        if (!data.address?.trim()) errors.push('L\'adresse est obligatoire');
        if (!data.phone?.trim()) errors.push('Le téléphone est obligatoire');
        break;
      case 'services':
        if (!data.repair_types?.length) errors.push('Sélectionnez au moins un type de réparation');
        break;
    }
    
    return errors;
  };

  return {
    flowState,
    goToStep,
    nextStep,
    previousStep,
    validateStep,
    isLastStep: flowState.currentStep === flowState.steps.length - 1,
    isFirstStep: flowState.currentStep === 0,
    currentStepData: flowState.steps[flowState.currentStep],
    completionRate: flowState.completionRate,
    canProceed: flowState.canProceed
  };
};