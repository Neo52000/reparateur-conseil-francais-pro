import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Truck, Star, Package, Palette, Search, Heart, User, Maximize2, Plus, Minus } from 'lucide-react';

interface InteractiveEcommercePreviewProps {
  settings: Record<string, any>;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const InteractiveEcommercePreview: React.FC<InteractiveEcommercePreviewProps> = ({ 
  settings, 
  isFullscreen = false, 
  onToggleFullscreen 
}) => {
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'cart' | 'checkout'>('home');
  const [cart, setCart] = useState<Array<{id: number, name: string, price: number, quantity: number, image?: string}>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const storeTemplate = settings.store_template || { theme: 'modern', colors: { primary: '#3b82f6', secondary: '#64748b' } };
  const shipping = settings.default_shipping || { free_threshold: 50, standard_rate: 5.99 };
  const paymentGateways = settings.payment_gateways || { stripe: true, paypal: false };
  const taxSettings = settings.tax_settings || { include_tax: true, display_tax: true };

  const products = [
    { id: 1, name: 'Kit de réparation iPhone 14', price: 89.90, category: 'Kits', rating: 4.8, reviews: 24, inStock: true },
    { id: 2, name: 'Écran complet Samsung S23', price: 125.00, category: 'Écrans', rating: 4.6, reviews: 18, inStock: true },
    { id: 3, name: 'Batterie iPhone 13', price: 45.90, category: 'Batteries', rating: 4.9, reviews: 32, inStock: false },
    { id: 4, name: 'Vitre de protection', price: 12.50, category: 'Protection', rating: 4.7, reviews: 15, inStock: true },
    { id: 5, name: 'Kit outils précision', price: 29.90, category: 'Outils', rating: 4.5, reviews: 41, inStock: true },
    { id: 6, name: 'Connecteur Lightning', price: 18.90, category: 'Connecteurs', rating: 4.4, reviews: 12, inStock: true }
  ];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= shipping.free_threshold ? 0 : shipping.standard_rate;
  const taxAmount = taxSettings.include_tax ? (subtotal * 0.2) : 0;
  const total = subtotal + shippingCost + (taxSettings.include_tax ? 0 : taxAmount);

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background overflow-auto" 
    : "space-y-6 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20";

  const renderNavigation = () => (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold" style={{ color: storeTemplate.colors?.primary || '#3b82f6' }}>
              Ma Boutique Réparation
            </h1>
            <nav className="hidden md:flex gap-4">
              <Button variant="ghost" onClick={() => setCurrentPage('home')}>Accueil</Button>
              <Button variant="ghost">Catalogue</Button>
              <Button variant="ghost">Support</Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 w-64" placeholder="Rechercher un produit..." />
            </div>
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setCurrentPage('cart')}
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomePage = () => (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div 
        className="relative rounded-lg h-64 flex items-center px-8 text-white"
        style={{ backgroundColor: storeTemplate.colors?.primary || '#3b82f6' }}
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Réparations de qualité</h2>
          <p className="text-lg opacity-90 mb-4">Tous les outils et pièces pour vos réparations</p>
          <Button variant="secondary">Découvrir nos produits</Button>
        </div>
      </div>

      {/* Catégories */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {['Kits', 'Écrans', 'Batteries', 'Protection', 'Outils', 'Connecteurs'].map((category) => (
          <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Produits populaires */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Produits populaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded flex items-center justify-center mb-3">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h4 className="font-medium mb-2">{product.name}</h4>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">{product.price.toFixed(2)}€</span>
                    {taxSettings.display_tax && taxSettings.include_tax && (
                      <span className="text-xs text-muted-foreground ml-1">TTC</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    onClick={() => addToCart(product)}
                    style={{ backgroundColor: storeTemplate.colors?.secondary || '#64748b' }}
                    className="text-white"
                  >
                    {product.inStock ? 'Ajouter' : 'Rupture'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartPage = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Mon panier ({cart.length} articles)</h2>
      
      {cart.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">Votre panier est vide</p>
            <Button onClick={() => setCurrentPage('home')}>Continuer les achats</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.price.toFixed(2)}€ l'unité</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison:</span>
                  <span>{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)}€`}</span>
                </div>
                {!taxSettings.include_tax && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{taxAmount.toFixed(2)}€</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                {subtotal < shipping.free_threshold && (
                  <p className="text-sm text-muted-foreground">
                    Ajoutez {(shipping.free_threshold - subtotal).toFixed(2)}€ pour la livraison gratuite
                  </p>
                )}
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: storeTemplate.colors?.primary }}
                  onClick={() => setCurrentPage('checkout')}
                >
                  Finaliser la commande
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckoutPage = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Finaliser votre commande</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Prénom" />
                <Input placeholder="Nom" />
              </div>
              <Input placeholder="Adresse" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Code postal" />
                <Input placeholder="Ville" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {paymentGateways.stripe && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Stripe
                  </Badge>
                )}
                {paymentGateways.paypal && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    PayPal
                  </Badge>
                )}
              </div>
              <Input placeholder="Numéro de carte" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="MM/AA" />
                <Input placeholder="CVC" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Votre commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison:</span>
                <span>{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)}€`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <Button className="w-full" style={{ backgroundColor: storeTemplate.colors?.primary }}>
                Passer la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className={containerClass}>
      {/* Header avec contrôles */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Boutique E-commerce Interactive</h3>
            <p className="text-sm text-muted-foreground">Simulation complète de boutique en ligne</p>
          </div>
          {onToggleFullscreen && (
            <Button variant="outline" onClick={onToggleFullscreen}>
              <Maximize2 className="w-4 h-4 mr-2" />
              Plein écran
            </Button>
          )}
        </div>
      )}

      {/* Interface de la boutique */}
      <div className="bg-gray-50 min-h-screen">
        {renderNavigation()}
        
        <div className="px-6 py-8">
          {isFullscreen && onToggleFullscreen && (
            <Button 
              variant="outline" 
              className="fixed top-4 right-4 z-50"
              onClick={onToggleFullscreen}
            >
              Quitter le plein écran
            </Button>
          )}
          
          {currentPage === 'home' && renderHomePage()}
          {currentPage === 'cart' && renderCartPage()}
          {currentPage === 'checkout' && renderCheckoutPage()}
        </div>
      </div>

      {/* Informations sur la configuration (uniquement en mode normal) */}
      {!isFullscreen && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration appliquée</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Thème</p>
              <p className="text-muted-foreground capitalize">{storeTemplate.theme}</p>
            </div>
            <div>
              <p className="font-medium">Livraison gratuite</p>
              <p className="text-muted-foreground">Dès {shipping.free_threshold}€</p>
            </div>
            <div>
              <p className="font-medium">Gateways</p>
              <p className="text-muted-foreground">
                {Object.entries(paymentGateways).filter(([_, enabled]) => enabled).length} actifs
              </p>
            </div>
            <div>
              <p className="font-medium">TVA</p>
              <p className="text-muted-foreground">
                {taxSettings.include_tax ? "Incluse" : "Séparée"}
              </p>
            </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveEcommercePreview;