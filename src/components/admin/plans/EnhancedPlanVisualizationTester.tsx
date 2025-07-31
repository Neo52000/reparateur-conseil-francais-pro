import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { 
  Save, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Monitor,
  Smartphone,
  Tablet,
  Palette,
  BarChart3,
  Eye,
  Settings,
  History,
  GitBranch,
  MousePointer,
  Zap,
  Target,
  TrendingUp,
  Layout,
  Wand2,
  Search,
  Tag,
  Calendar
} from 'lucide-react';
import SubscriptionPlans from '@/components/SubscriptionPlans';

interface PlanVisualizationConfig {
  // Layout
  layout: 'grid' | 'card' | 'list' | 'slider';
  columns: number;
  spacing: number;
  
  // Colors & Theme
  colorScheme: 'professional' | 'vibrant' | 'minimal' | 'dark' | 'custom' | 'christmas' | 'summer';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  
  // Animation
  animations: boolean;
  animationType: 'fade' | 'slide' | 'zoom' | 'bounce';
  animationDuration: number;
  
  // Effects
  shadows: boolean;
  gradients: boolean;
  borderRadius: number;
  
  // Content
  showFeatures: boolean;
  showPricing: boolean;
  showCTA: boolean;
  highlightPopular: boolean;
  
  // Special Features
  seasonalTheme: boolean;
  comparisonMode: boolean;
  interactiveElements: boolean;
  
  // Advanced
  cssOverrides: string;
  customCSS: string;
}

const defaultConfig: PlanVisualizationConfig = {
  layout: 'grid',
  columns: 3,
  spacing: 20,
  colorScheme: 'professional',
  customColors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
  },
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  animations: true,
  animationType: 'fade',
  animationDuration: 300,
  shadows: true,
  gradients: false,
  borderRadius: 8,
  showFeatures: true,
  showPricing: true,
  showCTA: true,
  highlightPopular: true,
  seasonalTheme: false,
  comparisonMode: false,
  interactiveElements: true,
  cssOverrides: '',
  customCSS: '',
};

const colorSchemes = {
  professional: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
  },
  vibrant: {
    primary: '#ef4444',
    secondary: '#f97316',
    accent: '#eab308',
    background: '#fef2f2',
    text: '#1f2937',
  },
  minimal: {
    primary: '#000000',
    secondary: '#6b7280',
    accent: '#374151',
    background: '#ffffff',
    text: '#111827',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#34d399',
    background: '#111827',
    text: '#f9fafb',
  },
  christmas: {
    primary: '#dc2626',
    secondary: '#16a34a',
    accent: '#facc15',
    background: '#fef2f2',
    text: '#1f2937',
  },
  summer: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    background: '#eff6ff',
    text: '#1e40af',
  },
};

