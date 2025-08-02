import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  Banknote
} from 'lucide-react';
import { usePOSData } from '@/hooks/usePOSData';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
}

interface POSSalesInterfaceProps {
  onTransaction?: (items: CartItem[], total: number) => void;
}

const POSSalesInterface: React.FC<POSSalesInterfaceProps> = ({ onTransaction }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannedCode, setScannedCode] = useState('');
  const [user, setUser] = React.useState<any>(null);
  const { createTransaction } = usePOSData();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Use real inventory items instead of mock data
  const quickProducts = [
    { id: '1', name: 'Écran iPhone 13', price: 149.90, sku: 'SCR-IP13-001' },
    { id: '2', name: 'Batterie Samsung S21', price: 89.90, sku: 'BAT-SS21-001' },
    { id: '3', name: 'Vitre Protection', price: 25.00, sku: 'VIT-PROT-001' },
    { id: '4', name: 'Diagnostic', price: 35.00, sku: 'DIAG-STAN-001' },
    { id: '5', name: 'Nettoyage', price: 15.00, sku: 'NET-STAN-001' },
    { id: '6', name: 'Film Hydrogel', price: 20.00, sku: 'FILM-HYD-001' }
  ];

  const addToCart = (product: { id: string; name: string; price: number; sku: string }) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleScan = () => {
    // Simulate scanning - find product by SKU
    const product = quickProducts.find(p => p.sku === scannedCode);
    if (product) {
      addToCart(product);
      setScannedCode('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length > 0 && user) {
      try {
        await createTransaction({
          repairer_id: user.id,
          total_amount: getTotalAmount() * 1.2, // Including tax
          tax_amount: getTotalAmount() * 0.2,
          payment_method: 'card', // Will be set by payment interface
          payment_status: 'pending',
          items: cart
        });
        
        onTransaction?.(cart, getTotalAmount());
        setCart([]);
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Panneau de sélection produits */}
      <div className="lg:col-span-2 space-y-6">
        {/* Scanner/Recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scanner ou Rechercher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Scanner code-barres ou SKU..."
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                className="flex-1"
              />
              <Button onClick={handleScan} variant="outline">
                <Scan className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Produits rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Réparations Courantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickProducts.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-20 flex flex-col justify-center hover:bg-accent"
                  onClick={() => addToCart(product)}
                >
                  <span className="font-medium text-sm">{product.name}</span>
                  <span className="text-lg font-bold text-primary">{product.price}€</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panier et paiement */}
      <div className="space-y-4">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Panier vide
              </div>
            ) : (
              <>
                {/* Articles du panier */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.sku}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{(item.price * item.quantity).toFixed(2)}€</div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sous-total</span>
                    <span className="font-bold">{getTotalAmount().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>TVA (20%)</span>
                    <span>{(getTotalAmount() * 0.2).toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">{(getTotalAmount() * 1.2).toFixed(2)}€</span>
                  </div>
                </div>

                {/* Actions paiement */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payer par Carte
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Payer en Espèces
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSSalesInterface;