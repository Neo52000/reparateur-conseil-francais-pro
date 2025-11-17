import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lock, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface PaymentDetails {
  amount: number;
  serviceFee: number;
  total: number;
  description: string;
  repairerName: string;
}

interface StripePaymentFormProps {
  paymentDetails: PaymentDetails;
  onPaymentSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  paymentDetails,
  onPaymentSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace('/', '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!cardNumber || !expiry || !cvc || !cardholderName) {
      enhancedToast.error({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulation du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentId = `pay_${Date.now()}`;
      
      enhancedToast.success({
        title: 'Paiement réussi !',
        description: `${paymentDetails.total}€ ont été débités`,
      });

      onPaymentSuccess(mockPaymentId);
    } catch (error) {
      enhancedToast.error({
        title: 'Erreur de paiement',
        description: 'Une erreur est survenue lors du paiement',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-status-success" />
              Paiement sécurisé
            </CardTitle>
            <CardDescription>
              Vos informations sont protégées et chiffrées
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              SSL
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Récapitulatif */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{paymentDetails.description}</p>
              <p className="text-sm text-muted-foreground">{paymentDetails.repairerName}</p>
            </div>
            <Badge variant="secondary">{paymentDetails.amount}€</Badge>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant de la réparation</span>
              <span className="font-medium">{paymentDetails.amount}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de service</span>
              <span className="font-medium">{paymentDetails.serviceFee}€</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">{paymentDetails.total}€</span>
            </div>
          </div>
        </div>

        {/* Informations de paiement retenues */}
        <div className="bg-status-info/10 border border-status-info/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-status-info shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-status-info mb-1">Paiement avec rétention</p>
              <p className="text-muted-foreground">
                Le montant sera retenu et versé au réparateur uniquement après validation de la réparation. 
                Vous avez 48h pour contester en cas de problème.
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nom du titulaire</Label>
            <Input
              id="cardholderName"
              placeholder="Jean Dupont"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Numéro de carte
            </Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={isProcessing}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Date d'expiration</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                value={expiry}
                onChange={handleExpiryChange}
                disabled={isProcessing}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={handleCvcChange}
                disabled={isProcessing}
                type="password"
                maxLength={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Lock className="h-4 w-4" />
                  </motion.div>
                  Traitement...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Payer {paymentDetails.total}€
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Sécurité */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Paiement sécurisé par Stripe • Vos données sont chiffrées</p>
        </div>
      </CardContent>
    </Card>
  );
};
