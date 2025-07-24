import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  CreditCard, 
  Shield,
  Bell,
  Palette,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  backupFrequency: string;
  logRetention: number;
}

const AdminConfigurationPage: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'TopRéparateurs',
    siteUrl: 'https://topreparateurs.fr',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    stripeEnabled: true,
    paypalEnabled: false,
    maxFileSize: 10,
    sessionTimeout: 24,
    backupFrequency: 'daily',
    logRetention: 30
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async (section?: string) => {
    setLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration sauvegardée",
        description: section ? `Section ${section} mise à jour` : "Toutes les configurations ont été sauvegardées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration système</h1>
          <p className="text-muted-foreground">Gérez les paramètres globaux de l'application</p>
        </div>
        <Button onClick={() => handleSave()} disabled={loading}>
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder tout
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Paramètres généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => handleConfigChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL du site</Label>
                  <Input
                    id="siteUrl"
                    value={config.siteUrl}
                    onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                    <p className="text-sm text-muted-foreground">Désactiver l'accès public au site</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">Inscription ouverte</Label>
                    <p className="text-sm text-muted-foreground">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={config.registrationEnabled}
                    onCheckedChange={(checked) => handleConfigChange('registrationEnabled', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('général')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres généraux
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notifications email</Label>
                    <p className="text-sm text-muted-foreground">Envoyer des notifications par email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Envoyer des notifications par SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={config.smsNotifications}
                    onCheckedChange={(checked) => handleConfigChange('smsNotifications', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('notifications')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Moyens de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label htmlFor="stripeEnabled">Stripe</Label>
                      <p className="text-sm text-muted-foreground">Activer les paiements Stripe</p>
                    </div>
                    <Badge variant={config.stripeEnabled ? "default" : "secondary"}>
                      {config.stripeEnabled ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <Switch
                    id="stripeEnabled"
                    checked={config.stripeEnabled}
                    onCheckedChange={(checked) => handleConfigChange('stripeEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label htmlFor="paypalEnabled">PayPal</Label>
                      <p className="text-sm text-muted-foreground">Activer les paiements PayPal</p>
                    </div>
                    <Badge variant={config.paypalEnabled ? "default" : "secondary"}>
                      {config.paypalEnabled ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <Switch
                    id="paypalEnabled"
                    checked={config.paypalEnabled}
                    onCheckedChange={(checked) => handleConfigChange('paypalEnabled', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('paiements')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paiements
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Délai d'expiration de session (heures)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Taille max des fichiers (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => handleConfigChange('maxFileSize', Number(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('sécurité')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la sécurité
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                  <select
                    id="backupFrequency"
                    value={config.backupFrequency}
                    onChange={(e) => handleConfigChange('backupFrequency', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Rétention des logs (jours)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={config.logRetention}
                    onChange={(e) => handleConfigChange('logRetention', Number(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('système')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder le système
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center p-8 text-muted-foreground">
                🎨 Configuration des thèmes et de l'apparence bientôt disponible
              </p>

              <Button onClick={() => handleSave('apparence')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder l'apparence
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConfigurationPage;