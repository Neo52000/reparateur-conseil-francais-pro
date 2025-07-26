import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, TestTube, Save, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EcommerceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string | null;
}

interface IntegrationConfig {
  prestashop: {
    apiUrl: string;
    apiKey: string;
    shopUrl: string;
  };
  woocommerce: {
    siteUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
  shopify: {
    storeUrl: string;
    accessToken: string;
    apiVersion: string;
  };
  magento: {
    baseUrl: string;
    adminToken: string;
    storeCode: string;
  };
}

const EcommerceIntegrationModal: React.FC<EcommerceIntegrationModalProps> = ({
  isOpen,
  onClose,
  platform
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [config, setConfig] = useState<IntegrationConfig>({
    prestashop: { apiUrl: '', apiKey: '', shopUrl: '' },
    woocommerce: { siteUrl: '', consumerKey: '', consumerSecret: '' },
    shopify: { storeUrl: '', accessToken: '', apiVersion: '2023-10' },
    magento: { baseUrl: '', adminToken: '', storeCode: 'default' }
  });

  const platformConfigs = {
    prestashop: {
      title: 'Configuration PrestaShop',
      description: 'Connectez votre boutique PrestaShop via l\'API Webservices',
      fields: [
        { key: 'apiUrl', label: 'URL API', placeholder: 'https://monshop.com/api', type: 'url' },
        { key: 'apiKey', label: 'Clé API', placeholder: 'Votre clé API PrestaShop', type: 'password' },
        { key: 'shopUrl', label: 'URL Boutique', placeholder: 'https://monshop.com', type: 'url' }
      ]
    },
    woocommerce: {
      title: 'Configuration WooCommerce',
      description: 'Connectez votre boutique WordPress/WooCommerce',
      fields: [
        { key: 'siteUrl', label: 'URL Site', placeholder: 'https://monsite.com', type: 'url' },
        { key: 'consumerKey', label: 'Consumer Key', placeholder: 'ck_xxxxxxxxxxxxx', type: 'text' },
        { key: 'consumerSecret', label: 'Consumer Secret', placeholder: 'cs_xxxxxxxxxxxxx', type: 'password' }
      ]
    },
    shopify: {
      title: 'Configuration Shopify',
      description: 'Connectez votre boutique Shopify via l\'Admin API',
      fields: [
        { key: 'storeUrl', label: 'URL Boutique', placeholder: 'monshop.myshopify.com', type: 'text' },
        { key: 'accessToken', label: 'Access Token', placeholder: 'shpat_xxxxxxxxxxxxx', type: 'password' },
        { key: 'apiVersion', label: 'Version API', placeholder: '2023-10', type: 'text' }
      ]
    },
    magento: {
      title: 'Configuration Magento',
      description: 'Connectez votre boutique Magento 2.x',
      fields: [
        { key: 'baseUrl', label: 'URL Base', placeholder: 'https://monshop.com', type: 'url' },
        { key: 'adminToken', label: 'Token Admin', placeholder: 'Votre token d\'administration', type: 'password' },
        { key: 'storeCode', label: 'Code Store', placeholder: 'default', type: 'text' }
      ]
    }
  };

  const handleConfigChange = (field: string, value: string) => {
    if (!platform) return;
    
    setConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof IntegrationConfig],
        [field]: value
      }
    }));
  };

  const handleSaveConfig = async () => {
    if (!platform) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ecommerce_integrations')
        .upsert({
          platform,
          configuration: config[platform as keyof IntegrationConfig],
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: `La configuration ${platform} a été enregistrée avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!platform) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-ecommerce-integration', {
        body: {
          platform,
          config: config[platform as keyof IntegrationConfig]
        }
      });

      if (error) throw error;

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connexion réussie' : 'Échec de la connexion')
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!platform || !platformConfigs[platform as keyof typeof platformConfigs]) {
    return null;
  }

  const platformConfig = platformConfigs[platform as keyof typeof platformConfigs];
  const currentConfig = config[platform as keyof IntegrationConfig];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {platformConfig.title}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">{platformConfig.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de connexion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformConfig.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={currentConfig[field.key as keyof typeof currentConfig] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test de connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isLoading ? 'Test en cours...' : 'Tester la connexion'}
                </Button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success 
                    ? 'border-green-200 bg-green-50 text-green-800' 
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? 'Connexion réussie' : 'Échec de la connexion'}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{testResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentation rapide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {platform === 'prestashop' && (
                  <>
                    <p><strong>Configuration requise :</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Activer les Webservices dans Paramètres avancés → Services Web</li>
                      <li>Créer une clé API avec les permissions nécessaires</li>
                      <li>Autoriser l'IP du serveur dans la configuration</li>
                    </ul>
                  </>
                )}
                {platform === 'woocommerce' && (
                  <>
                    <p><strong>Configuration requise :</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>WooCommerce installé et activé sur WordPress</li>
                      <li>Générer Consumer Key/Secret dans WooCommerce → Réglages → Avancé → API REST</li>
                      <li>Permissions en lecture/écriture pour l'API</li>
                    </ul>
                  </>
                )}
                {platform === 'shopify' && (
                  <>
                    <p><strong>Configuration requise :</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Application privée créée dans l'admin Shopify</li>
                      <li>Access Token avec les scopes nécessaires</li>
                      <li>Permissions : read_products, write_products, read_orders</li>
                    </ul>
                  </>
                )}
                {platform === 'magento' && (
                  <>
                    <p><strong>Configuration requise :</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Magento 2.x avec API REST activée</li>
                      <li>Token d'authentification admin valide</li>
                      <li>Permissions : Catalogue, Commandes, Clients</li>
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder la configuration
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EcommerceIntegrationModal;