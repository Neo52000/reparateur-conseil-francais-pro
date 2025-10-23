import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  DollarSign,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusProps {
  paymentId?: string;
  quoteId?: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-500',
    label: 'En attente',
    description: 'Le paiement est en cours de traitement'
  },
  authorized: {
    icon: CheckCircle2,
    color: 'bg-blue-500',
    label: 'Autorisé',
    description: 'Le paiement est autorisé'
  },
  captured: {
    icon: DollarSign,
    color: 'bg-green-500',
    label: 'Capturé',
    description: 'Les fonds sont retenus en sécurité'
  },
  held: {
    icon: Clock,
    color: 'bg-purple-500',
    label: 'Retenu',
    description: 'En attente de validation du service'
  },
  released: {
    icon: CheckCircle2,
    color: 'bg-green-600',
    label: 'Libéré',
    description: 'Les fonds ont été transférés au réparateur'
  },
  refunded: {
    icon: AlertTriangle,
    color: 'bg-orange-500',
    label: 'Remboursé',
    description: 'Le paiement a été remboursé'
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-500',
    label: 'Échoué',
    description: 'Le paiement a échoué'
  }
};

const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentId, quoteId }) => {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayment();
  }, [paymentId, quoteId]);

  const loadPayment = async () => {
    try {
      let query = supabase.from('payments' as any).select('*');

      if (paymentId) {
        query = query.eq('id', paymentId);
      } else if (quoteId) {
        query = query.eq('quote_id', quoteId);
      } else {
        return;
      }

      const { data, error }: any = await query.maybeSingle();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error loading payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!payment) return;

    try {
      const { error } = await supabase.functions.invoke('release-funds', {
        body: {
          payment_intent_id: payment.stripe_payment_intent_id,
          quote_id: payment.quote_id
        }
      });

      if (error) throw error;

      toast({
        title: 'Fonds libérés',
        description: 'Le paiement a été transféré au réparateur'
      });

      await loadPayment();
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de libérer les fonds',
        variant: 'destructive'
      });
    }
  };

  const handleRequestRefund = async () => {
    if (!payment) return;

    try {
      const { error } = await supabase.functions.invoke('refund-payment', {
        body: {
          payment_intent_id: payment.stripe_payment_intent_id,
          reason: 'requested_by_customer'
        }
      });

      if (error) throw error;

      toast({
        title: 'Remboursement initié',
        description: 'Votre demande de remboursement a été prise en compte'
      });

      await loadPayment();
    } catch (error) {
      console.error('Error requesting refund:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de demander le remboursement',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucun paiement trouvé
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Statut du paiement</span>
          <Badge className={statusConfig?.color}>
            {statusConfig?.label || payment.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Icône et description */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${statusConfig?.color} bg-opacity-20`}>
            <StatusIcon className={`h-6 w-6 text-${statusConfig?.color.replace('bg-', '')}`} />
          </div>
          <div className="flex-1">
            <p className="font-medium">{statusConfig?.description}</p>
            {payment.created_at && (
              <p className="text-sm text-muted-foreground">
                {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Détails du montant */}
        <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Montant total</span>
            <span className="font-semibold">{payment.amount.toFixed(2)}€</span>
          </div>
          {payment.platform_commission && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission</span>
              <span>{payment.platform_commission.toFixed(2)}€</span>
            </div>
          )}
          {payment.repairer_amount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant réparateur</span>
              <span className="text-green-600">{payment.repairer_amount.toFixed(2)}€</span>
            </div>
          )}
        </div>

        {/* Actions disponibles */}
        <div className="space-y-2">
          {payment.status === 'captured' && (
            <Button onClick={handleReleaseFunds} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Libérer les fonds
            </Button>
          )}

          {['captured', 'held'].includes(payment.status) && (
            <Button onClick={handleRequestRefund} variant="outline" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Demander un remboursement
            </Button>
          )}

          {payment.status === 'released' && (
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le reçu
            </Button>
          )}
        </div>

        {/* Informations complémentaires */}
        {payment.failure_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Raison de l'échec:</strong> {payment.failure_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
