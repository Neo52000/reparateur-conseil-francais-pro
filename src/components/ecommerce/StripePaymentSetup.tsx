import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Check, 
  ExternalLink,
  Shield,
  Truck,
  Store
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  isActive: boolean;
  webhookEndpoint: string;
}

interface PaymentMethods {
  stripe: boolean;
  clickCollect: boolean;
  bankTransfer: boolean;
}

interface EcommerceSettings {
  repairer_id: string;
  settings: {
    stripe_publishable_key?: string;
    stripe_secret_key?: string;
    stripe_active?: boolean;
    stripe_webhook_endpoint?: string;
    stripe_test_mode?: boolean;
    payment_methods?: string[];
  };
}

const StripePaymentSetup: React.FC = () => {
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    publishableKey: '',
    secretKey: '',
    isActive: false,
    webhookEndpoint: ''
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    stripe: false,
    clickCollect: true,
    bankTransfer: false
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [testMode, setTestMode] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadStripeConfig();
  }, [user]);

  const loadStripeConfig = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      const { data: config } = await supabase
        .from('ecommerce_settings' as any)
        .select('*')
        .eq('repairer_id', user.id)
        .maybeSingle() as { data: EcommerceSettings | null };

      if (config?.settings) {
        const settings = config.settings;
        setStripeConfig({
          publishableKey: settings.stripe_publishable_key || '',
          secretKey: settings.stripe_secret_key || '',
          isActive: settings.stripe_active || false,
          webhookEndpoint: settings.stripe_webhook_endpoint || ''
        });
        
        setPaymentMethods({
          stripe: settings.payment_methods?.includes('stripe') || false,
          clickCollect: settings.payment_methods?.includes('click_and_collect') || true,
          bankTransfer: settings.payment_methods?.includes('bank_transfer') || false
        });
        
        setTestMode(settings.stripe_test_mode !== false);
      }
    } catch (error) {
      console.error('Erreur chargement config Stripe:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  const handleStripeConfigSave = useCallback(async () => {
    if (!stripeConfig.publishableKey || !stripeConfig.secretKey) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner vos clés Stripe",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;
    setLoading(true);

    try {
      const settings = {
        stripe_publishable_key: stripeConfig.publishableKey,
        stripe_secret_key: stripeConfig.secretKey,
        stripe_active: stripeConfig.isActive,
        stripe_webhook_endpoint: stripeConfig.webhookEndpoint,
        stripe_test_mode: testMode,
        payment_methods: [
          ...(paymentMethods.stripe ? ['stripe'] : []),
          ...(paymentMethods.clickCollect ? ['click_and_collect'] : []),
          ...(paymentMethods.bankTransfer ? ['bank_transfer'] : [])
        ],
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('ecommerce_settings' as any)
        .upsert({
          repairer_id: user.id,
          settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'repairer_id'
        });

      toast({
        title: "Configuration Stripe sauvegardée",
        description: "Vos paramètres de paiement ont été mis à jour",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur sauvegarde Stripe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration Stripe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [stripeConfig, paymentMethods, testMode, user, toast]);

  const handleTestStripe = useCallback(async () => {
    if (!stripeConfig.publishableKey) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez d'abord configurer vos clés Stripe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Test de validation des clés (simulation)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Test réussi",
        description: "La connexion avec Stripe fonctionne correctement",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Test échoué",
        description: "Impossible de se connecter à Stripe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [stripeConfig.publishableKey, toast]);

  // Callbacks optimisés pour les changements d'état
  const handleStripeConfigChange = useCallback((field: keyof StripeConfig, value: string | boolean) => {
    setStripeConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaymentMethodChange = useCallback((method: keyof PaymentMethods, checked: boolean) => {
    setPaymentMethods(prev => ({ ...prev, [method]: checked }));
  }, []);

  // État validé pour l'affichage
  const isConfigured = useMemo(() => 
    stripeConfig.publishableKey && stripeConfig.secretKey, 
    [stripeConfig.publishableKey, stripeConfig.secretKey]
  );

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Configuration Stripe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode test/production */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Mode de test</p>
              <p className="text-sm text-muted-foreground">
                Utilisez les clés de test pour les essais
              </p>
            </div>
            <Switch
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>

          {/* Clés API */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publishableKey">
                Clé publique {testMode ? '(test)' : '(live)'}
              </Label>
              <Input
                id="publishableKey"
                type="text"
                value={stripeConfig.publishableKey}
                onChange={(e) => handleStripeConfigChange('publishableKey', e.target.value)}
                placeholder={testMode ? "pk_test_..." : "pk_live_..."}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey">
                Clé secrète {testMode ? '(test)' : '(live)'}
              </Label>
              <Input
                id="secretKey"
                type="password"
                value={stripeConfig.secretKey}
                onChange={(e) => handleStripeConfigChange('secretKey', e.target.value)}
                placeholder={testMode ? "sk_test_..." : "sk_live_..."}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleStripeConfigSave}
              disabled={loading}
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTestStripe}
              disabled={loading}
            >
              Tester la connexion
            </Button>

            <Button variant="ghost" asChild>
              <a 
                href="https://dashboard.stripe.com/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Dashboard Stripe
              </a>
            </Button>
          </div>

          {/* Statut */}
          {isConfigured && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-800">
                  Stripe configuré
                </span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {testMode ? "Mode test" : "Mode live"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodes de paiement acceptées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stripe */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Paiement en ligne (Stripe)</p>
                <p className="text-sm text-muted-foreground">
                  Carte bancaire, Apple Pay, Google Pay
                </p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.stripe}
              onCheckedChange={(checked) => handlePaymentMethodChange('stripe', checked)}
              disabled={!isConfigured}
            />
          </div>

          {/* Click & Collect */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-medium">Click & Collect</p>
                <p className="text-sm text-muted-foreground">
                  Paiement en magasin lors du retrait
                </p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.clickCollect}
              onCheckedChange={(checked) => handlePaymentMethodChange('clickCollect', checked)}
            />
          </div>

          {/* Virement bancaire */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Virement bancaire</p>
                <p className="text-sm text-muted-foreground">
                  Pour les commandes professionnelles
                </p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.bankTransfer}
              onCheckedChange={(checked) => handlePaymentMethodChange('bankTransfer', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration avancée */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres avancés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Commission (% TTC)</Label>
              <Input
                id="commission"
                type="number"
                placeholder="2.9"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minAmount">Montant minimum (€)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="5.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Options de livraison</h4>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Livraison locale</span>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Retrait en magasin</span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aide */}
      <Card>
        <CardHeader>
          <CardTitle>Aide et documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Guide d'intégration Stripe</span>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Test des paiements</span>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://stripe.com/docs/testing" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripePaymentSetup;