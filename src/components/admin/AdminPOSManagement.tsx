import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Users, Activity, Settings, RefreshCw, Globe, Send, FileText, History, Palette, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface POSStats {
  totalTransactions: number;
  totalRevenue: number;
  activeRepairers: number;
  todayTransactions: number;
}

interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
  is_active: boolean;
}

interface ConfigTemplate {
  id: string;
  template_name: string;
  template_data: any;
  description: string;
  is_default: boolean;
}

interface DeploymentHistory {
  id: string;
  deployment_type: string;
  target_type: string;
  status: string;
  deployed_at: string;
  completed_at: string;
}

interface POSTransaction {
  id: string;
  repairer_id: string;
  transaction_number: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  repairer_name: string;
}

const AdminPOSManagement: React.FC = () => {
  const [stats, setStats] = useState<POSStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    activeRepairers: 0,
    todayTransactions: 0
  });
  const [globalSettings, setGlobalSettings] = useState<GlobalSetting[]>([]);
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data: activeRepairersData } = await supabase
        .from('module_subscriptions')
        .select('repairer_id')
        .eq('module_type', 'pos')
        .eq('module_active', true);

      setStats({
        totalTransactions: 0,
        totalRevenue: 0,
        activeRepairers: activeRepairersData?.length || 0,
        todayTransactions: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats POS:', error);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_pos_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      setGlobalSettings(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('configuration_templates')
        .select('*')
        .eq('template_type', 'pos')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    }
  };

  const fetchDeploymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('deployment_history')
        .select('*')
        .eq('deployment_type', 'pos')
        .order('deployed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setDeploymentHistory(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchGlobalSettings(), fetchTemplates(), fetchDeploymentHistory()]);
    setLoading(false);
  };

  const updateGlobalSetting = async (settingKey: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('global_pos_settings')
        .update({ 
          setting_value: newValue,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;
      
      toast({
        title: "Paramètre mis à jour",
        description: `Le paramètre ${settingKey} a été mis à jour avec succès.`,
      });
      
      fetchGlobalSettings();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive"
      });
    }
  };

  const deployGlobalConfiguration = async () => {
    try {
      const configurationData = globalSettings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as any);

      const { error } = await supabase
        .from('deployment_history')
        .insert({
          deployment_type: 'pos',
          target_type: 'global',
          configuration_data: configurationData,
          deployed_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Déploiement réussi",
        description: "La configuration globale POS a été déployée sur tous les modules.",
      });
      
      fetchDeploymentHistory();
    } catch (error) {
      console.error('Erreur lors du déploiement:', error);
      toast({
        title: "Erreur de déploiement",
        description: "Impossible de déployer la configuration",
        variant: "destructive"
      });
    }
  };

  const renderSettingInput = (setting: GlobalSetting) => {
    const value = setting.setting_value;
    
    switch (setting.setting_key) {
      case 'default_currency':
        return (
          <div className="space-y-2">
            <Label>Devise par défaut</Label>
            <Select 
              value={value.currency || 'EUR'} 
              onValueChange={(newCurrency) => 
                updateGlobalSetting(setting.setting_key, { ...value, currency: newCurrency })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'tax_rate':
        return (
          <div className="space-y-2">
            <Label>Taux de TVA (%)</Label>
            <Input
              type="number"
              value={value.rate || 20}
              onChange={(e) => 
                updateGlobalSetting(setting.setting_key, { ...value, rate: parseFloat(e.target.value) })
              }
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        );
      
      case 'payment_methods':
        return (
          <div className="space-y-4">
            <Label>Méthodes de paiement autorisées</Label>
            {Object.entries(value).map(([method, enabled]) => (
              <div key={method} className="flex items-center space-x-2">
                <Switch
                  checked={enabled as boolean}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, [method]: checked })
                  }
                />
                <Label className="capitalize">{method}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'receipt_template':
        return (
          <div className="space-y-4">
            <Label>Template de reçu</Label>
            <div className="space-y-2">
              <Input
                placeholder="En-tête du reçu"
                value={value.header || ''}
                onChange={(e) =>
                  updateGlobalSetting(setting.setting_key, { ...value, header: e.target.value })
                }
              />
              <Textarea
                placeholder="Pied de page du reçu"
                value={value.footer || ''}
                onChange={(e) =>
                  updateGlobalSetting(setting.setting_key, { ...value, footer: e.target.value })
                }
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={value.logo || false}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, logo: checked })
                  }
                />
                <Label>Inclure le logo</Label>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label>{setting.description}</Label>
            <Textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const newValue = JSON.parse(e.target.value);
                  updateGlobalSetting(setting.setting_key, newValue);
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        );
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const settingsByCategory = globalSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, GlobalSetting[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration POS Globale</h1>
          <p className="text-muted-foreground">Configuration et déploiement centralisés des systèmes POS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Édition' : 'Aperçu'}
          </Button>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modules POS actifs</p>
              <p className="text-2xl font-bold">{stats.activeRepairers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Settings className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paramètres globaux</p>
              <p className="text-2xl font-bold">{globalSettings.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Templates</p>
              <p className="text-2xl font-bold">{templates.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <History className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Déploiements</p>
              <p className="text-2xl font-bold">{deploymentHistory.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="global-settings">Paramètres globaux</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="deployment">Déploiement</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Tableau de bord POS global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Configuration actuelle</h3>
                  <div className="space-y-2">
                    {Object.entries(settingsByCategory).map(([category, settings]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize text-sm text-muted-foreground">{category}</span>
                        <Badge variant="outline">{settings.length} paramètres</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Actions rapides</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={deployGlobalConfiguration}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Déployer sur tous les POS
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Créer un nouveau template
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global-settings" className="space-y-6">
          {Object.entries(settingsByCategory).map(([category, settings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="mb-4">
                      <h4 className="font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</h4>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    {!previewMode && renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates de configuration POS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.template_name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {template.is_default && <Badge>Par défaut</Badge>}
                        <Button variant="outline" size="sm">Appliquer</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun template configuré
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Déploiement de configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={deployGlobalConfiguration}
                  className="h-24 flex-col"
                >
                  <Globe className="h-8 w-8 mb-2" />
                  Déploiement global
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="h-8 w-8 mb-2" />
                  Déploiement sélectif
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="h-8 w-8 mb-2" />
                  Template spécifique
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Informations de déploiement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Les paramètres globaux seront appliqués à tous les modules POS actifs</li>
                  <li>• Les réparateurs pourront personnaliser certains paramètres localement</li>
                  <li>• Un rollback automatique sera effectué en cas d'erreur</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des déploiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentHistory.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{deployment.target_type.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(deployment.deployed_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge 
                      variant={deployment.status === 'completed' ? 'default' : 
                               deployment.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {deployment.status}
                    </Badge>
                  </div>
                ))}
                {deploymentHistory.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun déploiement dans l'historique
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPOSManagement;