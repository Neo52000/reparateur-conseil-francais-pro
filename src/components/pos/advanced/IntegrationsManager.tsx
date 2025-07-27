import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Package, 
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IntegrationsManager: React.FC = () => {
  const { toast } = useToast();
  const [activeIntegrations, setActiveIntegrations] = useState({
    stripe: true,
    paypal: false,
    mailchimp: true,
    slack: false,
    zapier: false,
    quickbooks: false,
    shopify: false,
    woocommerce: false
  });

  const integrationCategories = [
    {
      id: 'payment',
      name: 'Paiements',
      icon: CreditCard,
      integrations: [
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'Traitement des paiements en ligne',
          status: 'connected',
          webhook_url: 'https://api.stripe.com/webhooks',
          features: ['Paiements CB', 'Virements', 'Abonnements']
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Paiements PayPal et cartes',
          status: 'disconnected',
          features: ['PayPal', 'Cartes', 'Express Checkout']
        },
        {
          id: 'sumup',
          name: 'SumUp',
          description: 'Terminal de paiement mobile',
          status: 'available',
          features: ['NFC', 'Bluetooth', 'Terminal']
        }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Mail,
      integrations: [
        {
          id: 'mailchimp',
          name: 'Mailchimp',
          description: 'Email marketing et newsletters',
          status: 'connected',
          webhook_url: 'https://mailchimp.com/api',
          features: ['Newsletters', 'Segmentation', 'Automatisation']
        },
        {
          id: 'sendinblue',
          name: 'Brevo (ex-Sendinblue)',
          description: 'Email et SMS marketing',
          status: 'available',
          features: ['Email', 'SMS', 'Chat', 'CRM']
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: MessageSquare,
      integrations: [
        {
          id: 'slack',
          name: 'Slack',
          description: 'Notifications équipe en temps réel',
          status: 'disconnected',
          features: ['Notifications', 'Alertes stock', 'Rapports']
        },
        {
          id: 'teams',
          name: 'Microsoft Teams',
          description: 'Collaboration d\'équipe',
          status: 'available',
          features: ['Chat', 'Vidéo', 'Fichiers']
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp Business',
          description: 'Messages clients WhatsApp',
          status: 'available',
          features: ['Messages', 'Broadcast', 'Statuts']
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      integrations: [
        {
          id: 'google_analytics',
          name: 'Google Analytics',
          description: 'Analyse du trafic web',
          status: 'available',
          features: ['Trafic', 'Conversions', 'E-commerce']
        },
        {
          id: 'facebook_pixel',
          name: 'Facebook Pixel',
          description: 'Tracking Facebook/Meta',
          status: 'available',
          features: ['Remarketing', 'Conversions', 'Audiences']
        }
      ]
    },
    {
      id: 'accounting',
      name: 'Comptabilité',
      icon: FileText,
      integrations: [
        {
          id: 'quickbooks',
          name: 'QuickBooks',
          description: 'Synchronisation comptable',
          status: 'disconnected',
          features: ['Factures', 'Rapports', 'TVA']
        },
        {
          id: 'sage',
          name: 'Sage',
          description: 'ERP et comptabilité',
          status: 'available',
          features: ['Comptabilité', 'Paie', 'Gestion']
        },
        {
          id: 'ciel',
          name: 'Ciel',
          description: 'Solution comptable française',
          status: 'available',
          features: ['Compta', 'Devis', 'Facturation']
        }
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: Package,
      integrations: [
        {
          id: 'shopify',
          name: 'Shopify',
          description: 'Synchronisation boutique en ligne',
          status: 'disconnected',
          features: ['Produits', 'Commandes', 'Stock']
        },
        {
          id: 'woocommerce',
          name: 'WooCommerce',
          description: 'WordPress e-commerce',
          status: 'disconnected',
          features: ['Produits', 'Commandes', 'Variations']
        },
        {
          id: 'prestashop',
          name: 'PrestaShop',
          description: 'Plateforme e-commerce française',
          status: 'available',
          features: ['Catalogue', 'Commandes', 'Clients']
        }
      ]
    },
    {
      id: 'automation',
      name: 'Automatisation',
      icon: Plug,
      integrations: [
        {
          id: 'zapier',
          name: 'Zapier',
          description: 'Automatisation entre apps',
          status: 'disconnected',
          features: ['Workflows', 'Triggers', 'Actions']
        },
        {
          id: 'make',
          name: 'Make (ex-Integromat)',
          description: 'Automatisation avancée',
          status: 'available',
          features: ['Scénarios', 'API', 'Webhooks']
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      disconnected: 'destructive',
      available: 'secondary'
    } as const;
    
    const labels = {
      connected: 'Connecté',
      disconnected: 'Déconnecté',
      available: 'Disponible'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Intégration configurée",
      description: `L'intégration ${integrationId} a été configurée avec succès`,
    });
  };

  const handleDisconnect = (integrationId: string) => {
    toast({
      title: "Intégration déconnectée",
      description: `L'intégration ${integrationId} a été déconnectée`,
    });
  };

  const testWebhook = (integrationId: string) => {
    toast({
      title: "Test webhook",
      description: `Test de connexion pour ${integrationId} en cours...`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intégrations</h2>
          <p className="text-muted-foreground">Connectez votre POS à vos outils métier</p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Synchroniser tout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intégrations actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks reçus</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync réussis</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Taux de succès</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">À résoudre</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="payment">Paiements</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="accounting">Comptabilité</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {integrationCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(integration.status)}
                        <h4 className="font-medium">{integration.name}</h4>
                        {getStatusBadge(integration.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {integration.webhook_url && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Webhook: {integration.webhook_url}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => testWebhook(integration.id)}
                          >
                            Tester
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Déconnecter
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                        >
                          {integration.status === 'available' ? 'Configurer' : 'Reconnecter'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {integrationCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.name}
                </CardTitle>
                <CardDescription>
                  Configurez vos intégrations {category.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.integrations.map((integration) => (
                  <div key={integration.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(integration.status)}
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    {integration.status === 'connected' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`${integration.id}-api-key`}>Clé API</Label>
                            <Input 
                              id={`${integration.id}-api-key`}
                              type="password" 
                              value="sk_live_••••••••••••••••" 
                              readOnly 
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${integration.id}-webhook`}>URL Webhook</Label>
                            <Input 
                              id={`${integration.id}-webhook`}
                              value={integration.webhook_url || ''} 
                              readOnly 
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`${integration.id}-settings`}>Configuration</Label>
                          <Textarea 
                            id={`${integration.id}-settings`}
                            placeholder="Configuration JSON..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={activeIntegrations[integration.id as keyof typeof activeIntegrations]} 
                        onCheckedChange={(checked) => 
                          setActiveIntegrations(prev => ({
                            ...prev,
                            [integration.id]: checked
                          }))
                        }
                      />
                      <Label>Synchronisation automatique</Label>
                    </div>

                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurer
                          </Button>
                          <Button variant="outline" size="sm">
                            Tester
                          </Button>
                          <Button variant="destructive" size="sm">
                            Déconnecter
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">
                          <Plug className="mr-2 h-4 w-4" />
                          Connecter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default IntegrationsManager;