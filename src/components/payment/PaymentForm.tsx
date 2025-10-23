import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  quoteId: string;
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  quoteId,
  amount,
  onSuccess,
  onCancel
}) => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Commission 3%
  const commission = amount * 0.03;
  const repairerAmount = amount - commission;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Créer le payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            quoteId,
            amount,
            holdFunds: true,
            description: `Réparation - Devis #${quoteId.substring(0, 8)}`
          }
        }
      );

      if (paymentError) throw paymentError;

      console.log('Payment intent created:', paymentData);

      // Ici, vous intégreriez Stripe Elements pour la vraie collecte de paiement
      // Pour la démo, on simule un paiement réussi

      toast({
        title: 'Paiement initié',
        description: 'Le paiement est en cours de traitement...'
      });

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mettre à jour le devis
      await supabase
        .from('quotes_with_timeline' as any)
        .update({
          workflow_status: 'paid',
          paid_at: new Date().toISOString()
        } as any)
        .eq('id', quoteId);

      toast({
        title: 'Paiement réussi',
        description: 'Votre paiement a été effectué avec succès'
      });

      onSuccess?.(paymentData.id);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Le paiement a échoué',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé du paiement */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant de la réparation</span>
            <span className="font-semibold">{amount.toFixed(2)}€</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Commission plateforme (3%)</span>
            <span className="text-muted-foreground">-{commission.toFixed(2)}€</span>
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Montant réparateur</span>
            <span className="text-green-600 font-medium">{repairerAmount.toFixed(2)}€</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total à payer</span>
            <span className="font-bold text-primary">{amount.toFixed(2)}€</span>
          </div>
        </div>

        {/* Information sur la rétention */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Paiement sécurisé</p>
              <p className="text-sm text-blue-700">
                Les fonds seront retenus jusqu'à la fin de la réparation. 
                Vous aurez 14 jours pour confirmer ou signaler un problème.
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder pour Stripe Elements */}
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center space-y-2">
          <CreditCard className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Formulaire de carte bancaire Stripe Elements
          </p>
          <p className="text-xs text-muted-foreground">
            (À intégrer avec @stripe/react-stripe-js)
          </p>
        </div>

        {/* Information sécurité */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Paiement 100% sécurisé via Stripe - Vos données sont cryptées</span>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Annuler
            </Button>
          )}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Payer {amount.toFixed(2)}€
              </>
            )}
          </Button>
        </div>

        {/* Avertissement */}
        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            En cliquant sur "Payer", vous acceptez nos conditions générales de vente 
            et autorisez le prélèvement de {amount.toFixed(2)}€.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
