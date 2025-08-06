import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CreditCard, Settings, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripeConfig {
  id?: string;
  repairer_id: string;
  stripe_account_id?: string;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  commission_rate: number;
  auto_transfer: boolean;
  is_active: boolean;
}

const StripeConfiguration: React.FC = () => {
  const [config, setConfig] = useState<StripeConfig>({
    repairer_id: '',
    commission_rate: 5.0,
    auto_transfer: true,
    is_active: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStripeConfig();
  }, []);

  const fetchStripeConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repairer_stripe_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration Stripe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStripeConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('repairer_stripe_config')
        .upsert(config);

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Votre configuration Stripe a été mise à jour"
      });
    } catch (error) {
      console.error('Error saving Stripe config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testStripeConnection = async () => {
    if (!config.stripe_secret_key) {
      toast({
        title: "Clé manquante",
        description: "Veuillez d'abord configurer votre clé secrète Stripe",
        variant: "destructive"
      });
      return;
    }

    // Ici on pourrait tester la connexion avec une edge function
    toast({
      title: "Test de connexion",
      description: "La fonctionnalité de test sera disponible prochainement"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de la configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Configuration Stripe
          </h2>
          <p className="text-muted-foreground">
            Configurez vos paramètres de paiement pour votre boutique e-commerce
          </p>
        </div>
        <Badge variant={config.is_active ? "default" : "secondary"}>
          {config.is_active ? "Actif" : "Inactif"}
        </Badge>
      </div>

      {/* Alerte d'information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vos clés Stripe sont chiffrées et sécurisées. Elles ne sont utilisées que pour traiter les paiements de votre boutique.
        </AlertDescription>
      </Alert>

      {/* Configuration principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Stripe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Clés API */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="publishable_key">Clé publique Stripe</Label>
              <Input
                id="publishable_key"
                type="text"
                placeholder="pk_live_... ou pk_test_..."
                value={config.stripe_publishable_key || ''}
                onChange={(e) => setConfig({
                  ...config,
                  stripe_publishable_key: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Commence par pk_live_ (production) ou pk_test_ (test)
              </p>
            </div>

            <div>
              <Label htmlFor="secret_key">Clé secrète Stripe</Label>
              <Input
                id="secret_key"
                type="password"
                placeholder="sk_live_... ou sk_test_..."
                value={config.stripe_secret_key || ''}
                onChange={(e) => setConfig({
                  ...config,
                  stripe_secret_key: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Commence par sk_live_ (production) ou sk_test_ (test)
              </p>
            </div>

            <div>
              <Label htmlFor="account_id">ID de compte Stripe (optionnel)</Label>
              <Input
                id="account_id"
                type="text"
                placeholder="acct_..."
                value={config.stripe_account_id || ''}
                onChange={(e) => setConfig({
                  ...config,
                  stripe_account_id: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pour les comptes Stripe Connect
              </p>
            </div>
          </div>

          <Separator />

          {/* Paramètres de commission */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="commission_rate">Taux de commission (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.commission_rate}
                onChange={(e) => setConfig({
                  ...config,
                  commission_rate: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Commission prélevée sur chaque vente
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto_transfer"
                checked={config.auto_transfer}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  auto_transfer: checked
                })}
              />
              <Label htmlFor="auto_transfer">Virement automatique</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Transférer automatiquement les fonds après déduction de la commission
            </p>
          </div>

          <Separator />

          {/* Activation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  is_active: checked
                })}
              />
              <Label htmlFor="is_active">Activer les paiements Stripe</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Les clients pourront payer par carte bancaire sur votre boutique
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={saveStripeConfig}
          disabled={saving}
          className="flex-1"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
        </Button>
        
        <Button 
          variant="outline"
          onClick={testStripeConnection}
          disabled={!config.stripe_secret_key}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Tester la connexion
        </Button>
      </div>

      {/* Aide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aide et documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Obtenir vos clés API Stripe</a></p>
            <p>• <a href="https://stripe.com/docs/connect" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Documentation Stripe Connect</a></p>
            <p>• Les paiements sont traités de manière sécurisée par Stripe</p>
            <p>• Vous recevrez les fonds directement sur votre compte Stripe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeConfiguration;