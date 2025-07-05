import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CreditCard, Truck, Star, Package, Palette } from 'lucide-react';

interface EcommercePreviewProps {
  settings: Record<string, any>;
}

const EcommercePreview: React.FC<EcommercePreviewProps> = ({ settings }) => {
  const storeTemplate = settings.store_template || { theme: 'modern', colors: { primary: '#3b82f6', secondary: '#64748b' } };
  const shipping = settings.default_shipping || { free_threshold: 50, standard_rate: 5.99 };
  const paymentGateways = settings.payment_gateways || { stripe: true, paypal: false };
  const taxSettings = settings.tax_settings || { include_tax: true, display_tax: true };
  const moderation = settings.product_moderation || { auto_approve: false, require_images: true };

  const themeStyles = {
    modern: 'rounded-lg shadow-lg',
    classic: 'rounded-none border-2',
    minimal: 'rounded-sm shadow-sm'
  };

  return (
    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Aperçu Boutique E-commerce</h3>
        <p className="text-sm text-muted-foreground">Simulation de la boutique en ligne avec les paramètres appliqués</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interface Boutique */}
        <Card className={`w-full ${themeStyles[storeTemplate.theme as keyof typeof themeStyles]}`}>
          <CardHeader 
            className="text-white"
            style={{ backgroundColor: storeTemplate.colors?.primary || '#3b82f6' }}
          >
            <CardTitle className="flex items-center justify-between">
              <span>Ma Boutique de Réparation</span>
              <ShoppingCart className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Produit d'exemple */}
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-lg p-3 space-y-2">
                <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium">Kit de réparation iPhone 14</h4>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(24 avis)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {taxSettings.display_tax ? (
                      <div className="text-sm">
                        <span className="font-bold">89.90€</span>
                        {taxSettings.include_tax && <span className="text-xs text-muted-foreground"> TTC</span>}
                      </div>
                    ) : (
                      <span className="font-bold">89.90€</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: storeTemplate.colors?.secondary || '#64748b' }}
                    className="text-white"
                  >
                    Ajouter au panier
                  </Button>
                </div>
              </div>
            </div>

            {/* Livraison */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4" />
                <span>Livraison gratuite dès {shipping.free_threshold}€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sinon {shipping.standard_rate}€ de frais de port
              </p>
            </div>

            {/* Méthodes de paiement */}
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Paiement sécurisé:</p>
              <div className="flex gap-2">
                {paymentGateways.stripe && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Stripe
                  </Badge>
                )}
                {paymentGateways.paypal && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    PayPal
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration du thème */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Configuration du thème
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Couleurs */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Couleurs du thème:</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: storeTemplate.colors?.primary || '#3b82f6' }}
                    ></div>
                    <span className="text-xs">Primaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: storeTemplate.colors?.secondary || '#64748b' }}
                    ></div>
                    <span className="text-xs">Secondaire</span>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div>
                <p className="text-sm font-medium mb-2">Style du thème:</p>
                <Badge variant="secondary" className="capitalize">
                  {storeTemplate.theme}
                </Badge>
              </div>
            </div>

            {/* Règles de modération */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Règles de modération:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Approbation automatique:</span>
                  <Badge variant={moderation.auto_approve ? "default" : "secondary"}>
                    {moderation.auto_approve ? "Activée" : "Désactivée"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Images obligatoires:</span>
                  <Badge variant={moderation.require_images ? "default" : "secondary"}>
                    {moderation.require_images ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration résumée */}
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
    </div>
  );
};

export default EcommercePreview;