export const EnhancedPlanVisualizationTester: React.FC = () => {
  const [config, setConfig] = useState<PlanVisualizationConfig>(defaultConfig);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonConfig, setComparisonConfig] = useState<PlanVisualizationConfig>(defaultConfig);
  const [undoHistory, setUndoHistory] = useState<PlanVisualizationConfig[]>([]);
  const [redoHistory, setRedoHistory] = useState<PlanVisualizationConfig[]>([]);
  
  const { toast } = useToast();
  const {
    configurations,
    templates,
    themes,
    abTests,
    loading,
    saveConfiguration,
    deleteConfiguration,
    cloneConfiguration,
    createABTest,
    trackAnalyticsEvent,
    refetch
  } = useUIConfigurations();

  // Real subscription plans from Supabase
  const [realPlans, setRealPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly', { ascending: true });
        
        if (error) throw error;
        setRealPlans(data || []);
      } catch (err) {
        console.error('Error fetching real plans:', err);
      }
    };
    
    fetchRealPlans();
  }, []);

  // Track configuration changes for undo/redo
  const saveToHistory = useCallback((newConfig: PlanVisualizationConfig) => {
    setUndoHistory(prev => [...prev.slice(-9), config]);
    setRedoHistory([]);
    setConfig(newConfig);
  }, [config]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (undoHistory.length > 0) {
      const previousConfig = undoHistory[undoHistory.length - 1];
      setRedoHistory(prev => [config, ...prev]);
      setUndoHistory(prev => prev.slice(0, -1));
      setConfig(previousConfig);
    }
  }, [config, undoHistory]);

  const redo = useCallback(() => {
    if (redoHistory.length > 0) {
      const nextConfig = redoHistory[0];
      setUndoHistory(prev => [...prev, config]);
      setRedoHistory(prev => prev.slice(1));
      setConfig(nextConfig);
    }
  }, [config, redoHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSaveConfiguration();
            break;
          case 'p':
            e.preventDefault();
            setIsPreviewMode(!isPreviewMode);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isPreviewMode]);

  const updateConfig = useCallback((updates: Partial<PlanVisualizationConfig>) => {
    const newConfig = { ...config, ...updates };
    saveToHistory(newConfig);
    
    // Track analytics
    trackAnalyticsEvent('config_change', {
      changes: updates,
      timestamp: Date.now(),
    }, currentConfigId || undefined);
  }, [config, saveToHistory, trackAnalyticsEvent, currentConfigId]);

  const applyColorScheme = useCallback((scheme: string) => {
    if (scheme === 'custom') return;
    
    updateConfig({
      colorScheme: scheme as any,
      customColors: colorSchemes[scheme as keyof typeof colorSchemes],
    });
  }, [updateConfig]);

  const applyTemplate = useCallback((template: any) => {
    const templateConfig = template.template_data as PlanVisualizationConfig;
    saveToHistory(templateConfig);
    
    // Increment usage count
    supabase
      .from('ui_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', template.id);
      
    trackAnalyticsEvent('template_applied', {
      templateId: template.id,
      templateName: template.name,
    });
  }, [saveToHistory, trackAnalyticsEvent]);

  const handleSaveConfiguration = useCallback(async () => {
    const name = prompt('Nom de la configuration:');
    if (!name) return;

    await saveConfiguration({
      id: currentConfigId || undefined,
      name,
      type: 'plan_visualization',
      configuration: config,
      is_active: false,
      description: `Configuration des plans d'abonnement - ${new Date().toLocaleDateString()}`,
      tags: ['plan_visualization', 'admin_tool'],
    });
  }, [config, currentConfigId, saveConfiguration]);

  const handleLoadConfiguration = useCallback((configId: string) => {
    const configuration = configurations.find(c => c.id === configId);
    if (configuration) {
      setCurrentConfigId(configId);
      saveToHistory(configuration.configuration as PlanVisualizationConfig);
      
      trackAnalyticsEvent('config_loaded', {
        configId,
        configName: configuration.name,
      });
    }
  }, [configurations, saveToHistory, trackAnalyticsEvent]);

  const handleCreateABTest = useCallback(async () => {
    if (!currentConfigId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sauvegarder une configuration",
        variant: "destructive",
      });
      return;
    }

    const variantName = prompt('Nom de la variante:');
    if (!variantName) return;

    // Create variant configuration
    try {
      await saveConfiguration({
        name: variantName,
        type: 'plan_visualization',
        configuration: comparisonConfig,
        is_active: false,
        description: `Variante pour test A/B`,
        tags: ['ab_test', 'variant'],
      });

      await createABTest({
        name: `Test A/B - ${new Date().toLocaleDateString()}`,
        description: 'Test de configuration des plans d\'abonnement',
        control_config_id: currentConfigId,
        variant_config_id: 'variant-config-id',
        status: 'draft',
        traffic_split: 0.5,
        target_audience: {},
        success_metrics: {
          conversion_rate: true,
          click_through_rate: true,
          engagement_time: true,
        },
      });
    } catch (error) {
      console.error('Error creating A/B test:', error);
    }
  }, [currentConfigId, comparisonConfig, saveConfiguration, createABTest, toast]);

  const generateCSS = useCallback(() => {
    const { customColors, fontFamily, fontSize, borderRadius } = config;
    
    return `
/* Generated CSS for Plan Visualization */
:root {
  --plan-primary: ${customColors.primary};
  --plan-secondary: ${customColors.secondary};
  --plan-accent: ${customColors.accent};
  --plan-background: ${customColors.background};
  --plan-text: ${customColors.text};
  --plan-font-family: ${fontFamily};
  --plan-font-size: ${fontSize}px;
  --plan-border-radius: ${borderRadius}px;
}

.plan-container {
  font-family: var(--plan-font-family);
  font-size: var(--plan-font-size);
  background: var(--plan-background);
  color: var(--plan-text);
  border-radius: var(--plan-border-radius);
}

.plan-card {
  background: var(--plan-background);
  border: 1px solid var(--plan-secondary);
  border-radius: var(--plan-border-radius);
  ${config.shadows ? 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' : ''}
  ${config.animations ? 'transition: all 0.3s ease;' : ''}
}

.plan-card:hover {
  ${config.animations ? 'transform: translateY(-2px);' : ''}
  ${config.shadows ? 'box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);' : ''}
}

.plan-button {
  background: var(--plan-primary);
  color: white;
  border: none;
  border-radius: var(--plan-border-radius);
  padding: 12px 24px;
  font-family: var(--plan-font-family);
  ${config.animations ? 'transition: all 0.2s ease;' : ''}
}

.plan-button:hover {
  background: var(--plan-accent);
  ${config.animations ? 'transform: scale(1.02);' : ''}
}

${config.customCSS}
    `.trim();
  }, [config]);

  const exportConfiguration = useCallback(() => {
    const exportData = {
      configuration: config,
      css: generateCSS(),
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0',
        type: 'plan_visualization',
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-config-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    trackAnalyticsEvent('config_exported', {
      timestamp: Date.now(),
    });
  }, [config, generateCSS, trackAnalyticsEvent]);

  const deviceViewStyles = useMemo(() => {
    switch (deviceView) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      default:
        return { width: '100%' };
    }
  }, [deviceView]);

  const filteredConfigurations = useMemo(() => {
    return configurations
      .filter(c => c.type === 'plan_visualization')
      .filter(c => 
        searchQuery === '' || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(c => 
        selectedTags.length === 0 ||
        selectedTags.every(tag => c.tags.includes(tag))
      );
  }, [configurations, searchQuery, selectedTags]);

  const planVisualizationTemplates = templates.filter(t => t.category === 'plan_visualization');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Interface Plans d'Abonnement</h2>
          <p className="text-muted-foreground">
            Configurez et testez l'affichage des plans d'abonnement en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={undoHistory.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={redoHistory.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2 scale-x-[-1]" />
            Rétablir
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Édition' : 'Aperçu'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportConfiguration}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Button
            onClick={handleSaveConfiguration}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        {!isPreviewMode && (
          <div className="lg:col-span-1 space-y-4">
            <Tabs defaultValue="design" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="saved">Sauvé</TabsTrigger>
                <TabsTrigger value="advanced">Avancé</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                {/* Layout Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Disposition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Type de grille</Label>
                      <Select
                        value={config.layout}
                        onValueChange={(value) => updateConfig({ layout: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grille</SelectItem>
                          <SelectItem value="card">Cartes</SelectItem>
                          <SelectItem value="list">Liste</SelectItem>
                          <SelectItem value="slider">Carrousel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Colonnes: {config.columns}</Label>
                      <Slider
                        value={[config.columns]}
                        onValueChange={([value]) => updateConfig({ columns: value })}
                        min={1}
                        max={4}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Espacement: {config.spacing}px</Label>
                      <Slider
                        value={[config.spacing]}
                        onValueChange={([value]) => updateConfig({ spacing: value })}
                        min={10}
                        max={50}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Color Scheme */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Couleurs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Schéma de couleurs</Label>
                      <Select
                        value={config.colorScheme}
                        onValueChange={(value) => applyColorScheme(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professionnel</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="christmas">Noël</SelectItem>
                          <SelectItem value="summer">Été</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {config.colorScheme === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Primaire</Label>
                          <Input
                            type="color"
                            value={config.customColors.primary}
                            onChange={(e) => updateConfig({
                              customColors: { ...config.customColors, primary: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Accent</Label>
                          <Input
                            type="color"
                            value={config.customColors.accent}
                            onChange={(e) => updateConfig({
                              customColors: { ...config.customColors, accent: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Animation & Effects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Animations & Effets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Animations</Label>
                      <Switch
                        checked={config.animations}
                        onCheckedChange={(checked) => updateConfig({ animations: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Ombres</Label>
                      <Switch
                        checked={config.shadows}
                        onCheckedChange={(checked) => updateConfig({ shadows: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Dégradés</Label>
                      <Switch
                        checked={config.gradients}
                        onCheckedChange={(checked) => updateConfig({ gradients: checked })}
                      />
                    </div>

                    <div>
                      <Label>Arrondi: {config.borderRadius}px</Label>
                      <Slider
                        value={[config.borderRadius]}
                        onValueChange={([value]) => updateConfig({ borderRadius: value })}
                        min={0}
                        max={20}
                        step={2}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Templates */}
                {planVisualizationTemplates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Templates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {planVisualizationTemplates.slice(0, 3).map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => applyTemplate(template)}
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          {template.name}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                {/* Search and Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Saved Configurations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Configurations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredConfigurations.map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{config.name}</p>
                          <p className="text-xs text-muted-foreground">
                            v{config.version} • {new Date(config.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadConfiguration(config.id)}
                          >
                            <Upload className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cloneConfiguration(config.id, `${config.name} (copie)`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* A/B Tests */}
                {abTests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tests A/B</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {abTests.slice(0, 3).map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{test.name}</p>
                            <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                              {test.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* A/B Testing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Test A/B</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Mode comparaison</Label>
                      <Switch
                        checked={showComparison}
                        onCheckedChange={setShowComparison}
                      />
                    </div>
                    
                    {showComparison && (
                      <Button
                        onClick={handleCreateABTest}
                        disabled={!currentConfigId}
                        className="w-full"
                      >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Créer Test A/B
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enregistrement</Label>
                      <Switch
                        checked={isRecording}
                        onCheckedChange={setIsRecording}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        trackAnalyticsEvent('manual_analytics_view', {
                          timestamp: Date.now(),
                          configId: currentConfigId,
                        });
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Voir métriques
                    </Button>
                  </CardContent>
                </Card>

                {/* Custom CSS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">CSS Personnalisé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="/* CSS personnalisé */"
                      value={config.customCSS}
                      onChange={(e) => updateConfig({ customCSS: e.target.value })}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Preview Panel */}
        <div className={isPreviewMode ? "lg:col-span-4" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aperçu temps réel</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeviceView('desktop')}
                    className={deviceView === 'desktop' ? 'bg-accent' : ''}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeviceView('tablet')}
                    className={deviceView === 'tablet' ? 'bg-accent' : ''}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeviceView('mobile')}
                    className={deviceView === 'mobile' ? 'bg-accent' : ''}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={deviceViewStyles}>
                <style>
                  {generateCSS()}
                </style>
                
                {showComparison ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Configuration A (Contrôle)</h3>
                      <div className="border rounded-lg p-4">
                        <SubscriptionPlans 
                          repairerId="test"
                          userEmail="test@example.com"
                          showBackButton={false}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Configuration B (Variante)</h3>
                      <div className="border rounded-lg p-4">
                        <SubscriptionPlans 
                          repairerId="test"
                          userEmail="test@example.com"
                          showBackButton={false}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <SubscriptionPlans 
                    repairerId="test"
                    userEmail="test@example.com"
                    showBackButton={false}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Configurations: {configurations.length}</span>
          <span>Templates: {planVisualizationTemplates.length}</span>
          <span>Tests A/B: {abTests.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Target className="h-3 w-3 mr-1" />
              Enregistrement
            </Badge>
          )}
          
          <span>Ctrl+Z: Annuler • Ctrl+S: Sauvegarder • Ctrl+P: Aperçu</span>
        </div>
      </div>
    </div>
  );
};