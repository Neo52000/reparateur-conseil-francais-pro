import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Recycle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import MetadataStep from './steps/MetadataStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ConfirmationStep from './steps/ConfirmationStep';
import { QualiReparDossier } from '@/types/qualirepar';
import { useQualiReparDossiers } from '@/hooks/useQualiReparDossiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QualiReparWizardProps {
  dossierId?: string;
  onComplete?: () => void;
}

const QualiReparWizard: React.FC<QualiReparWizardProps> = ({
  dossierId,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dossier, setDossier] = useState<QualiReparDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const { createDossier } = useQualiReparDossiers();

  const steps = [
    { number: 1, title: 'Métadonnées', description: 'Informations client et produit' },
    { number: 2, title: 'Documents', description: 'Upload des pièces justificatives' },
    { number: 3, title: 'Confirmation', description: 'Validation et soumission' }
  ];

  useEffect(() => {
    if (dossierId) {
      loadDossier(dossierId);
    }
  }, [dossierId]);

  const loadDossier = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const dossierData = data as QualiReparDossier;
      setDossier(dossierData);
      setCurrentStep(dossierData.wizard_step || 1);
    } catch (error) {
      console.error('Error loading dossier:', error);
      toast.error('Erreur lors du chargement du dossier');
    }
  };

  const handleStepComplete = async (stepData: any) => {
    setLoading(true);
    try {
      switch (currentStep) {
        case 1:
          // Étape 1: Créer le dossier et l'initialiser via l'API
          let newDossier;
          if (!dossier) {
            newDossier = await createDossier(stepData);
            if (!newDossier) {
              throw new Error('Failed to create dossier');
            }
            setDossier(newDossier);
          }

          // Initialiser via l'API QualiRépar
          const initResponse = await supabase.functions.invoke('qualirepar-init', {
            body: { dossierId: dossier?.id || newDossier?.id }
          });

          if (initResponse.error) {
            throw new Error(initResponse.error.message);
          }

          toast.success('Demande initialisée avec succès');
          setCurrentStep(2);
          await loadDossier(dossier?.id || newDossier?.id);
          break;

        case 2:
          // Étape 2: Vérifier que tous les documents sont uploadés
          if (stepData.allDocumentsUploaded) {
            // Mettre à jour le statut du dossier
            await supabase
              .from('qualirepar_dossiers')
              .update({
                status: 'documents_uploaded',
                wizard_step: 3,
                updated_at: new Date().toISOString()
              })
              .eq('id', dossier!.id);

            toast.success('Tous les documents ont été uploadés');
            setCurrentStep(3);
            await loadDossier(dossier!.id);
          } else {
            toast.error('Veuillez uploader tous les documents requis');
          }
          break;

        case 3:
          // Étape 3: Confirmer et soumettre via l'API
          const confirmResponse = await supabase.functions.invoke('qualirepar-confirm', {
            body: { dossierId: dossier!.id }
          });

          if (confirmResponse.error) {
            throw new Error(confirmResponse.error.message);
          }

          toast.success('Demande confirmée et soumise avec succès');
          if (onComplete) {
            onComplete();
          }
          break;
      }
    } catch (error) {
      console.error('Error in step completion:', error);
      toast.error(error.message || 'Erreur lors de la validation de l\'étape');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    if (status === 'current') return <Clock className="h-5 w-5 text-blue-600" />;
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MetadataStep
            dossier={dossier}
            onComplete={handleStepComplete}
            loading={loading}
          />
        );
      case 2:
        return (
          <DocumentUploadStep
            dossier={dossier!}
            onComplete={handleStepComplete}
            loading={loading}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            dossier={dossier!}
            onComplete={handleStepComplete}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête avec progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Recycle className="h-6 w-6 text-emerald-600" />
              <div>
                <CardTitle>Module QualiRépar v2</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Conforme à l'API officielle du Fonds Réparation
                </p>
              </div>
            </div>
            {(dossier?.reimbursement_claim_id || dossier?.temporary_claim_id) && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                ID: {dossier.reimbursement_claim_id || dossier.temporary_claim_id}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de progression */}
          <div className="mb-6">
            <Progress value={(currentStep / 3) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Étape {currentStep} sur 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% complété</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 mb-2">
                    {getStepIcon(step.number)}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-4 mt-[-20px]" />
                )}
              </div>
            ))}
          </div>

          {/* Alertes de statut API */}
          {dossier?.is_api_compliant && (
            <Alert className="mb-4 border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Ce dossier est conforme à l'API officielle du Fonds Réparation
              </AlertDescription>
            </Alert>
          )}

          {dossier && !dossier.is_api_compliant && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Ce dossier utilise l'ancien système. Veuillez créer un nouveau dossier v2.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contenu de l'étape actuelle */}
      {renderCurrentStep()}
    </div>
  );
};

export default QualiReparWizard;