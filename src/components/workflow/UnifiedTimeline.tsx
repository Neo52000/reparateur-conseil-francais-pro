import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  Wrench, 
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UnifiedTimelineProps {
  quoteId: string;
}

interface WorkflowStep {
  id: string;
  status: string;
  label: string;
  icon: React.ReactNode;
  date?: string;
  action?: () => void;
  actionLabel?: string;
}

const STATUS_COLORS = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  viewed: 'bg-blue-600',
  accepted: 'bg-green-500',
  payment_pending: 'bg-yellow-500',
  paid: 'bg-green-600',
  scheduled: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  completed: 'bg-green-700',
  cancelled: 'bg-red-500',
  expired: 'bg-gray-400',
};

const UnifiedTimeline: React.FC<UnifiedTimelineProps> = ({ quoteId }) => {
  const [quote, setQuote] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [quoteId]);

  const loadData = async () => {
    try {
      // Charger le devis
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;
      setQuote(quoteData);

      // Charger le rendez-vous associé si existe
      if (quoteData) {
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('*')
          .eq('quote_id', quoteId)
          .maybeSingle();

        setAppointment(appointmentData);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le suivi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const transitionWorkflow = async (newStatus: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
        body: {
          entity_type: 'quote',
          entity_id: quoteId,
          new_status: newStatus
        }
      });

      if (error) throw error;

      toast({
        title: 'Statut mis à jour',
        description: `Le devis est maintenant: ${newStatus}`,
      });

      await loadData();
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive'
      });
    }
  };

  const getWorkflowSteps = (): WorkflowStep[] => {
    const currentStatus = quote?.workflow_status || 'draft';
    
    const steps = [
      {
        id: 'quote',
        status: ['draft', 'sent', 'viewed'].includes(currentStatus) 
          ? 'current' 
          : ['accepted', 'payment_pending', 'paid', 'scheduled', 'in_progress', 'completed'].includes(currentStatus)
          ? 'completed'
          : 'cancelled',
        label: 'Devis',
        icon: <FileText className="h-5 w-5" />,
        date: quote?.created_at,
      },
      {
        id: 'accepted',
        status: currentStatus === 'accepted' 
          ? 'current'
          : ['payment_pending', 'paid', 'scheduled', 'in_progress', 'completed'].includes(currentStatus)
          ? 'completed'
          : currentStatus === 'cancelled'
          ? 'cancelled'
          : 'pending',
        label: 'Accepté',
        icon: <CheckCircle2 className="h-5 w-5" />,
        date: quote?.accepted_at,
        action: currentStatus === 'sent' || currentStatus === 'viewed' 
          ? () => transitionWorkflow('accepted') 
          : undefined,
        actionLabel: 'Accepter le devis'
      },
      {
        id: 'payment',
        status: ['payment_pending', 'paid'].includes(currentStatus)
          ? currentStatus === 'paid' ? 'completed' : 'current'
          : ['scheduled', 'in_progress', 'completed'].includes(currentStatus)
          ? 'completed'
          : currentStatus === 'cancelled'
          ? 'cancelled'
          : 'pending',
        label: 'Paiement',
        icon: <CreditCard className="h-5 w-5" />,
        date: quote?.paid_at,
        action: currentStatus === 'accepted' 
          ? () => transitionWorkflow('payment_pending') 
          : undefined,
        actionLabel: 'Procéder au paiement'
      },
      {
        id: 'appointment',
        status: currentStatus === 'scheduled'
          ? 'current'
          : ['in_progress', 'completed'].includes(currentStatus)
          ? 'completed'
          : currentStatus === 'cancelled'
          ? 'cancelled'
          : 'pending',
        label: 'Rendez-vous',
        icon: <Calendar className="h-5 w-5" />,
        date: appointment?.scheduled_date || quote?.scheduled_at,
      },
      {
        id: 'repair',
        status: currentStatus === 'in_progress'
          ? 'current'
          : currentStatus === 'completed'
          ? 'completed'
          : currentStatus === 'cancelled'
          ? 'cancelled'
          : 'pending',
        label: 'Réparation',
        icon: <Wrench className="h-5 w-5" />,
        date: appointment?.started_at,
      },
      {
        id: 'completed',
        status: currentStatus === 'completed' 
          ? 'completed' 
          : currentStatus === 'cancelled'
          ? 'cancelled'
          : 'pending',
        label: 'Terminé',
        icon: <CheckCircle2 className="h-5 w-5" />,
        date: quote?.completed_at,
      },
    ];

    return steps;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const steps = getWorkflowSteps();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Suivi de la réparation
          <Badge className={STATUS_COLORS[quote?.workflow_status as keyof typeof STATUS_COLORS]}>
            {quote?.workflow_status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Ligne de progression */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Étapes */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Icône */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                  ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${step.status === 'current' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : ''}
                  ${step.status === 'pending' ? 'bg-background border-muted text-muted-foreground' : ''}
                  ${step.status === 'cancelled' ? 'bg-red-500 border-red-500 text-white' : ''}
                `}>
                  {step.status === 'cancelled' ? <XCircle className="h-5 w-5" /> : step.icon}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{step.label}</h3>
                      {step.date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(step.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {step.status === 'current' && !step.date && (
                        <p className="text-sm text-blue-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          En cours
                        </p>
                      )}
                    </div>

                    {step.action && step.actionLabel && (
                      <Button
                        onClick={step.action}
                        size="sm"
                        className="ml-4"
                      >
                        {step.actionLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        {quote?.workflow_status === 'in_progress' && (
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={() => transitionWorkflow('completed')}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marquer comme terminé
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedTimeline;
