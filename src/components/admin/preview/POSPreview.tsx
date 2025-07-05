import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Banknote, Smartphone, Receipt, Users } from 'lucide-react';

interface POSPreviewProps {
  settings: Record<string, any>;
}

const POSPreview: React.FC<POSPreviewProps> = ({ settings }) => {
  const currency = settings.default_currency || { currency: 'EUR', symbol: '€' };
  const paymentMethods = settings.payment_methods || { cash: true, card: true, mobile: false };
  const receiptTemplate = settings.receipt_template || { header: 'RepairHub POS', footer: 'Merci de votre visite', logo: true };
  const taxRate = settings.tax_rate || { rate: 20, type: 'percentage' };

  return (
    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Aperçu Interface POS</h3>
        <p className="text-sm text-muted-foreground">Simulation de l'interface caisse avec les paramètres appliqués</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interface POS */}
        <Card className="w-full">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              {receiptTemplate.logo && <div className="w-6 h-6 bg-white rounded-full" />}
              {receiptTemplate.header}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Produit d'exemple */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Réparation écran iPhone</span>
                <span className="font-mono">89.90{currency.symbol}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Vitre de protection</span>
                <span className="font-mono">12.50{currency.symbol}</span>
              </div>
            </div>

            {/* Total avec TVA */}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-mono">102.40{currency.symbol}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>TVA ({taxRate.rate}%):</span>
                <span className="font-mono">20.48{currency.symbol}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-1">
                <span>Total:</span>
                <span className="font-mono">122.88{currency.symbol}</span>
              </div>
            </div>

            {/* Méthodes de paiement */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Méthodes de paiement disponibles:</p>
              <div className="flex gap-2 flex-wrap">
                {paymentMethods.cash && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    Espèces
                  </Badge>
                )}
                {paymentMethods.card && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Carte
                  </Badge>
                )}
                {paymentMethods.mobile && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </Badge>
                )}
              </div>
            </div>

            <Button className="w-full">
              Encaisser - 122.88{currency.symbol}
            </Button>
          </CardContent>
        </Card>

        {/* Aperçu du reçu */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Aperçu du reçu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Réparation écran iPhone</span>
                  <span>89.90{currency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vitre de protection</span>
                  <span>12.50{currency.symbol}</span>
                </div>
              </div>
              
              <div className="border-t border-b py-1 my-1">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>102.40{currency.symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>TVA {taxRate.rate}%:</span>
                  <span>20.48{currency.symbol}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>122.88{currency.symbol}</span>
                </div>
              </div>
              
              <div className="text-center text-xs mt-2 pt-1 border-t">
                {receiptTemplate.footer}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration résumée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configuration appliquée
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Devise</p>
            <p className="text-muted-foreground">{currency.currency} ({currency.symbol})</p>
          </div>
          <div>
            <p className="font-medium">TVA</p>
            <p className="text-muted-foreground">{taxRate.rate}%</p>
          </div>
          <div>
            <p className="font-medium">Paiements</p>
            <p className="text-muted-foreground">
              {Object.entries(paymentMethods).filter(([_, enabled]) => enabled).length} méthodes
            </p>
          </div>
          <div>
            <p className="font-medium">Sync</p>
            <p className="text-muted-foreground">{settings.sync_frequency?.minutes || 15} min</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSPreview;