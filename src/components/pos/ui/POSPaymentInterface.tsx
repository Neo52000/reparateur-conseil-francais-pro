import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  Calculator,
  Receipt,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'cash' | 'card' | 'mobile' | 'voucher';
  enabled: boolean;
  processing?: boolean;
}

interface POSPaymentInterfaceProps {
  cartItems: CartItem[];
  totalAmount: number;
  onPaymentComplete: (paymentData: any) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const POSPaymentInterface: React.FC<POSPaymentInterfaceProps> = ({
  cartItems,
  totalAmount,
  onPaymentComplete,
  onCancel,
  isOpen
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Array<{id: string, method: string, amount: number}>>([]);
  const [remainingAmount, setRemainingAmount] = useState(totalAmount);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Espèces',
      icon: <Banknote className="w-6 h-6" />,
      type: 'cash',
      enabled: true
    },
    {
      id: 'card',
      name: 'Carte Bancaire',
      icon: <CreditCard className="w-6 h-6" />,
      type: 'card',
      enabled: true
    },
    {
      id: 'contactless',
      name: 'Sans Contact',
      icon: <Smartphone className="w-6 h-6" />,
      type: 'mobile',
      enabled: true
    },
    {
      id: 'voucher',
      name: 'Bon d\'achat',
      icon: <Gift className="w-6 h-6" />,
      type: 'voucher',
      enabled: false
    }
  ];

  const quickCashAmounts = [10, 20, 50, 100, 200];

  useEffect(() => {
    if (isOpen) {
      setSelectedPaymentMethod(null);
      setCashReceived('');
      setIsProcessing(false);
      setSplitPayments([]);
      setRemainingAmount(totalAmount);
    }
  }, [isOpen, totalAmount]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    if (methodId !== 'cash') {
      setCashReceived('');
    }
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);

    try {
      // Process payment via Supabase function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          method: selectedPaymentMethod,
          amount: totalAmount,
          cashReceived: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : totalAmount,
          items: cartItems
        }
      });

      if (error) throw error;

      const paymentData = {
        method: selectedPaymentMethod,
        amount: totalAmount,
        cashReceived: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : totalAmount,
        change: selectedPaymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived) - totalAmount) : 0,
        timestamp: new Date(),
        items: cartItems,
        transactionId: `TXN_${Date.now()}`
      };

      onPaymentComplete(paymentData);
      toast.success('Paiement traité avec succès');
    } catch (error) {
      toast.error('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcessPayment = () => {
    if (!selectedPaymentMethod) return false;
    if (selectedPaymentMethod === 'cash') {
      return parseFloat(cashReceived) >= totalAmount;
    }
    return true;
  };

  const getChange = () => {
    if (selectedPaymentMethod === 'cash' && cashReceived) {
      return Math.max(0, parseFloat(cashReceived) - totalAmount);
    }
    return 0;
  };

  const renderPaymentMethods = () => (
    <div className="grid grid-cols-2 gap-3">
      {paymentMethods.map((method) => (
        <Button
          key={method.id}
          variant={selectedPaymentMethod === method.id ? "default" : "outline"}
          disabled={!method.enabled}
          onClick={() => handlePaymentMethodSelect(method.id)}
          className={`h-20 flex flex-col items-center justify-center space-y-2 ${
            selectedPaymentMethod === method.id 
              ? 'bg-admin-blue text-white' 
              : 'hover:bg-admin-blue/10'
          }`}
        >
          {method.icon}
          <span className="text-sm">{method.name}</span>
        </Button>
      ))}
    </div>
  );

  const renderCashPayment = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Montant reçu (€)</Label>
        <Input
          type="number"
          step="0.01"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          placeholder="0.00"
          className="text-xl text-center font-bold"
        />
      </div>

      {/* Montants rapides */}
      <div className="space-y-2">
        <Label>Montants rapides</Label>
        <div className="grid grid-cols-5 gap-2">
          {quickCashAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleQuickCash(amount)}
              className="h-12"
            >
              {amount}€
            </Button>
          ))}
        </div>
      </div>

      {/* Calcul du rendu */}
      {cashReceived && parseFloat(cashReceived) >= totalAmount && (
        <div className="p-4 bg-admin-green/10 border border-admin-green/20 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Rendu de monnaie:</span>
            <span className="text-2xl font-bold text-admin-green">
              {getChange().toFixed(2)}€
            </span>
          </div>
        </div>
      )}

      {cashReceived && parseFloat(cashReceived) < totalAmount && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>Montant insuffisant</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCardPayment = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <CreditCard className="w-16 h-16 mx-auto text-admin-blue mb-4" />
        <h3 className="font-medium mb-2">Paiement par carte</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Présentez la carte au terminal de paiement
        </p>
        <div className="flex items-center justify-center gap-2 text-admin-blue">
          <Clock className="w-4 h-4 animate-spin" />
          <span>En attente du terminal...</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Encaissement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de la commande */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total à encaisser:</span>
                <span className="text-admin-green">{totalAmount.toFixed(2)}€</span>
              </div>
            </CardContent>
          </Card>

          {/* Sélection du mode de paiement */}
          <div className="space-y-4">
            <h3 className="font-medium">Mode de paiement</h3>
            {renderPaymentMethods()}
          </div>

          {/* Interface spécifique au mode de paiement */}
          {selectedPaymentMethod === 'cash' && renderCashPayment()}
          {(selectedPaymentMethod === 'card' || selectedPaymentMethod === 'contactless') && renderCardPayment()}

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <Button
              onClick={processPayment}
              disabled={!canProcessPayment() || isProcessing}
              className="bg-admin-green hover:bg-admin-green/90 min-w-[150px]"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Encaisser {totalAmount.toFixed(2)}€
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSPaymentInterface;