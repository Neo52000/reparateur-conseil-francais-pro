import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Euro, Clock, Smartphone } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface CustomerDisplayProps {
  currentCart: CartItem[];
  totalAmount: number;
  taxAmount: number;
  storeInfo?: {
    name: string;
    address: string;
    phone: string;
  };
  welcomeMessage?: string;
  currentTime?: Date;
}

/**
 * Afficheur client POS - Écran secondaire pour les clients
 * Affiche le panier en cours, les totaux et les informations du magasin
 */
const CustomerDisplay: React.FC<CustomerDisplayProps> = ({
  currentCart = [],
  totalAmount = 0,
  taxAmount = 0,
  storeInfo = {
    name: "RepairHub POS",
    address: "123 Rue de la Réparation",
    phone: "01 23 45 67 89"
  },
  welcomeMessage = "Bienvenue chez RepairHub",
  currentTime = new Date()
}) => {
  const [displayTime, setDisplayTime] = useState(currentTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const subtotal = totalAmount - taxAmount;
  const hasItems = currentCart.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">{storeInfo.name}</h1>
              <p className="text-lg text-muted-foreground">{welcomeMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-2xl font-mono">
              <Clock className="h-6 w-6" />
              <span>{displayTime.toLocaleTimeString('fr-FR')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {displayTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Contenu principal */}
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panier */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Votre commande</h2>
                  <Badge variant="secondary">{currentCart.length} article{currentCart.length > 1 ? 's' : ''}</Badge>
                </div>
                
                <div className="space-y-4">
                  {currentCart.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{item.name}</h3>
                        {item.category && (
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">Qté: {item.quantity}</span>
                          <span className="text-xl font-semibold">{item.price.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Totaux */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Euro className="h-5 w-5" />
                  <span>Total</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Sous-total :</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between text-lg">
                    <span>TVA :</span>
                    <span>{taxAmount.toFixed(2)} €</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-2xl font-bold text-primary">
                    <span>Total :</span>
                    <span>{totalAmount.toFixed(2)} €</span>
                  </div>
                </div>
              </Card>

              {/* Informations magasin */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Informations</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Adresse :</strong> {storeInfo.address}</p>
                  <p><strong>Téléphone :</strong> {storeInfo.phone}</p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          // État vide
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="h-32 w-32 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-3xl font-semibold mb-4">Panier vide</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Les articles de votre commande apparaîtront ici
              </p>
              
              <Card className="p-6 bg-muted/20">
                <h3 className="font-semibold mb-3">Nos services</h3>
                <ul className="text-left space-y-2">
                  <li>• Réparation smartphone et tablette</li>
                  <li>• Diagnostic gratuit</li>
                  <li>• Garantie sur nos réparations</li>
                  <li>• Pièces d'origine</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Merci de votre confiance • RepairHub POS System
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDisplay;