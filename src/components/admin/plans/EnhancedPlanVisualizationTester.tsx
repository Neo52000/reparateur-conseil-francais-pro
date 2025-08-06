import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { useSortableWidgets, SortableWidget as SortableWidgetType } from '@/hooks/useSortableWidgets';
import { SortableContainer } from '@/components/admin/builder/SortableContainer';
import { 
  Save, 
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Settings,
  Undo,
  Redo,
  Plus,
  Layout,
  Palette,
  Zap
} from 'lucide-react';
import SubscriptionPlans from '@/components/SubscriptionPlans';

interface PlanVisualizationConfig {
  layout: 'grid' | 'card' | 'list' | 'comparison';
  columns: number;
  spacing: string;
  colorScheme: 'professional' | 'vibrant' | 'minimal' | 'dark';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    titleSize: string;
    bodySize: string;
    fontWeight: string;
  };
  effects: {
    animations: boolean;
    shadows: boolean;
    gradients: boolean;
    borderRadius: string;
  };
  features: {
    showFeatures: boolean;
    showPricing: boolean;
    showCTA: boolean;
    highlightPopular: boolean;
  };
}

// Widget types pour les plans
const planWidgetTypes = [
  { id: 'basic-plan', name: 'Plan Basique', category: 'Plans', type: 'plan-card' },
  { id: 'premium-plan', name: 'Plan Premium', category: 'Plans', type: 'plan-card' },
  { id: 'enterprise-plan', name: 'Plan Entreprise', category: 'Plans', type: 'plan-card' },
  { id: 'features-list', name: 'Liste des fonctionnalités', category: 'Content', type: 'features' },
  { id: 'comparison-table', name: 'Tableau comparatif', category: 'Content', type: 'comparison' },
  { id: 'pricing-calculator', name: 'Calculateur de prix', category: 'Interactive', type: 'calculator' },
  { id: 'testimonials', name: 'Témoignages', category: 'Social', type: 'testimonials' },
  { id: 'faq-section', name: 'FAQ', category: 'Content', type: 'faq' }
];

const defaultConfig: PlanVisualizationConfig = {
  layout: 'grid',
  columns: 3,
  spacing: 'clamp(1rem, 2vw, 2rem)',
  colorScheme: 'professional',
  customColors: {
    primary: 'hsl(222, 84%, 4.9%)',
    secondary: 'hsl(210, 40%, 96%)',
    accent: 'hsl(142, 76%, 36%)',
    background: 'hsl(0, 0%, 100%)',
    text: 'hsl(222.2, 84%, 4.9%)',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    titleSize: 'clamp(1.25rem, 2.5vw, 2rem)',
    bodySize: 'clamp(0.875rem, 1.5vw, 1rem)',
    fontWeight: '500',
  },
  effects: {
    animations: true,
    shadows: true,
    gradients: false,
    borderRadius: 'clamp(0.5rem, 1vw, 1rem)',
  },
  features: {
    showFeatures: true,
    showPricing: true,
    showCTA: true,
    highlightPopular: true,
  },
};

export const EnhancedPlanVisualizationTester: React.FC = () => {
  const [config, setConfig] = useState<PlanVisualizationConfig>(defaultConfig);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [configName, setConfigName] = useState('');
  const [undoHistory, setUndoHistory] = useState<PlanVisualizationConfig[]>([]);
  const [redoHistory, setRedoHistory] = useState<PlanVisualizationConfig[]>([]);

  // Initialize sortable widgets
  const initialWidgets: SortableWidgetType[] = planWidgetTypes.map((widget, index) => ({
    id: widget.id,
    type: widget.type,
    name: widget.name,
    category: widget.category,
    config: {},
    isVisible: index < 4, // Show first 4 widgets by default
    order: index
  }));

  const sortableWidgets = useSortableWidgets(initialWidgets, {
    onLayoutChange: (widgets) => {
      console.log('Layout changed:', widgets);
    },
    onWidgetUpdate: (widget) => {
      console.log('Widget updated:', widget);
    }
  });
  
  const { toast } = useToast();
  const { saveConfiguration } = useUIConfigurations();

  // Track configuration changes for undo/redo
  const updateConfig = useCallback((updates: Partial<PlanVisualizationConfig>) => {
    setUndoHistory(prev => [...prev.slice(-9), config]);
    setRedoHistory([]);
    setConfig(prev => ({ ...prev, ...updates }));
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

  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un nom pour la configuration", variant: "destructive" });
      return;
    }
    
    await saveConfiguration({
      name: configName,
      type: 'plan_visualization',
      configuration: { config, widgets: sortableWidgets.widgets },
      is_active: true,
      description: `Configuration des plans - ${new Date().toLocaleDateString()}`,
      tags: ['plans', 'interface', 'subscription']
    });
    
    toast({ title: "Succès", description: "Configuration sauvegardée avec succès" });
    setConfigName('');
  };

  const getDeviceClasses = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const renderWidgetPreview = (widget: SortableWidgetType) => {
    switch (widget.type) {
      case 'plan-card':
        return (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-lg border text-center">
            <h4 className="font-semibold text-primary">{widget.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">Configuration du plan</p>
          </div>
        );
      case 'features':
        return (
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium">Fonctionnalités</h4>
            <div className="text-xs text-muted-foreground mt-1">Liste des avantages</div>
          </div>
        );
      default:
        return (
          <div className="bg-secondary/20 p-3 rounded-lg">
            <h4 className="font-medium">{widget.name}</h4>
            <div className="text-xs text-muted-foreground mt-1">Widget {widget.type}</div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Test Interface Plans</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layout className="h-4 w-4" />
              <span>Interface Elementor-like</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={undoHistory.length === 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={redoHistory.length === 0}>
              <Redo className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setDeviceView('desktop')}
                className="p-1.5"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setDeviceView('tablet')}
                className="p-1.5"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setDeviceView('mobile')}
                className="p-1.5"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Éditer' : 'Aperçu'}
            </Button>
            
            <Button size="sm" onClick={handleSaveConfiguration}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout - Elementor Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Widget Library */}
        {!isPreviewMode && (
          <div className="w-80 border-r bg-card overflow-y-auto">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Widgets Plans
                </h3>
                
                <div className="space-y-2">
                  {planWidgetTypes.map((widget) => (
                    <Card 
                      key={widget.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors p-3"
                      onClick={() => sortableWidgets.addWidget(widget.type, widget.name, widget.category)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{widget.name}</p>
                          <p className="text-xs text-muted-foreground">{widget.category}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Widgets Actifs</h3>
                <SortableContainer
                  widgets={sortableWidgets.widgets}
                  onDragEnd={sortableWidgets.handleDragEnd}
                  onWidgetSelect={sortableWidgets.setSelectedWidget}
                  onWidgetToggleVisibility={sortableWidgets.toggleWidgetVisibility}
                  onWidgetDuplicate={sortableWidgets.duplicateWidget}
                  onWidgetRemove={sortableWidgets.removeWidget}
                  selectedWidget={sortableWidgets.selectedWidget}
                  renderWidget={renderWidgetPreview}
                  compact={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Center Panel - Canvas */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className={`p-6 transition-all duration-300 ${getDeviceClasses()}`}>
            <div style={{
              fontFamily: config.typography.fontFamily,
              fontSize: config.typography.bodySize,
              '--spacing': config.spacing,
              '--border-radius': config.effects.borderRadius,
              '--title-size': config.typography.titleSize
            } as React.CSSProperties}>
              <SubscriptionPlans />
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        {!isPreviewMode && (
          <div className="w-80 border-l bg-card overflow-y-auto">
            <div className="p-4 space-y-4">
              {sortableWidgets.selectedWidget ? (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Propriétés
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Nom du widget</Label>
                      <Input 
                        value={sortableWidgets.selectedWidget.name}
                        onChange={(e) => sortableWidgets.updateWidget(
                          sortableWidgets.selectedWidget!.id, 
                          { name: e.target.value }
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label>Catégorie</Label>
                      <Badge variant="outline">{sortableWidgets.selectedWidget.category}</Badge>
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <Badge>{sortableWidgets.selectedWidget.type}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Configuration Globale
                  </h3>
                  
                  <Tabs defaultValue="layout" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                      <TabsTrigger value="fonts">Polices</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="layout" className="space-y-4">
                      <div>
                        <Label>Colonnes</Label>
                        <Input
                          type="number"
                          min="1"
                          max="6"
                          value={config.columns}
                          onChange={(e) => updateConfig({ columns: Number(e.target.value) })}
                        />
                      </div>
                      
                      <div>
                        <Label>Espacement (responsive)</Label>
                        <Input
                          value={config.spacing}
                          onChange={(e) => updateConfig({ spacing: e.target.value })}
                          placeholder="clamp(1rem, 2vw, 2rem)"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="style" className="space-y-4">
                      <div>
                        <Label>Couleur primaire</Label>
                        <Input
                          type="color"
                          value={config.customColors.primary}
                          onChange={(e) => updateConfig({
                            customColors: { ...config.customColors, primary: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label>Rayon des bordures (responsive)</Label>
                        <Input
                          value={config.effects.borderRadius}
                          onChange={(e) => updateConfig({
                            effects: { ...config.effects, borderRadius: e.target.value }
                          })}
                          placeholder="clamp(0.5rem, 1vw, 1rem)"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="fonts" className="space-y-4">
                      <div>
                        <Label>Famille de police</Label>
                        <Input
                          value={config.typography.fontFamily}
                          onChange={(e) => updateConfig({
                            typography: { ...config.typography, fontFamily: e.target.value }
                          })}
                          placeholder="system-ui, -apple-system, sans-serif"
                        />
                      </div>
                      
                      <div>
                        <Label>Taille titre (responsive)</Label>
                        <Input
                          value={config.typography.titleSize}
                          onChange={(e) => updateConfig({
                            typography: { ...config.typography, titleSize: e.target.value }
                          })}
                          placeholder="clamp(1.25rem, 2.5vw, 2rem)"
                        />
                      </div>
                      
                      <div>
                        <Label>Taille texte (responsive)</Label>
                        <Input
                          value={config.typography.bodySize}
                          onChange={(e) => updateConfig({
                            typography: { ...config.typography, bodySize: e.target.value }
                          })}
                          placeholder="clamp(0.875rem, 1.5vw, 1rem)"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              <Separator />
              
              <div>
                <Label>Nom de la configuration</Label>
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="Ma configuration plans"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};