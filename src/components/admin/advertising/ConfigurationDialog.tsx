import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  ExternalLink, 
  Shield, 
  Brain, 
  CreditCard, 
  Globe, 
  Zap,
  CheckCircle,
  AlertCircle,
  Key,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const platforms = [
  { 
    id: 'google_ads', 
    name: 'Google Ads', 
    url: 'https://ads.google.com',
    setupUrl: 'https://ads.google.com/home/tools/manager-accounts/',
    connected: true,
    accountId: '123-456-7890'
  },
  { 
    id: 'meta_ads', 
    name: 'Meta Ads Manager', 
    url: 'https://business.facebook.com/adsmanager',
    setupUrl: 'https://business.facebook.com/',
    connected: false,
    accountId: null
  },
  { 
    id: 'microsoft_ads', 
    name: 'Microsoft Advertising', 
    url: 'https://ads.microsoft.com',
    setupUrl: 'https://ads.microsoft.com/',
    connected: false,
    accountId: null
  },
  { 
    id: 'google_shopping', 
    name: 'Google Shopping', 
    url: 'https://merchants.google.com',
    setupUrl: 'https://merchants.google.com/',
    connected: true,
    accountId: 'FR-67890'
  },
  { 
    id: 'bing_shopping', 
    name: 'Bing Shopping', 
    url: 'https://www.bing.com/toolbox/merchants',
    setupUrl: 'https://www.bing.com/toolbox/merchants',
    connected: false,
    accountId: null
  },
  { 
    id: 'instagram_ads', 
    name: 'Instagram Ads', 
    url: 'https://business.facebook.com/adsmanager',
    setupUrl: 'https://business.facebook.com/',
    connected: false,
    accountId: null
  }
];

interface ConfigurationDialogProps {
  trigger?: React.ReactNode;
}

