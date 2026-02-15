
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  AlertCircle,
  User,
  Wrench
} from 'lucide-react';
import SecurePayment from '../payment/SecurePayment';
import IntegratedMessaging from '../messaging/IntegratedMessaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  description: string;
  timestamp?: string;
}

type WorkflowStepType = 'quote' | 'appointment' | 'payment' | 'repair' | 'completion';

interface CompleteWorkflowProps {
  quoteId: string;
  initialStep?: WorkflowStepType;
}

const CompleteWorkflow: React.FC<CompleteWorkflowProps> = ({
  quoteId,
  initialStep = 'quote'
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStepType>(initialStep);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const steps: WorkflowStep[] = [
    {
      id: 'quote',
      title: 'Devis',
      status: 'completed',
      description: 'Devis accepté par le client'
    },
    {
      id: 'appointment',
      title: 'Rendez-vous',
      status: currentStep === 'appointment' ? 'active' : 'pending',
      description: 'Planification du rendez-vous'
    },
    {
      id: 'payment',
      title: 'Paiement',
      status: currentStep === 'payment' ? 'active' : 'pending',
      description: 'Paiement sécurisé avec rétention'
    },
    {
      id: 'repair',
      title: 'Réparation',
      status: currentStep === 'repair' ? 'active' : 'pending',
      description: 'Réparation en cours'
    },
    {
      id: 'completion',
      title: 'Finalisation',
      status: currentStep === 'completion' ? 'active' : 'pending',
      description: 'Validation et libération des fonds'
    }
  ];

  useEffect(() => {
    loadWorkflowData();
  }, [quoteId]);

  const loadWorkflowData = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      setWorkflowData(data);
    } catch (error) {
      console.error('Erreur chargement workflow:', error);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Mettre à jour le statut du devis
      const { error } = await supabase
        .from('quotes_with_timeline')
        .update({ 
          status: 'payment_received',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;

      setCurrentStep('repair');
      toast({
        title: 'Paiement confirmé',
        description: 'Le réparateur peut maintenant commencer la réparation.',
      });
    } catch (error) {
      console.error('Erreur mise à jour paiement:', error);
    }
  };

  const handleStepValidation = async (step: string) => {
    try {
      setLoading(true);
      
      // Logique de validation selon l'étape
      switch (step) {
        case 'appointment':
          setCurrentStep('payment');
          break;
        case 'payment':
          // Géré par handlePaymentSuccess
          break;
        case 'repair':
          setCurrentStep('completion');
          break;
        case 'completion':
          // Finaliser et libérer les fonds
          toast({
            title: 'Réparation terminée',
            description: 'Les fonds ont été libérés au réparateur.',
          });
          break;
      }
    } catch (error) {
      console.error('Erreur validation étape:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentStep(value as WorkflowStepType);
  };

  if (!workflowData) {
    return <div>Chargement du workflow...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Barre de progression */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi de la réparation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(step.status)}
                  <span className="text-sm font-medium mt-2">{step.title}</span>
                  <span className="text-xs text-gray-500 mt-1 text-center max-w-20">
                    {step.description}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal selon l'étape */}
      <Tabs value={currentStep} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quote">Devis</TabsTrigger>
          <TabsTrigger value="appointment">RDV</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="repair">Réparation</TabsTrigger>
          <TabsTrigger value="completion">Finalisation</TabsTrigger>
        </TabsList>

        <TabsContent value="quote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Devis accepté
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Réparation :</span>
                  <span className="font-medium">{workflowData.repair_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Appareil :</span>
                  <span className="font-medium">{workflowData.device_brand} {workflowData.device_model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix :</span>
                  <span className="font-bold text-green-600">{workflowData.estimated_price}€</span>
                </div>
                <Button 
                  onClick={() => handleStepValidation('quote')}
                  className="w-full"
                >
                  Planifier le rendez-vous
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planification du rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le réparateur vous contactera pour convenir d'un créneau.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => handleStepValidation('appointment')}
                className="w-full"
              >
                Confirmer le rendez-vous
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <SecurePayment
            quoteId={quoteId}
            repairerId={workflowData.repairer_id}
            clientId={workflowData.client_id}
            amount={workflowData.estimated_price}
            description={`Réparation ${workflowData.repair_type} - ${workflowData.device_brand} ${workflowData.device_model}`}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={(error) => toast({
              title: 'Erreur de paiement',
              description: error,
              variant: 'destructive',
            })}
          />
        </TabsContent>

        <TabsContent value="repair" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Réparation en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <span>Réparation en cours...</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Le réparateur travaille sur votre appareil. Vous recevrez une notification dès que c'est terminé.
                  </p>
                  <Button 
                    onClick={() => handleStepValidation('repair')}
                    variant="outline"
                    className="w-full"
                  >
                    Marquer comme terminé
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <IntegratedMessaging
                conversationId={`quote_${quoteId}`}
                userType="client"
                otherParticipant={{
                  id: workflowData.repairer_id,
                  name: "Réparateur",
                  role: 'repairer'
                }}
                quoteId={quoteId}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Réparation terminée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Votre réparation est terminée ! Les fonds ont été libérés au réparateur.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-4">
                  <Button className="flex-1">
                    Laisser un avis
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Télécharger la facture
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompleteWorkflow;
