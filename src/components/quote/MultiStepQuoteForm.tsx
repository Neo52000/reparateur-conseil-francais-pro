import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceInfoStep } from './steps/DeviceInfoStep';
import { IssueDescriptionStep } from './steps/IssueDescriptionStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import { ContactInfoStep } from './steps/ContactInfoStep';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { quoteRequestSchema } from '@/lib/validations/quote';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QuoteFormData {
  deviceBrand: string;
  deviceModel: string;
  issueType: string;
  issueDescription: string;
  photos: File[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContact: 'email' | 'phone';
}

const steps = [
  { id: 1, title: 'Appareil', component: DeviceInfoStep },
  { id: 2, title: 'Problème', component: IssueDescriptionStep },
  { id: 3, title: 'Photos', component: PhotoUploadStep },
  { id: 4, title: 'Contact', component: ContactInfoStep },
];

export const MultiStepQuoteForm: React.FC<{ 
  repairerId?: string;
  onSuccess?: () => void;
}> = ({ repairerId, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (data: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validation avec zod
      const validatedData = quoteRequestSchema.parse({
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        issueType: formData.issueType,
        issueDescription: formData.issueDescription,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        preferredContact: formData.preferredContact
      });

      // Insertion en base de données
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .insert({
          client_id: user?.id,
          repairer_id: repairerId,
          device_brand: validatedData.deviceBrand,
          device_model: validatedData.deviceModel,
          repair_type: validatedData.issueType,
          issue_description: validatedData.issueDescription,
          client_name: validatedData.contactName,
          client_email: validatedData.contactEmail,
          client_phone: validatedData.contactPhone,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      enhancedToast.success({
        title: 'Demande de devis envoyée !',
        description: 'Vous recevrez une réponse sous 24h',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Quote submission error:', error);
      
      if (error.name === 'ZodError') {
        enhancedToast.error({
          title: 'Données invalides',
          description: error.errors[0]?.message || 'Veuillez vérifier vos informations',
        });
      } else {
        enhancedToast.error({
          title: 'Erreur',
          description: 'Impossible d\'envoyer la demande',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.deviceBrand && formData.deviceModel;
      case 1:
        return formData.issueType && formData.issueDescription;
      case 2:
        return true; // Photos optionnelles
      case 3:
        return formData.contactName && formData.contactEmail;
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="text-2xl">Demande de devis</CardTitle>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index < currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index === currentStep
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-2 transition-colors ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[300px]"
          >
            <CurrentStepComponent 
              data={formData} 
              onChange={handleStepData}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
