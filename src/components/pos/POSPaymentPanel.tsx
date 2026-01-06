import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Receipt, 
  CheckCircle,
  Loader2,
  Euro,
  ArrowLeft,
  Printer
} from 'lucide-react';
import ReceiptGenerator from './ReceiptGenerator';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface POSPaymentPanelProps {
  cartItems: CartItem[];
  subtotal: number;
  tva: number;
  total: number;
  onPaymentComplete: (paymentMethod: string, transactionId: string) => void;
  onCancel: () => void;
  repairerId: string;
  sessionNumber: string;
  cashierName: string;
}

type PaymentMethod = 'cash' | 'card' | 'card_terminal' | 'apple_pay' | 'google_pay';

const POSPaymentPanel: React.FC<POSPaymentPanelProps> = ({
  cartItems,
  subtotal,
  tva,
  total,
  onPaymentComplete,
  onCancel,
  repairerId,
  sessionNumber,
  cashierName
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  
  const { toast } = useToast();

  const paymentMethods = [
    { id: 'cash' as const, label: 'Espèces', icon: Banknote, color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'card_terminal' as const, label: 'Terminal CB', icon: CreditCard, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'apple_pay' as const, label: 'Apple Pay', icon: Smartphone, color: 'bg-gray-100 text-gray-700 border-gray-200' },
    { id: 'google_pay' as const, label: 'Google Pay', icon: Smartphone, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  ];

  const generateTransactionId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRX-${dateStr}-${timeStr}-${random}`;
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setProcessing(true);
    
    try {
      // Simuler le traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const txId = generateTransactionId();
      setTransactionId(txId);
      setPaymentComplete(true);
      setShowReceipt(true);
      
      toast({
        title: "Paiement accepté",
        description: `Transaction ${txId} validée`
      });
      
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Le paiement a échoué, veuillez réessayer",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;

  const quickCashAmounts = [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    50,
    100
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  const receiptData = {
    transactionNumber: transactionId,
    date: new Date().toLocaleDateString('fr-FR'),
    time: new Date().toLocaleTimeString('fr-FR'),
    cashier: cashierName,
    items: cartItems.map(item => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      category: item.category
    })),
    subtotal,
    tva,
    total,
    paymentMethod: selectedMethod || 'cash',
    sessionNumber
  };

  if (showReceipt) {
    return (
      <Dialog open={showReceipt} onOpenChange={() => {
        setShowReceipt(false);
        onPaymentComplete(selectedMethod || 'cash', transactionId);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Paiement validé
            </DialogTitle>
          </DialogHeader>
          <ReceiptGenerator
            receiptData={receiptData}
            onPrint={() => console.log('Print receipt')}
            onDownloadPDF={() => console.log('Download PDF')}
            transactionId={transactionId}
            repairerId={repairerId}
            autoArchive={true}
          />
          <div className="flex justify-end mt-4">
            <Button onClick={() => {
              setShowReceipt(false);
              onPaymentComplete(selectedMethod || 'cash', transactionId);
            }}>
              Terminer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Euro className="w-4 h-4 mr-2" />
          Total: {total.toFixed(2)}€
        </Badge>
      </div>

      {/* Récapitulatif */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>{item.total.toFixed(2)}€</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total HT</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA (20%)</span>
              <span>{tva.toFixed(2)}€</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total TTC</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mode de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <Button
                key={method.id}
                variant="outline"
                className={`h-20 flex-col gap-2 ${
                  selectedMethod === method.id 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : ''
                } ${method.color}`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <method.icon className="w-6 h-6" />
                <span className="font-medium">{method.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paiement espèces */}
      {selectedMethod === 'cash' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paiement en espèces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Montant reçu</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl h-14"
                />
                <span className="flex items-center text-2xl">€</span>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {quickCashAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setCashReceived(amount.toString())}
                >
                  {amount}€
                </Button>
              ))}
            </div>
            
            {cashAmount >= total && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Monnaie à rendre</span>
                  <span className="text-2xl font-bold text-green-700">{change.toFixed(2)}€</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Paiement carte */}
      {(selectedMethod === 'card_terminal' || selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') && (
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium mb-2">
              {selectedMethod === 'card_terminal' && 'Terminal de paiement'}
              {selectedMethod === 'apple_pay' && 'Apple Pay'}
              {selectedMethod === 'google_pay' && 'Google Pay'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedMethod === 'card_terminal' && 'Présentez votre carte sur le terminal'}
              {(selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') && 'Approchez votre téléphone'}
            </p>
            {processing && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Traitement en cours...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bouton de validation */}
      <Button
        className="w-full h-14 text-lg"
        disabled={
          !selectedMethod || 
          processing || 
          (selectedMethod === 'cash' && cashAmount < total)
        }
        onClick={handlePayment}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Valider le paiement - {total.toFixed(2)}€
          </>
        )}
      </Button>
    </div>
  );
};

export default POSPaymentPanel;
