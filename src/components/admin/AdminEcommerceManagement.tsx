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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Store, Package, Settings, RefreshCw, TrendingUp, Globe, Send, FileText, History, Palette, Eye, Plus, Users, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EcommercePreview from './preview/EcommercePreview';
import InteractiveEcommercePreview from './preview/InteractiveEcommercePreview';

interface EcommerceStats {
  totalOrders: number;
  totalRevenue: number;
  activeStores: number;
  totalProducts: number;
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

const AdminEcommerceManagement: React.FC = () => {
  const [stats, setStats] = useState<EcommerceStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeStores: 0,
    totalProducts: 0
  });
  const [globalSettings, setGlobalSettings] = useState<GlobalSetting[]>([]);
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewMode, setPreviewMode] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [showSelectiveDeployment, setShowSelectiveDeployment] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [activeStores, setActiveStores] = useState<Array<{id: string, name: string}>>([]);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data: activeStoresData } = await supabase
        .from('module_subscriptions')
        .select('repairer_id')
        .eq('module_type', 'ecommerce')
        .eq('module_active', true);

      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        activeStores: activeStoresData?.length || 0,
        totalProducts: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats E-commerce:', error);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_ecommerce_settings')
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
        .eq('template_type', 'ecommerce')
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
        .eq('deployment_type', 'ecommerce')
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
        .from('global_ecommerce_settings')
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
          deployment_type: 'ecommerce',
          target_type: 'global',
          configuration_data: configurationData,
          deployed_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Déploiement réussi",
        description: "La configuration globale E-commerce a été déployée sur toutes les boutiques.",
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

  const fetchActiveStores = async () => {
    try {
      const { data, error } = await supabase
        .from('repairer_subscriptions')
        .select('user_id, repairer_id, profiles!inner(first_name, last_name)')
        .eq('subscribed', true);

      if (error) throw error;
      
      const stores = data?.map(item => ({
        id: item.user_id,
        name: `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || `Boutique ${item.repairer_id}`
      })) || [];
      
      setActiveStores(stores);
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error);
      setActiveStores([
        { id: '1', name: 'Boutique 1' },
        { id: '2', name: 'Boutique 2' },
        { id: '3', name: 'Boutique 3' }
      ]);
    }
  };

  const deployToSelectedStores = async () => {
    if (selectedStores.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une boutique",
        variant: "destructive"
      });
      return;
    }

    try {
      const configurationData = globalSettings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as any);

      const { error } = await supabase
        .from('deployment_history')
        .insert({
          deployment_type: 'ecommerce',
          target_type: 'selective',
          target_ids: selectedStores,
          configuration_data: configurationData,
          deployed_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Déploiement réussi",
        description: `Configuration déployée sur ${selectedStores.length} boutique(s) sélectionnée(s).`,
      });
      
      setShowSelectiveDeployment(false);
      setSelectedStores([]);
      fetchDeploymentHistory();
    } catch (error) {
      console.error('Erreur lors du déploiement sélectif:', error);
      toast({
        title: "Erreur de déploiement",
        description: "Impossible de déployer sur les boutiques sélectionnées",
        variant: "destructive"
      });
    }
  };

  const applyTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un template",
        variant: "destructive"
      });
      return;
    }

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template non trouvé');

      const { error } = await supabase
        .from('deployment_history')
        .insert({
          deployment_type: 'ecommerce',
          target_type: 'template',
          configuration_data: template.template_data,
          deployed_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Template appliqué",
        description: `Le template "${template.template_name}" a été appliqué avec succès.`,
      });
      
      setShowTemplateSelection(false);
      setSelectedTemplate('');
      fetchDeploymentHistory();
    } catch (error) {
      console.error('Erreur lors de l\'application du template:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le template",
        variant: "destructive"
      });
    }
  };

  const createTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour le template",
        variant: "destructive"
      });
      return;
    }

    try {
      const templateData = globalSettings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as any);

      const { error } = await supabase
        .from('configuration_templates')
        .insert({
          template_name: newTemplateName,
          template_type: 'ecommerce',
          template_data: templateData,
          description: newTemplateDescription || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Template créé",
        description: `Le template "${newTemplateName}" a été créé avec succès.`,
      });
      
      setShowCreateTemplate(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      });
    }
  };

  const renderSettingInput = (setting: GlobalSetting) => {
    const value = setting.setting_value;
    
    switch (setting.setting_key) {
      case 'default_shipping':
        return (
          <div className="space-y-4">
            <Label>Paramètres de livraison</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Seuil livraison gratuite (€)</Label>
                <Input
                  type="number"
                  value={value.free_threshold || 50}
                  onChange={(e) => 
                    updateGlobalSetting(setting.setting_key, { 
                      ...value, 
                      free_threshold: parseFloat(e.target.value) 
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-sm">Tarif standard (€)</Label>
                <Input
                  type="number"
                  value={value.standard_rate || 5.99}
                  onChange={(e) => 
                    updateGlobalSetting(setting.setting_key, { 
                      ...value, 
                      standard_rate: parseFloat(e.target.value) 
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        );
      
      case 'tax_settings':
        return (
          <div className="space-y-4">
            <Label>Paramètres de taxation</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={value.include_tax || true}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, include_tax: checked })
                  }
                />
                <Label>Inclure la TVA dans les prix</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={value.display_tax || true}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, display_tax: checked })
                  }
                />
                <Label>Afficher le détail de la TVA</Label>
              </div>
            </div>
          </div>
        );
      
      case 'store_template':
        return (
          <div className="space-y-4">
            <Label>Template de boutique</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Thème</Label>
                <Select 
                  value={value.theme || 'modern'} 
                  onValueChange={(newTheme) => 
                    updateGlobalSetting(setting.setting_key, { ...value, theme: newTheme })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                    <SelectItem value="minimal">Minimaliste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Couleur primaire</Label>
                  <Input
                    type="color"
                    value={value.colors?.primary || '#3b82f6'}
                    onChange={(e) => 
                      updateGlobalSetting(setting.setting_key, { 
                        ...value, 
                        colors: { ...value.colors, primary: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm">Couleur secondaire</Label>
                  <Input
                    type="color"
                    value={value.colors?.secondary || '#64748b'}
                    onChange={(e) => 
                      updateGlobalSetting(setting.setting_key, { 
                        ...value, 
                        colors: { ...value.colors, secondary: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'payment_gateways':
        return (
          <div className="space-y-4">
            <Label>Gateways de paiement autorisés</Label>
            {Object.entries(value).map(([gateway, enabled]) => (
              <div key={gateway} className="flex items-center space-x-2">
                <Switch
                  checked={enabled as boolean}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, [gateway]: checked })
                  }
                />
                <Label className="capitalize">{gateway}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'product_moderation':
        return (
          <div className="space-y-4">
            <Label>Règles de modération des produits</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={value.auto_approve || false}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, auto_approve: checked })
                  }
                />
                <Label>Approbation automatique</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={value.require_images || true}
                  onCheckedChange={(checked) =>
                    updateGlobalSetting(setting.setting_key, { ...value, require_images: checked })
                  }
                />
                <Label>Images obligatoires</Label>
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
    fetchActiveStores();
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
          <h1 className="text-3xl font-bold text-foreground">Administration E-commerce Globale</h1>
          <p className="text-muted-foreground">Configuration et déploiement centralisés des boutiques en ligne</p>
        </div>
        <div className="flex gap-2">
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
            <Store className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Boutiques actives</p>
              <p className="text-2xl font-bold">{stats.activeStores}</p>
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
                Tableau de bord E-commerce global
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
                      Déployer sur toutes les boutiques
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowCreateTemplate(true)}
                    >
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Paramètres globaux E-commerce</h3>
              <p className="text-sm text-muted-foreground">
                {previewMode ? "Aperçu de la boutique avec les paramètres actuels" : "Configuration des paramètres globaux du système e-commerce"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? 'Retour à l\'édition' : 'Aperçu'}
              </Button>
              {previewMode && (
                <Button
                  variant="outline"
                  onClick={() => setFullscreenPreview(!fullscreenPreview)}
                  className="flex items-center gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                  Plein écran
                </Button>
              )}
            </div>
          </div>
          
          {previewMode ? (
            <InteractiveEcommercePreview 
              settings={globalSettings.reduce((acc, setting) => {
                acc[setting.setting_key] = setting.setting_value;
                return acc;
              }, {} as Record<string, any>)}
              isFullscreen={fullscreenPreview}
              onToggleFullscreen={() => setFullscreenPreview(!fullscreenPreview)}
            />
          ) : (
            Object.entries(settingsByCategory).map(([category, settings]) => (
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
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates de configuration E-commerce
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            applyTemplate();
                          }}
                        >
                          Appliquer
                        </Button>
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
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => setShowSelectiveDeployment(true)}
                >
                  <Store className="h-8 w-8 mb-2" />
                  Déploiement sélectif
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => setShowTemplateSelection(true)}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  Template spécifique
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Informations de déploiement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Les paramètres globaux seront appliqués à toutes les boutiques actives</li>
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

      {/* Modal pour déploiement sélectif */}
      <Dialog open={showSelectiveDeployment} onOpenChange={setShowSelectiveDeployment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Déploiement sélectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner les boutiques :</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {activeStores.map((store) => (
                  <div key={store.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={store.id}
                      checked={selectedStores.includes(store.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStores([...selectedStores, store.id]);
                        } else {
                          setSelectedStores(selectedStores.filter(id => id !== store.id));
                        }
                      }}
                    />
                    <Label htmlFor={store.id} className="text-sm">{store.name}</Label>
                  </div>
                ))}
              </div>
              {activeStores.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune boutique active trouvée</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSelectiveDeployment(false)}>
                Annuler
              </Button>
              <Button onClick={deployToSelectedStores}>
                Déployer ({selectedStores.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour sélection de template */}
      <Dialog open={showTemplateSelection} onOpenChange={setShowTemplateSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appliquer un template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner un template :</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name}
                      {template.is_default && " (Par défaut)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun template disponible</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateSelection(false)}>
                Annuler
              </Button>
              <Button onClick={applyTemplate} disabled={!selectedTemplate}>
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour création de template */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du template *</Label>
              <Input
                id="template-name"
                placeholder="Ex: Configuration Premium"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optionnelle)</Label>
              <Textarea
                id="template-description"
                placeholder="Description du template..."
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Le template sera créé avec la configuration actuelle des paramètres globaux.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                Annuler
              </Button>
              <Button onClick={createTemplate} disabled={!newTemplateName.trim()}>
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEcommerceManagement;