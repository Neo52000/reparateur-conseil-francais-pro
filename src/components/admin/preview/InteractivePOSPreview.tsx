import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Banknote, Smartphone, Receipt, Calculator, ShoppingCart, Maximize2 } from 'lucide-react';

interface InteractivePOSPreviewProps {
  settings: Record<string, any>;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const InteractivePOSPreview: React.FC<InteractivePOSPreviewProps> = ({ 
  settings, 
  isFullscreen = false, 
  onToggleFullscreen 
}) => {
  const [cart, setCart] = useState([
    { id: 1, name: 'Réparation écran iPhone 14', price: 89.90, quantity: 1 },
    { id: 2, name: 'Vitre de protection', price: 12.50, quantity: 1 }
  ]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');

  const currency = settings.default_currency || { currency: 'EUR', symbol: '€' };
  const paymentMethods = settings.payment_methods || { cash: true, card: true, mobile: false };
  const receiptTemplate = settings.receipt_template || { header: 'RepairHub POS', footer: 'Merci de votre visite', logo: true };
  const taxRates = settings.tax_rates || [{ name: 'TVA Standard', rate: 20, default: true }];
  const currentTaxRate = taxRates.find(rate => rate.default) || taxRates[0] || { rate: 20 };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * currentTaxRate.rate) / 100;
  const total = subtotal + taxAmount;

  const availableProducts = [
    { name: 'Batterie iPhone', price: 45.90 },
    { name: 'Écran Samsung', price: 125.00 },
    { name: 'Connecteur charge', price: 25.50 },
    { name: 'Haut-parleur', price: 18.90 }
  ];

  const addToCart = (product: { name: string; price: number }) => {
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === product.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        id: Date.now(), 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const processPayment = () => {
    alert(`Paiement de ${total.toFixed(2)}${currency.symbol} traité avec succès via ${selectedPaymentMethod}`);
    setCart([]);
    setPaymentAmount('');
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background overflow-auto p-4" 
    : "space-y-6 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20";

  return (
    <div className={containerClass}>
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Interface POS Interactive</h3>
          <p className="text-sm text-muted-foreground">
            {isFullscreen ? "Mode plein écran - Interface de caisse complète" : "Simulation interactive de l'interface de caisse"}
          </p>
        </div>
        {onToggleFullscreen && (
          <Button variant="outline" onClick={onToggleFullscreen}>
            <Maximize2 className="w-4 h-4 mr-2" />
            {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          </Button>
        )}
      </div>

      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Interface principale de caisse */}
        <Card className={`${isFullscreen ? 'xl:col-span-2' : ''}`}>
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              {receiptTemplate.logo && <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>}
              {receiptTemplate.header}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Zone des produits rapides */}
            <div className="p-4 border-b">
              <h4 className="font-medium mb-3">Produits rapides</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableProducts.map((product, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start"
                    onClick={() => addToCart(product)}
                  >
                    <span className="font-medium text-sm">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.price.toFixed(2)}{currency.symbol}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Panier */}
            <div className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Panier ({cart.length} articles)
              </h4>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Panier vide</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {item.quantity} × {item.price.toFixed(2)}{currency.symbol}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{(item.price * item.quantity).toFixed(2)}{currency.symbol}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totaux */}
              {cart.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span className="font-mono">{subtotal.toFixed(2)}{currency.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{currentTaxRate.name} ({currentTaxRate.rate}%):</span>
                      <span className="font-mono">{taxAmount.toFixed(2)}{currency.symbol}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="font-mono text-primary">{total.toFixed(2)}{currency.symbol}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de paiement et reçu */}
        <div className="space-y-4">
          {/* Méthodes de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Méthode de paiement:</p>
                <div className="grid grid-cols-1 gap-2">
                  {paymentMethods.cash && (
                    <Button
                      variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedPaymentMethod('cash')}
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Espèces
                    </Button>
                  )}
                  {paymentMethods.card && (
                    <Button
                      variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedPaymentMethod('card')}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Carte bancaire
                    </Button>
                  )}
                  {paymentMethods.mobile && (
                    <Button
                      variant={selectedPaymentMethod === 'mobile' ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedPaymentMethod('mobile')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Paiement mobile
                    </Button>
                  )}
                </div>
              </div>

              {selectedPaymentMethod === 'cash' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Montant reçu:</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`${total.toFixed(2)}`}
                  />
                  {paymentAmount && parseFloat(paymentAmount) > total && (
                    <p className="text-sm text-green-600">
                      Rendu: {(parseFloat(paymentAmount) - total).toFixed(2)}{currency.symbol}
                    </p>
                  )}
                </div>
              )}

              <Button 
                className="w-full" 
                disabled={cart.length === 0}
                onClick={processPayment}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Encaisser {total.toFixed(2)}{currency.symbol}
              </Button>
            </CardContent>
          </Card>

          {/* Aperçu du reçu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Aperçu du reçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs space-y-1 bg-white p-4 rounded border max-w-sm mx-auto" style={{ fontFamily: 'monospace' }}>
                {receiptTemplate.logo && (
                  <div className="text-center mb-2">
                    <div className="inline-block w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                )}
                <div className="text-center font-bold text-sm border-b pb-1 mb-2">
                  {receiptTemplate.header}
                </div>
                <div className="text-center text-xs mb-2">
                  {new Date().toLocaleString('fr-FR')}
                </div>
                
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)}{currency.symbol}</span>
                  </div>
                ))}
                
                {cart.length > 0 && (
                  <>
                    <div className="border-t border-b py-1 my-1">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{subtotal.toFixed(2)}{currency.symbol}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>{currentTaxRate.name} {currentTaxRate.rate}%:</span>
                        <span>{taxAmount.toFixed(2)}{currency.symbol}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span>{total.toFixed(2)}{currency.symbol}</span>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="text-center text-xs mt-2 pt-1 border-t">
                  {receiptTemplate.footer}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractivePOSPreview;