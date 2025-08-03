import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Settings, 
  Palette, 
  Store, 
  ExternalLink, 
  Save,
  RotateCcw,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerDisplayConfigProps {
  onConfigChange?: (config: CustomerDisplaySettings) => void;
  onPreview?: () => void;
  onOpenDisplay?: () => void;
}

interface CustomerDisplaySettings {
  enabled: boolean;
  displayUrl: string;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
  appearance: {
    welcomeMessage: string;
    theme: 'light' | 'dark' | 'auto';
    showTime: boolean;
    showServices: boolean;
    language: 'fr' | 'en';
  };
  features: {
    showCategories: boolean;
    showPromotions: boolean;
    showPrices: boolean;
    autoRefresh: number; // en secondes
  };
}

const CustomerDisplayConfig: React.FC<CustomerDisplayConfigProps> = ({
  onConfigChange,
  onPreview,
  onOpenDisplay
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<CustomerDisplaySettings>({
    enabled: false,
    displayUrl: `${window.location.origin}/pos/customer-display`,
    storeInfo: {
      name: 'RepairHub POS',
      address: '123 Rue de la Réparation, 75001 Paris',
      phone: '01 23 45 67 89'
    },
    appearance: {
      welcomeMessage: 'Bienvenue chez RepairHub',
      theme: 'light',
      showTime: true,
      showServices: true,
      language: 'fr'
    },
    features: {
      showCategories: true,
      showPromotions: true,
      showPrices: true,
      autoRefresh: 5
    }
  });

  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current = newConfig as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newConfig;
    });
  };

  const handleSave = () => {
    onConfigChange?.(config);
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres de l'afficheur client ont été mis à jour.",
    });
  };

  const handleReset = () => {
    setConfig({
      enabled: false,
      displayUrl: `${window.location.origin}/pos/customer-display`,
      storeInfo: {
        name: 'RepairHub POS',
        address: '123 Rue de la Réparation, 75001 Paris',
        phone: '01 23 45 67 89'
      },
      appearance: {
        welcomeMessage: 'Bienvenue chez RepairHub',
        theme: 'light',
        showTime: true,
        showServices: true,
        language: 'fr'
      },
      features: {
        showCategories: true,
        showPromotions: true,
        showPrices: true,
        autoRefresh: 5
      }
    });
    toast({
      title: "Configuration réinitialisée",
      description: "Les paramètres par défaut ont été restaurés.",
    });
  };

  const handleOpenDisplay = () => {
    window.open(config.displayUrl, '_blank', 'fullscreen=yes,menubar=no,toolbar=no,location=no,status=no');
    onOpenDisplay?.();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Monitor className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Afficheur Client</h2>
            <p className="text-muted-foreground">Configuration de l'écran client (second écran)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "Activé" : "Désactivé"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration générale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuration générale</span>
            </CardTitle>
            <CardDescription>
              Paramètres de base de l'afficheur client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled">Activer l'afficheur client</Label>
                <p className="text-sm text-muted-foreground">
                  Permet d'utiliser un second écran pour les clients
                </p>
              </div>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => updateConfig('enabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="displayUrl">URL de l'afficheur</Label>
              <div className="flex space-x-2">
                <Input
                  id="displayUrl"
                  value={config.displayUrl}
                  onChange={(e) => updateConfig('displayUrl', e.target.value)}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenDisplay}
                  disabled={!config.enabled}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ouvrez cette URL sur votre écran client
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoRefresh">Rafraîchissement automatique (secondes)</Label>
              <Input
                id="autoRefresh"
                type="number"
                min="1"
                max="60"
                value={config.features.autoRefresh}
                onChange={(e) => updateConfig('features.autoRefresh', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations magasin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Informations magasin</span>
            </CardTitle>
            <CardDescription>
              Informations affichées sur l'écran client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nom du magasin</Label>
              <Input
                id="storeName"
                value={config.storeInfo.name}
                onChange={(e) => updateConfig('storeInfo.name', e.target.value)}
                placeholder="RepairHub POS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Adresse</Label>
              <Textarea
                id="storeAddress"
                value={config.storeInfo.address}
                onChange={(e) => updateConfig('storeInfo.address', e.target.value)}
                placeholder="123 Rue de la Réparation, 75001 Paris"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">Téléphone</Label>
              <Input
                id="storePhone"
                value={config.storeInfo.phone}
                onChange={(e) => updateConfig('storeInfo.phone', e.target.value)}
                placeholder="01 23 45 67 89"
              />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Apparence</span>
            </CardTitle>
            <CardDescription>
              Personnalisation de l'affichage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Message de bienvenue</Label>
              <Input
                id="welcomeMessage"
                value={config.appearance.welcomeMessage}
                onChange={(e) => updateConfig('appearance.welcomeMessage', e.target.value)}
                placeholder="Bienvenue chez RepairHub"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showTime">Afficher l'heure</Label>
                <p className="text-sm text-muted-foreground">
                  Horloge en temps réel
                </p>
              </div>
              <Switch
                id="showTime"
                checked={config.appearance.showTime}
                onCheckedChange={(checked) => updateConfig('appearance.showTime', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showServices">Afficher les services</Label>
                <p className="text-sm text-muted-foreground">
                  Liste des services proposés
                </p>
              </div>
              <Switch
                id="showServices"
                checked={config.appearance.showServices}
                onCheckedChange={(checked) => updateConfig('appearance.showServices', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités avancées</CardTitle>
            <CardDescription>
              Options d'affichage supplémentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showCategories">Afficher les catégories</Label>
                <p className="text-sm text-muted-foreground">
                  Catégories des produits
                </p>
              </div>
              <Switch
                id="showCategories"
                checked={config.features.showCategories}
                onCheckedChange={(checked) => updateConfig('features.showCategories', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPrices">Afficher les prix</Label>
                <p className="text-sm text-muted-foreground">
                  Prix détaillés des articles
                </p>
              </div>
              <Switch
                id="showPrices"
                checked={config.features.showPrices}
                onCheckedChange={(checked) => updateConfig('features.showPrices', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPromotions">Afficher les promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Offres et promotions en cours
                </p>
              </div>
              <Switch
                id="showPromotions"
                checked={config.features.showPromotions}
                onCheckedChange={(checked) => updateConfig('features.showPromotions', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onPreview} disabled={!config.enabled}>
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button variant="outline" onClick={handleOpenDisplay} disabled={!config.enabled}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir l'afficheur
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDisplayConfig;