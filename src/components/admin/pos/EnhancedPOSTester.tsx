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
  CreditCard,
  Calculator,
  Package,
  Users,
  Receipt,
  Clock,
  DollarSign,
  Wifi,
  ShoppingCart
} from 'lucide-react';
import POSInterface from '@/components/pos/POSInterface';

interface POSConfiguration {
  layout: 'compact' | 'standard' | 'extended';
  theme: 'light' | 'dark' | 'auto';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  components: {
    calculator: boolean;
    quickItems: boolean;
    customerInfo: boolean;
    receiptPreview: boolean;
    sessionStatus: boolean;
    paymentMethods: boolean;
  };
  features: {
    offlineMode: boolean;
    soundEffects: boolean;
    animations: boolean;
    printerIntegration: boolean;
  };
}

// Widget types pour POS
const posWidgetTypes = [
  { id: 'sales-calculator', name: 'Calculatrice POS', category: 'Transaction', type: 'calculator' },
  { id: 'payment-methods', name: 'Moyens de paiement', category: 'Transaction', type: 'payment' },
  { id: 'quick-items', name: 'Articles rapides', category: 'Inventory', type: 'quick-items' },
  { id: 'customer-info', name: 'Infos client', category: 'Customer', type: 'customer' },
  { id: 'receipt-preview', name: 'Aperçu ticket', category: 'Transaction', type: 'receipt' },
  { id: 'session-status', name: 'Statut session', category: 'Management', type: 'session' },
  { id: 'inventory-quick', name: 'Stock rapide', category: 'Inventory', type: 'inventory' },
  { id: 'sales-stats', name: 'Stats ventes', category: 'Analytics', type: 'stats' }
];

const defaultConfig: POSConfiguration = {
  layout: 'standard',
  theme: 'light',
  customColors: {
    primary: 'hsl(222, 84%, 4.9%)',
    secondary: 'hsl(210, 40%, 96%)',
    accent: 'hsl(142, 76%, 36%)',
    background: 'hsl(0, 0%, 100%)',
    text: 'hsl(222.2, 84%, 4.9%)',
  },
  components: {
    calculator: true,
    quickItems: true,
    customerInfo: true,
    receiptPreview: true,
    sessionStatus: true,
    paymentMethods: true,
  },
  features: {
    offlineMode: true,
    soundEffects: true,
    animations: true,
    printerIntegration: true,
  },
};

export const EnhancedPOSTester: React.FC = () => {
  const [config, setConfig] = useState<POSConfiguration>(defaultConfig);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [configName, setConfigName] = useState('');
  const [undoHistory, setUndoHistory] = useState<POSConfiguration[]>([]);
  const [redoHistory, setRedoHistory] = useState<POSConfiguration[]>([]);

  // Initialize sortable widgets
  const initialWidgets: SortableWidgetType[] = posWidgetTypes.map((widget, index) => ({
    id: widget.id,
    type: widget.type,
    name: widget.name,
    category: widget.category,
    config: {},
    isVisible: index < 6, // Show first 6 widgets by default
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
  const updateConfig = useCallback((updates: Partial<POSConfiguration>) => {
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
      type: 'pos_interface',
      configuration: { config, widgets: sortableWidgets.widgets },
      is_active: true,
      description: `Configuration POS - ${new Date().toLocaleDateString()}`,
      tags: ['pos', 'interface', 'caisse']
    });
    
    toast({ title: "Succès", description: "Configuration POS sauvegardée avec succès" });
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
      case 'calculator':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border text-center">
            <Calculator className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-800">{widget.name}</h4>
            <p className="text-xs text-blue-600 mt-1">Calculatrice POS</p>
          </div>
        );
      case 'payment':
        return (
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border text-center">
            <CreditCard className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <h4 className="font-semibold text-green-800">{widget.name}</h4>
            <p className="text-xs text-green-600 mt-1">Méthodes de paiement</p>
          </div>
        );
      case 'quick-items':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border text-center">
            <Package className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <h4 className="font-semibold text-purple-800">{widget.name}</h4>
            <p className="text-xs text-purple-600 mt-1">Articles populaires</p>
          </div>
        );
      case 'customer':
        return (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border text-center">
            <Users className="h-6 w-6 mx-auto text-orange-600 mb-2" />
            <h4 className="font-semibold text-orange-800">{widget.name}</h4>
            <p className="text-xs text-orange-600 mt-1">Informations client</p>
          </div>
        );
      default:
        return (
          <div className="bg-muted p-3 rounded-lg border text-center">
            <ShoppingCart className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <h4 className="font-medium">{widget.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">Widget {widget.type}</p>
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
            <h1 className="text-lg font-semibold">Test Interface POS</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
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
                  Widgets POS
                </h3>
                
                <div className="space-y-2">
                  {posWidgetTypes.map((widget) => (
                    <Card 
                      key={widget.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors p-3"
                      onClick={() => sortableWidgets.addWidget(widget.type, widget.name, widget.category)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
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
              '--primary': config.customColors.primary,
              '--secondary': config.customColors.secondary,
              '--accent': config.customColors.accent,
              '--background': config.customColors.background,
              '--text': config.customColors.text
            } as React.CSSProperties}>
              <POSInterface />
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
                    <Layout className="h-4 w-4" />
                    Configuration Globale
                  </h3>
                  
                  <Tabs defaultValue="layout" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="theme">Thème</TabsTrigger>
                      <TabsTrigger value="save">Sauvegarde</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="layout" className="space-y-4">
                      <div>
                        <Label>Mode d'affichage</Label>
                        <div className="flex gap-2 mt-2">
                          {(['compact', 'standard', 'extended'] as const).map((layout) => (
                            <Button
                              key={layout}
                              size="sm"
                              variant={config.layout === layout ? 'default' : 'outline'}
                              onClick={() => updateConfig({ layout })}
                            >
                              {layout}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="theme" className="space-y-4">
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
                        <Label>Couleur d'accent</Label>
                        <Input
                          type="color"
                          value={config.customColors.accent}
                          onChange={(e) => updateConfig({
                            customColors: { ...config.customColors, accent: e.target.value }
                          })}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="save" className="space-y-4">
                      <div>
                        <Label>Nom de la configuration</Label>
                        <Input
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          placeholder="Ma config POS"
                        />
                      </div>
                      
                      <Button onClick={handleSaveConfiguration} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};