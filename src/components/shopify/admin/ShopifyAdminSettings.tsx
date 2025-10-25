import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Key, CheckCircle, XCircle, Settings2, Webhook, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ShopifyAdminSettings: React.FC = () => {
  const [apiConnected, setApiConnected] = useState(false);
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(3);
  const [autoCreateMode, setAutoCreateMode] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testApiConnection = async () => {
    setTesting(true);
    try {
      // Simuler un test de connexion
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setApiConnected(true);
      toast({
        title: 'Connexion réussie',
        description: 'Les clés API Shopify Partners sont valides',
      });
    } catch (error) {
      setApiConnected(false);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter à l\'API Shopify Partners',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    toast({
      title: 'Paramètres sauvegardés',
      description: 'Les modifications ont été appliquées avec succès',
    });
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuration API Shopify Partners
              </CardTitle>
              <CardDescription>Clés API pour la gestion des boutiques Shopify</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {apiConnected ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connecté
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Non connecté
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner-api-key">Partner API Key</Label>
              <Input id="partner-api-key" type="password" value="prtapi_a4c1...****" disabled />
              <p className="text-xs text-muted-foreground">Clé configurée et sécurisée</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID</Label>
              <Input id="client-id" type="password" value="2e5ca444...****" disabled />
              <p className="text-xs text-muted-foreground">Clé configurée et sécurisée</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-secret">Client Secret</Label>
              <Input id="client-secret" type="password" value="shpss_67d8...****" disabled />
              <p className="text-xs text-muted-foreground">Clé configurée et sécurisée</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <Input id="org-id" value="3624973" disabled />
              <p className="text-xs text-muted-foreground">Identifiant organisation</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={testApiConnection} disabled={testing}>
              {testing ? 'Test en cours...' : 'Tester la connexion'}
            </Button>
            <Button variant="outline">Modifier les clés</Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Paramètres Globaux
          </CardTitle>
          <CardDescription>Configuration par défaut pour toutes les boutiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Commission Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="commission-rate">Taux de commission par défaut</Label>
                <p className="text-sm text-muted-foreground">Appliqué à toutes les nouvelles boutiques</p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {defaultCommissionRate}%
              </Badge>
            </div>
            <Slider
              id="commission-rate"
              min={1}
              max={10}
              step={0.5}
              value={[defaultCommissionRate]}
              onValueChange={(value) => setDefaultCommissionRate(value[0])}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              La plateforme prendra {defaultCommissionRate}% de commission sur chaque vente
            </p>
          </div>

          <Separator />

          {/* Auto Create Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-create">Mode création automatique</Label>
              <p className="text-sm text-muted-foreground">
                Créer automatiquement les boutiques via l'API Partners
              </p>
            </div>
            <Switch id="auto-create" checked={autoCreateMode} onCheckedChange={setAutoCreateMode} />
          </div>

          <Button onClick={saveSettings} className="w-full">
            Sauvegarder les paramètres
          </Button>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks Shopify
          </CardTitle>
          <CardDescription>Gestion des événements en temps réel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'orders/create', status: 'active', last: '2 min ago' },
              { name: 'orders/paid', status: 'active', last: '5 min ago' },
              { name: 'orders/fulfilled', status: 'active', last: '1 hour ago' },
              { name: 'products/create', status: 'warning', last: '2 days ago' },
            ].map((webhook) => (
              <div key={webhook.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{webhook.name}</p>
                    <p className="text-xs text-muted-foreground">Dernière réception: {webhook.last}</p>
                  </div>
                </div>
                <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                  {webhook.status === 'active' ? 'Actif' : 'Attention'}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Re-synchroniser tous les webhooks
          </Button>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration Email
          </CardTitle>
          <CardDescription>Template envoyé aux réparateurs après création boutique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-template">Template Email</Label>
            <textarea
              id="email-template"
              className="w-full min-h-[200px] p-3 border rounded-lg resize-none font-mono text-sm"
              defaultValue={`Bonjour {{repairer_name}},

Votre boutique e-commerce "{{store_name}}" a été créée avec succès !

🎉 Accédez à votre admin Shopify : {{admin_url}}

📊 Vos identifiants :
- Email: {{email}}
- Domain: {{shop_domain}}

Besoin d'aide ? Consultez notre documentation ou contactez le support.

L'équipe RepairHub`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Variables disponibles: {'{'}repairer_name{'}'}, {'{'}store_name{'}'}, {'{'}admin_url{'}'}, {'{'}email{'}'},{' '}
            {'{'}shop_domain{'}'}
          </p>
          <Button variant="outline" className="w-full">
            Enregistrer le template
          </Button>
        </CardContent>
      </Card>

      {/* Logs & Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Logs & Diagnostics
          </CardTitle>
          <CardDescription>Dernières erreurs et événements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { type: 'error', message: 'Failed to create store for repairer #1234', time: '2 hours ago' },
              { type: 'warning', message: 'Webhook delivery delayed for orders/paid', time: '5 hours ago' },
              { type: 'info', message: 'Successfully synced 45 products from store demo-shop', time: '1 day ago' },
            ].map((log, idx) => (
              <div
                key={idx}
                className={`p-3 border-l-4 rounded ${
                  log.type === 'error'
                    ? 'border-l-red-500 bg-red-50 dark:bg-red-950'
                    : log.type === 'warning'
                    ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                }`}
              >
                <p className="text-sm font-medium">{log.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyAdminSettings;
