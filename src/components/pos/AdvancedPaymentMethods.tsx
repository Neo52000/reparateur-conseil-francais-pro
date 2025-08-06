import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Euro, 
  Receipt, 
  Gift,
  Percent,
  Calculator
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shortcut?: string;
}

interface AdvancedPaymentMethodsProps {
  total: number;
  onPayment: (method: string, amount?: number, details?: any) => void;
  onApplyDiscount: (type: 'percentage' | 'amount', value: number) => void;
  loading: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Espèces',
    icon: <Euro className="w-5 h-5" />,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    shortcut: 'F1'
  },
  {
    id: 'card',
    name: 'Carte Bancaire',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-blue-600 hover:bg-blue-700',
    shortcut: 'F2'
  },
  {
    id: 'check',
    name: 'Chèque',
    icon: <Receipt className="w-5 h-5" />,
    color: 'bg-purple-600 hover:bg-purple-700',
    shortcut: 'F3'
  },
  {
    id: 'ticket_restaurant',
    name: 'Ticket Restaurant',
    icon: <Gift className="w-5 h-5" />,
    color: 'bg-orange-600 hover:bg-orange-700',
    shortcut: 'F4'
  }
];

const AdvancedPaymentMethods: React.FC<AdvancedPaymentMethodsProps> = ({
  total,
  onPayment,
  onApplyDiscount,
  loading
}) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');

  const handleDiscount = () => {
    const value = parseFloat(discountValue);
    if (value > 0) {
      onApplyDiscount(discountType, value);
      setDiscountValue('');
    }
  };

  const handlePayment = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    switch (methodId) {
      case 'check':
        const checkValue = parseFloat(checkAmount) || total;
        onPayment(methodId, checkValue, { checkAmount: checkValue });
        setCheckAmount('');
        break;
      case 'ticket_restaurant':
        const ticketValue = parseFloat(ticketAmount) || total;
        onPayment(methodId, ticketValue, { ticketAmount: ticketValue });
        setTicketAmount('');
        break;
      default:
        onPayment(methodId, total);
    }
  };

  return (
    <div className="space-y-6">
      {/* Remises et promotions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="w-5 h-5" />
            Remises & Promotions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={discountType === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDiscountType('percentage')}
            >
              %
            </Button>
            <Button
              variant={discountType === 'amount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDiscountType('amount')}
            >
              €
            </Button>
            <Input
              type="number"
              placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 5.00'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleDiscount} disabled={!discountValue}>
              <Calculator className="w-4 h-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modes de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Paiements simples */}
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.slice(0, 2).map((method) => (
              <Button
                key={method.id}
                onClick={() => handlePayment(method.id)}
                disabled={loading}
                className={`${method.color} text-white font-bold py-4 text-lg`}
                size="lg"
              >
                {method.icon}
                <div className="ml-2 text-left">
                  <div>{method.name}</div>
                  {method.shortcut && (
                    <div className="text-xs opacity-80">({method.shortcut})</div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Paiements avec montant personnalisé */}
          <div className="space-y-3">
            {/* Chèque */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex gap-2">
                <Input
                  type="number"
                  placeholder={`Montant chèque (${total.toFixed(2)}€)`}
                  value={checkAmount}
                  onChange={(e) => setCheckAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handlePayment('check')}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Chèque (F3)
                </Button>
              </div>
            </div>

            {/* Ticket Restaurant */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex gap-2">
                <Input
                  type="number"
                  placeholder={`Montant TR (${total.toFixed(2)}€)`}
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handlePayment('ticket_restaurant')}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Ticket Rest. (F4)
                </Button>
              </div>
            </div>
          </div>

          {/* Paiement mixte */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Paiement mixte :</strong> Utilisez plusieurs modes de paiement pour le même achat
            </p>
            <Badge variant="secondary" className="text-xs">
              Fonctionnalité disponible prochainement
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPaymentMethods;