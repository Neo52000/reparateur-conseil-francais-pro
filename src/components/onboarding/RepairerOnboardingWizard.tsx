import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile } from '@/types/repairerProfile';
import { useRepairerProfileSave } from '@/hooks/useRepairerProfileSave';
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Star, Award } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

// Import des sections existantes
import BasicInfoSection from '../repairer-profile/BasicInfoSection';
import ContactInfoSection from '../repairer-profile/ContactInfoSection';
import RepairServicesSection from '../repairer-profile/RepairServicesSection';
import BusinessInfoSection from '../repairer-profile/BusinessInfoSection';
import OpeningHoursSection from '../repairer-profile/OpeningHoursSection';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  component: React.ReactNode;
  validation?: (data: RepairerProfile) => string | null;
}

interface RepairerOnboardingWizardProps {
  profile: RepairerProfile;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  isNewUser?: boolean;
}

const RepairerOnboardingWizard: React.FC<RepairerOnboardingWizardProps> = ({
  profile,
  onSave,
  onCancel,
  isNewUser = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RepairerProfile>(profile);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { saveProfile } = useRepairerProfileSave();

  // Fonction optimisée pour le changement de type de réparation
  const handleRepairTypeChange = useCallback((type: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          repair_types: [...prev.repair_types, type]
        };
      } else {
        return {
          ...prev,
          repair_types: prev.repair_types.filter(t => t !== type),
          other_services: type === 'autres' ? '' : prev.other_services
        };
      }
    });
  }, []);

  // Auto-save des données du formulaire
  const { isSaving, lastSaved } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      if (data.business_name?.trim()) {
        await saveProfile(data, profile);
      }
    },
    delay: 3000,
    enabled: !!formData.business_name?.trim()
  });

  // Définition des étapes d'onboarding optimisée avec useMemo
  const steps: OnboardingStep[] = useMemo(() => [
    {
      id: 'basic',
      title: 'Informations de base',
      description: 'Nom commercial et SIRET obligatoires',
      icon: <Shield className="h-5 w-5" />,
      required: true,
      component: <BasicInfoSection formData={formData} setFormData={setFormData} />,
      validation: (data) => {
        if (!data.business_name?.trim()) return 'Le nom commercial est obligatoire';
        if (!data.siret_number?.trim()) return 'Le numéro SIRET est obligatoire';
        return null;
      }
    },
    {
      id: 'contact',
      title: 'Coordonnées',
      description: 'Adresse, téléphone et email',
      icon: <Star className="h-5 w-5" />,
      required: true,
      component: <ContactInfoSection formData={formData} setFormData={setFormData} />,
      validation: (data) => {
        if (!data.address?.trim()) return 'L\'adresse est obligatoire';
        if (!data.phone?.trim()) return 'Le téléphone est obligatoire';
        return null;
      }
    },
    {
      id: 'services',
      title: 'Services proposés',
      description: 'Types de réparations et spécialités',
      icon: <Award className="h-5 w-5" />,
      required: true,
      component: (
        <RepairServicesSection 
          formData={formData} 
          setFormData={setFormData}
          onRepairTypeChange={handleRepairTypeChange}
        />
      ),
      validation: (data) => {
        if (!data.repair_types?.length) return 'Sélectionnez au moins un type de réparation';
        return null;
      }
    },
    {
      id: 'business',
      title: 'Entreprise',
      description: 'Détails complémentaires (optionnel)',
      icon: <CheckCircle className="h-5 w-5" />,
      required: false,
      component: <BusinessInfoSection formData={formData} setFormData={setFormData} />
    },
    {
      id: 'hours',
      title: 'Horaires',
      description: 'Jours et heures d\'ouverture (optionnel)',
      icon: <CheckCircle className="h-5 w-5" />,
      required: false,
      component: <OpeningHoursSection formData={formData} setFormData={setFormData} />
    }
  ], [formData, setFormData, handleRepairTypeChange]);

  // Calcul des badges potentiels mémorisé
  const potentialBadges = useMemo(() => {
    const badges = [];
    
    if (formData.siret_number?.trim()) {
      badges.push({ name: 'SIRET Vérifié', color: 'bg-green-100 text-green-800' });
    }
    
    if (formData.has_qualirepar_label) {
      badges.push({ name: 'QualiRépar', color: 'bg-blue-100 text-blue-800' });
    }
    
    if (formData.repair_types?.length >= 3) {
      badges.push({ name: 'Multi-spécialiste', color: 'bg-purple-100 text-purple-800' });
    }
    
    if (formData.opening_hours && Object.keys(formData.opening_hours).length >= 5) {
      badges.push({ name: 'Disponible 7j/7', color: 'bg-orange-100 text-orange-800' });
    }
    
    return badges;
  }, [formData]);

  // État calculé pour la navigation
  const navigationState = useMemo(() => {
    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const progress = ((currentStep + 1) / steps.length) * 100;
    
    return {
      currentStepData,
      isFirstStep,
      isLastStep,
      progress
    };
  }, [currentStep, steps]);

  // Validation d'une étape optimisée
  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (step?.validation) {
      const error = step.validation(formData);
      if (error) {
        toast({
          title: "Validation échouée",
          description: error,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  }, [steps, formData, toast]);

  // Navigation optimisée
  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCompletedSteps(prev => [...new Set([...prev, steps[currentStep].id])]);
    }
  }, [currentStep, steps.length, validateStep, steps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalisation optimisée du processus
  const handleFinish = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await saveProfile(formData, profile);
      
      toast({
        title: "Profil créé avec succès !",
        description: `Votre profil réparateur est maintenant complet. ${potentialBadges.length > 0 ? `Badges obtenus: ${potentialBadges.length}` : ''}`,
        variant: "default"
      });

      onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentStep, validateStep, formData, saveProfile, potentialBadges.length, onSave, toast, profile]);

  const { currentStepData, isFirstStep, isLastStep, progress } = navigationState;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec indicateur d'auto-save */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Configuration de votre profil réparateur
        </h1>
        <p className="text-gray-600">
          Complétez votre profil en {steps.length} étapes simples
        </p>
        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            Sauvegarde automatique...
          </div>
        )}
        {lastSaved && !isSaving && (
          <div className="text-xs text-green-600">
            Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Étape {currentStep + 1} sur {steps.length}</span>
          <span>{Math.round(progress)}% complété</span>
        </div>
      </div>

      {/* Navigation par étapes */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 p-3 rounded-lg border ${
              index === currentStep
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : completedSteps.includes(step.id)
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex-shrink-0">
              {completedSteps.includes(step.id) ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                step.icon
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{step.title}</p>
              {step.required && (
                <Badge variant="outline" className="text-xs mt-1">
                  Obligatoire
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contenu de l'étape courante */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStepData.component}
        </CardContent>
      </Card>

      {/* Badges potentiels */}
      {potentialBadges.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Badges que vous obtiendrez
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {potentialBadges.map((badge, index) => (
                <Badge key={index} className={badge.color}>
                  {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={isFirstStep ? onCancel : goToPreviousStep}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isFirstStep ? 'Annuler' : 'Précédent'}
        </Button>

        <div className="text-sm text-gray-500">
          {currentStepData.required ? 'Étape obligatoire' : 'Étape optionnelle'}
        </div>

        <Button
          onClick={isLastStep ? handleFinish : goToNextStep}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : isLastStep ? (
            'Terminer'
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RepairerOnboardingWizard;