import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile } from '@/types/repairerProfile';
import { useRepairerProfileSave } from '@/hooks/useRepairerProfileSave';
import { CheckCircle, ArrowRight, ArrowLeft, Shield, Star, Award } from 'lucide-react';

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

  // Définition des étapes d'onboarding
  const steps: OnboardingStep[] = [
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
  ];

  function handleRepairTypeChange(type: string, checked: boolean) {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        repair_types: [...prev.repair_types, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        repair_types: prev.repair_types.filter(t => t !== type),
        other_services: type === 'autres' ? '' : prev.other_services
      }));
    }
  }

  // Calcul des badges potentiels
  const calculatePotentialBadges = (data: RepairerProfile) => {
    const badges = [];
    
    if (data.siret_number?.trim()) {
      badges.push({ name: 'SIRET Vérifié', color: 'bg-green-100 text-green-800' });
    }
    
    if (data.has_qualirepar_label) {
      badges.push({ name: 'QualiRépar', color: 'bg-blue-100 text-blue-800' });
    }
    
    if (data.repair_types?.length >= 3) {
      badges.push({ name: 'Multi-spécialiste', color: 'bg-purple-100 text-purple-800' });
    }
    
    if (data.opening_hours && Object.keys(data.opening_hours).length >= 5) {
      badges.push({ name: 'Disponible 7j/7', color: 'bg-orange-100 text-orange-800' });
    }
    
    return badges;
  };

  // Validation d'une étape
  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step.validation) return true;
    
    const error = step.validation(formData);
    if (error) {
      toast({
        title: "Étape incomplète",
        description: error,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Navigation entre étapes
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      const stepId = steps[currentStep].id;
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps(prev => [...prev, stepId]);
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Sauvegarde finale
  const handleFinish = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      const savedProfile = await saveProfile(formData, profile);
      onSave(savedProfile);
      
      toast({
        title: "Félicitations ! 🎉",
        description: "Votre profil réparateur a été créé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const potentialBadges = calculatePotentialBadges(formData);
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header avec progress */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          {isNewUser ? 'Bienvenue sur TopRéparateurs !' : 'Configuration de votre profil'}
        </h1>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>
      </div>

      {/* Navigation par étapes (mobile-friendly) */}
      <div className="flex overflow-x-auto gap-2 pb-2 md:grid md:grid-cols-5 md:gap-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex-shrink-0 flex items-center gap-2 p-3 rounded-lg border text-sm min-w-[200px] md:min-w-0 ${
              index === currentStep
                ? 'bg-primary/10 border-primary text-primary'
                : completedSteps.includes(step.id)
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-card border-border text-muted-foreground'
            }`}
          >
            <div className="flex-shrink-0">
              {completedSteps.includes(step.id) ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                step.icon
              )}
            </div>
            <div className="hidden md:block">
              <div className="font-medium">{step.title}</div>
              {step.required && <Badge variant="outline" className="text-xs">Obligatoire</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Contenu de l'étape courante */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStepData.component}
        </CardContent>
      </Card>

      {/* Preview des badges potentiels */}
      {potentialBadges.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
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
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : goToPreviousStep}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Annuler' : 'Précédent'}
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentStepData.required ? 'Étape obligatoire' : 'Étape optionnelle'}
        </div>

        <Button
          onClick={isLastStep ? handleFinish : goToNextStep}
          disabled={loading}
        >
          {loading ? 'Sauvegarde...' : isLastStep ? 'Terminer' : 'Suivant'}
          {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default RepairerOnboardingWizard;