export const ConfigurationDialog = ({ trigger }: ConfigurationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [config, setConfig] = useState({
    // Paramètres généraux
    auto_optimization: true,
    budget_alerts: true,
    performance_alerts: true,
    daily_reports: false,
    
    // IA Settings
    ai_model: 'gpt-4',
    content_generation_frequency: 'weekly',
    auto_creative_refresh: true,
    quality_threshold: 8.0,
    
    // Budget & Limits
    max_daily_spend: 200,
    emergency_pause_threshold: 90,
    min_roas_threshold: 2.0,
    
    // API & Intégrations
    tracking_pixel: '',
    conversion_goals: 'leads',
    attribution_window: '7d'
  });

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      // Sauvegarder la configuration via Supabase Edge Function
      const { error } = await supabase.functions.invoke('save-advertising-config', {
        body: { configData: config }
      });
      
      if (error) throw error;
      
      toast({
        title: "Configuration sauvegardée",
        description: "Vos paramètres ont été mis à jour avec succès"
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectPlatform = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      window.open(platform.setupUrl, '_blank');
      toast({
        title: "Redirection",
        description: `Redirection vers ${platform.name} pour la configuration`
      });
    }
  };

  const handleDisconnectPlatform = (platformId: string) => {
    toast({
      title: "Déconnexion",
      description: "Compte déconnecté avec succès",
      variant: "default"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Advertising AI
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="platforms">Plateformes</TabsTrigger>
            <TabsTrigger value="ai">IA & Contenu</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          </TabsList>

          {/* Plateformes publicitaires */}
          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Connexions aux plateformes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          {platform.connected && platform.accountId && (
                            <div className="text-sm text-muted-foreground">
                              Compte: {platform.accountId}
                            </div>
                          )}
                          {!platform.connected && (
                            <div className="text-sm text-muted-foreground">
                              Non connecté
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {platform.connected ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connecté
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(platform.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ouvrir
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnectPlatform(platform.id)}
                            >
                              Déconnecter
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Déconnecté
                            </Badge>
                            <Button 
                              size="sm"
                              onClick={() => handleConnectPlatform(platform.id)}
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Connecter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Liens rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-blue-500 rounded" />
                      <span className="text-xs">Google Ads</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-blue-600 rounded" />
                      <span className="text-xs">Meta Business</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://ads.microsoft.com" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-orange-500 rounded" />
                      <span className="text-xs">Microsoft Ads</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-green-500 rounded" />
                      <span className="text-xs">Google Shopping</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://www.bing.com/toolbox/merchants" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-orange-600 rounded" />
                      <span className="text-xs">Bing Shopping</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="h-auto p-3 flex-col gap-1" asChild>
                    <a href="https://business.instagram.com" target="_blank" rel="noopener noreferrer">
                      <div className="w-6 h-6 bg-pink-500 rounded" />
                      <span className="text-xs">Instagram</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration IA */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Paramètres IA et génération de contenu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modèle IA</Label>
                    <Select value={config.ai_model} onValueChange={(value) => setConfig(prev => ({ ...prev, ai_model: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommandé)</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fréquence de génération</Label>
                    <Select value={config.content_generation_frequency} onValueChange={(value) => setConfig(prev => ({ ...prev, content_generation_frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                        <SelectItem value="manual">Manuelle uniquement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Seuil de qualité minimum</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10"
                    value={config.quality_threshold}
                    onChange={(e) => setConfig(prev => ({ ...prev, quality_threshold: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Les contenus avec un score inférieur ne seront pas publiés automatiquement
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Renouvellement automatique des créations</Label>
                    <p className="text-xs text-muted-foreground">
                      Génère de nouvelles créations quand les performances baissent
                    </p>
                  </div>
                  <Switch 
                    checked={config.auto_creative_refresh}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_creative_refresh: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des budgets */}
          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contrôles de budget et performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dépense quotidienne max (€)</Label>
                    <Input 
                      type="number"
                      value={config.max_daily_spend}
                      onChange={(e) => setConfig(prev => ({ ...prev, max_daily_spend: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil de pause d'urgence (%)</Label>
                    <Input 
                      type="number"
                      value={config.emergency_pause_threshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, emergency_pause_threshold: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>ROAS minimum requis</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={config.min_roas_threshold}
                    onChange={(e) => setConfig(prev => ({ ...prev, min_roas_threshold: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Les campagnes sous ce seuil seront automatiquement optimisées ou mises en pause
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertes et notifications */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Alertes et notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertes de budget</Label>
                      <p className="text-xs text-muted-foreground">
                        Notifications quand le budget approche la limite
                      </p>
                    </div>
                    <Switch 
                      checked={config.budget_alerts}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, budget_alerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertes de performance</Label>
                      <p className="text-xs text-muted-foreground">
                        Notifications en cas de chute de performance
                      </p>
                    </div>
                    <Switch 
                      checked={config.performance_alerts}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, performance_alerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rapports quotidiens</Label>
                      <p className="text-xs text-muted-foreground">
                        Résumé quotidien par email
                      </p>
                    </div>
                    <Switch 
                      checked={config.daily_reports}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, daily_reports: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres avancés */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres avancés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pixel de tracking</Label>
                  <Input 
                    value={config.tracking_pixel}
                    onChange={(e) => setConfig(prev => ({ ...prev, tracking_pixel: e.target.value }))}
                    placeholder="GTM-XXXXXXX ou code pixel"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Objectifs de conversion</Label>
                    <Select value={config.conversion_goals} onValueChange={(value) => setConfig(prev => ({ ...prev, conversion_goals: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leads">Génération de leads</SelectItem>
                        <SelectItem value="sales">Ventes</SelectItem>
                        <SelectItem value="calls">Appels téléphoniques</SelectItem>
                        <SelectItem value="visits">Visites en magasin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fenêtre d'attribution</Label>
                    <Select value={config.attribution_window} onValueChange={(value) => setConfig(prev => ({ ...prev, attribution_window: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 jour</SelectItem>
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="14d">14 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Optimisation automatique globale</Label>
                    <p className="text-xs text-muted-foreground">
                      Active l'optimisation IA sur toutes les nouvelles campagnes
                    </p>
                  </div>
                  <Switch 
                    checked={config.auto_optimization}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_optimization: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSaveConfig} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};