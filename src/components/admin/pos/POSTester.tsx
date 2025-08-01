import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  CreditCard,
  Save, 
  Copy, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Settings,
  Undo,
  Redo,
  Layout,
  Printer,
  Receipt,
  Calculator,
  Package,
  Users,
  DollarSign,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSortableWidgets } from '@/hooks/useSortableWidgets';
import { SortableWidget } from '@/components/admin/builder/SortableWidget';
import { SortableContainer } from '@/components/admin/builder/SortableContainer';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import POSInterface from '@/components/pos/POSInterface';

// Configuration POS
interface POSConfiguration {
  layout: {
    orientation: 'portrait' | 'landscape';
    showSidebar: boolean;
    compactMode: boolean;
    gridSize: 'small' | 'medium' | 'large';
  };
  components: {
    calculator: { visible: boolean; position: 'left' | 'right' | 'bottom'; };
    quickActions: { visible: boolean; items: string[]; };
    customerDisplay: { visible: boolean; showDetails: boolean; };
    receiptPreview: { visible: boolean; autoRefresh: boolean; };
    inventoryInfo: { visible: boolean; showStock: boolean; };
    sessionInfo: { visible: boolean; compact: boolean; };
  };
  receipt: {
    template: 'standard' | 'compact' | 'detailed';
    showLogo: boolean;
    showQR: boolean;
    footerText: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  payments: {
    methods: string[];
    defaultMethod: string;
    requireSignature: boolean;
    tipOptions: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    darkMode: boolean;
    borderRadius: string;
    buttonSize: 'compact' | 'standard' | 'large';
  };
  features: {
    offlineMode: boolean;
    soundEffects: boolean;
    animations: boolean;
    keyboardShortcuts: boolean;
    multiSession: boolean;
    printerIntegration: boolean;
  };
}

const defaultPOSConfiguration: POSConfiguration = {
  layout: { orientation: 'landscape', showSidebar: true, compactMode: false, gridSize: 'medium' },
  components: {
    calculator: { visible: true, position: 'right' },
    quickActions: { visible: true, items: ['discount', 'void', 'hold', 'receipt'] },
    customerDisplay: { visible: true, showDetails: true },
    receiptPreview: { visible: true, autoRefresh: true },
    inventoryInfo: { visible: true, showStock: true },
    sessionInfo: { visible: true, compact: false }
  },
  receipt: { template: 'standard', showLogo: true, showQR: true, footerText: 'Merci de votre visite !', fontSize: 'medium' },
  payments: { methods: ['cash', 'card', 'mobile'], defaultMethod: 'card', requireSignature: false, tipOptions: true },
  theme: { primaryColor: '#0ea5e9', accentColor: '#10b981', darkMode: false, borderRadius: '0.5rem', buttonSize: 'standard' },
  features: { offlineMode: true, soundEffects: true, animations: true, keyboardShortcuts: true, multiSession: false, printerIntegration: true }
};

// Widgets POS spécifiques
const posWidgetTypes = [
  {
    id: 'sales-calculator',
    name: 'Calculatrice',
    icon: Calculator,
    category: 'Transaction',
    defaultConfig: { size: 'medium', position: 'right', numpad: true },
    component: ({ config }: any) => (
      <Card className="h-64">
        <CardHeader><CardTitle>Calculatrice POS</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[7,8,9,4,5,6,1,2,3,0].map(n => (
              <Button key={n} variant="outline" className="h-12">{n}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    id: 'payment-methods',
    name: 'Moyens de paiement',
    icon: CreditCard,
    category: 'Transaction',
    defaultConfig: { layout: 'grid', methods: ['cash', 'card', 'mobile'] },
    component: ({ config }: any) => (
      <Card>
        <CardHeader><CardTitle>Paiement</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Espèces</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-xs">Carte</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Smartphone className="h-6 w-6" />
              <span className="text-xs">Mobile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    id: 'quick-items',
    name: 'Articles rapides',
    icon: Package,
    category: 'Inventory',
    defaultConfig: { columns: 4, showPrices: true },
    component: ({ config }: any) => (
      <Card>
        <CardHeader><CardTitle>Articles populaires</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {['Écran iPhone', 'Batterie Samsung', 'Coque protection', 'Film protecteur'].map((item, i) => (
              <Button key={i} variant="outline" className="h-12 text-left justify-start">
                <div>
                  <div className="font-medium text-xs">{item}</div>
                  <div className="text-xs text-muted-foreground">{49 + i * 20}€</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    id: 'customer-info',
    name: 'Infos client',
    icon: Users,
    category: 'Customer',
    defaultConfig: { showHistory: true, compact: false },
    component: ({ config }: any) => (
      <Card>
        <CardHeader><CardTitle>Client actuel</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium">Marie Dubois</div>
            <div className="text-xs text-muted-foreground">Client fidèle • 12 achats</div>
            <Badge variant="outline">Réduction 10%</Badge>
            <div className="text-xs">📱 0123456789</div>
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    id: 'receipt-preview',
    name: 'Aperçu ticket',
    icon: Receipt,
    category: 'Transaction',
    defaultConfig: { template: 'standard', showTotal: true },
    component: ({ config }: any) => (
      <Card className="h-64">
        <CardHeader><CardTitle>Ticket de caisse</CardTitle></CardHeader>
        <CardContent>
          <div className="text-xs space-y-1 font-mono">
            <div className="text-center font-bold">RÉPARATIONS TECH</div>
            <div className="text-center">-------------------</div>
            <div className="flex justify-between">
              <span>Écran iPhone 13</span>
              <span>149.90€</span>
            </div>
            <div className="flex justify-between">
              <span>Main d'œuvre</span>
              <span>30.00€</span>
            </div>
            <div className="text-center">-------------------</div>
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>179.90€</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    id: 'session-status',
    name: 'Session caisse',
    icon: Clock,
    category: 'Management',
    defaultConfig: { showDetails: true, compact: false },
    component: ({ config }: any) => (
      <Card>
        <CardHeader><CardTitle>Session S001</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ouverture:</span>
              <span>09:00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Transactions:</span>
              <span>23</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>2,847.50€</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-green-600">En ligne</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
];

const POSTester: React.FC = () => {
  const [configuration, setConfiguration] = useState<POSConfiguration>(defaultPOSConfiguration);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [builderMode, setBuilderMode] = useState(false);
  const [undoStack, setUndoStack] = useState<POSConfiguration[]>([]);
  const [redoStack, setRedoStack] = useState<POSConfiguration[]>([]);
  const [configName, setConfigName] = useState('');
  
  // Initialize sortable widgets hook
  const {
    widgets,
    selectedWidget,
    setSelectedWidget,
    handleDragEnd,
    addWidget,
    updateWidget,
    removeWidget,
    toggleWidgetVisibility,
    duplicateWidget
  } = useSortableWidgets(
    posWidgetTypes.map((widget, index) => ({
      id: widget.id,
      type: widget.id,
      name: widget.name,
      category: widget.category,
      config: widget.defaultConfig,
      isVisible: true,
      order: index
    })),
    {
      onLayoutChange: (newWidgets) => {
        console.log('Layout changed:', newWidgets);
      }
    }
  );
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  const { toast } = useToast();
  const { configurations, saveConfiguration, cloneConfiguration, trackAnalyticsEvent } = useUIConfigurations();
  
  // Auto-save avec feedback visuel
  const { isSaving: isAutoSaving, lastSaved: autoSaveTime, forceSave } = useAutoSave({
    data: configuration,
    onSave: async (config) => {
      if (configName.trim()) {
        await saveConfiguration({
          name: configName,
          type: 'pos_interface',
          configuration: config,
          is_active: true,
          description: `Auto-sauvegarde POS - ${new Date().toLocaleString()}`,
          tags: ['pos', 'interface', 'auto-save']
        });
      }
    },
    delay: 5000,
    enabled: !!configName.trim()
  });

  const pushToUndoStack = useCallback((config: POSConfiguration) => {
    setUndoStack(prev => [...prev.slice(-9), config]);
    setRedoStack([]);
  }, []);

  const updateConfiguration = useCallback((updates: Partial<POSConfiguration>) => {
    setConfiguration(prev => {
      pushToUndoStack(prev);
      const newConfig = { ...prev, ...updates };
      trackAnalyticsEvent('pos_config_changed', { changes: Object.keys(updates), timestamp: Date.now() });
      return newConfig;
    });
  }, [pushToUndoStack, trackAnalyticsEvent]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousConfig = undoStack[undoStack.length - 1];
      setRedoStack(prev => [configuration, ...prev]);
      setConfiguration(previousConfig);
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [undoStack, configuration]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextConfig = redoStack[0];
      setUndoStack(prev => [...prev, configuration]);
      setConfiguration(nextConfig);
      setRedoStack(prev => prev.slice(1));
    }
  }, [redoStack, configuration]);

  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un nom pour la configuration", variant: "destructive" });
      return;
    }
    await saveConfiguration({
      name: configName,
      type: 'pos_interface',
      configuration,
      is_active: true,
      description: `Configuration POS - ${new Date().toLocaleDateString()}`,
      tags: ['pos', 'interface', 'caisse']
    });
    setConfigName('');
    toast({ title: "Succès", description: "Configuration POS sauvegardée avec succès" });
  };

  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const posConfigs = configurations.filter(config => config.type === 'pos_interface');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Testeur Interface POS
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configurez et testez l'interface de point de vente</p>
          {isAutoSaving && (
            <div className="flex items-center gap-2 mt-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              <span className="text-xs text-muted-foreground">Sauvegarde en cours...</span>
            </div>
          )}
          {autoSaveTime && (
            <p className="text-xs text-green-600 mt-1">
              Dernière sauvegarde: {autoSaveTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setBuilderMode(!builderMode)}
          >
            <Layout className="h-4 w-4 mr-2" />
            {builderMode ? 'Mode Simple' : 'Builder Avancé'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Éditer' : 'Aperçu'}
          </Button>
        </div>
      </div>

      {/* Mode Builder Avancé */}
      {builderMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Widget Library Panel */}
          <div className="lg:col-span-3 bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Widgets POS</h3>
              <p className="text-sm text-muted-foreground">Cliquez pour ajouter</p>
            </div>
            <div className="p-4 space-y-2 max-h-[calc(100%-80px)] overflow-y-auto">
              {posWidgetTypes.map((widget) => (
                <div
                  key={widget.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-accent flex items-center gap-3"
                  onClick={() => addWidget(widget.id, widget.name, widget.category, widget.defaultConfig)}
                >
                  <widget.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">{widget.name}</div>
                    <div className="text-xs text-muted-foreground">{widget.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Panel */}
          <div className="lg:col-span-6 bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Canvas POS</h3>
              <p className="text-sm text-muted-foreground">Zone de construction</p>
            </div>
            <div className="p-4 min-h-[400px]">
              {widgets.filter(w => w.isVisible).length > 0 ? (
                <SortableContainer
                  widgets={widgets.filter(w => w.isVisible)}
                  onDragEnd={handleDragEnd}
                  onWidgetSelect={setSelectedWidget}
                  onWidgetToggleVisibility={toggleWidgetVisibility}
                  onWidgetDuplicate={duplicateWidget}
                  onWidgetRemove={removeWidget}
                  selectedWidget={selectedWidget}
                  renderWidget={(widget) => {
                    const widgetDef = posWidgetTypes.find(w => w.id === widget.type);
                    if (!widgetDef) return null;
                    return <widgetDef.component config={widget.config} />;
                  }}
                  className="space-y-4"
                />
              ) : (
                <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <p className="text-muted-foreground">Cliquez sur des widgets pour commencer</p>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-3 bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Propriétés</h3>
              {selectedWidget && (
                <p className="text-sm text-muted-foreground">{selectedWidget.name}</p>
              )}
            </div>
            <div className="p-4 space-y-4">
              {selectedWidget ? (
                <>
                  <div>
                    <Label>Nom du widget</Label>
                    <Input
                      value={selectedWidget.name}
                      onChange={(e) => updateWidget(selectedWidget.id, { name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Visible</Label>
                    <input
                      type="checkbox"
                      checked={selectedWidget.isVisible}
                      onChange={() => toggleWidgetVisibility(selectedWidget.id)}
                      className="rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateWidget(selectedWidget.id)}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Dupliquer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        removeWidget(selectedWidget.id);
                        setSelectedWidget(null);
                      }}
                      className="w-full"
                    >
                      Supprimer
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Sélectionnez un widget pour voir ses propriétés</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {!isPreviewMode && (
            <div className="xl:col-span-1 order-2 xl:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration POS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="layout" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                      <TabsTrigger value="layout" className="text-xs sm:text-sm">Layout</TabsTrigger>
                      <TabsTrigger value="components" className="text-xs sm:text-sm">Modules</TabsTrigger>
                      <TabsTrigger value="receipt" className="text-xs sm:text-sm">Ticket</TabsTrigger>
                      <TabsTrigger value="features" className="text-xs sm:text-sm">Options</TabsTrigger>
                    </TabsList>

                    <TabsContent value="layout" className="space-y-4">
                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <select
                          id="orientation"
                          value={configuration.layout.orientation}
                          onChange={(e) => updateConfiguration({
                            layout: { ...configuration.layout, orientation: e.target.value as 'portrait' | 'landscape' }
                          })}
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="landscape">Paysage</option>
                          <option value="portrait">Portrait</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showSidebar">Panneau latéral</Label>
                        <input
                          id="showSidebar"
                          type="checkbox"
                          checked={configuration.layout.showSidebar}
                          onChange={(e) => updateConfiguration({
                            layout: { ...configuration.layout, showSidebar: e.target.checked }
                          })}
                          className="rounded"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Modules POS</h4>
                        {Object.entries(configuration.components).map(([key, component]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label htmlFor={key} className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <input
                              id={key}
                              type="checkbox"
                              checked={component.visible}
                              onChange={(e) => updateConfiguration({
                                components: {
                                  ...configuration.components,
                                  [key]: { ...component, visible: e.target.checked }
                                }
                              })}
                              className="rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="receipt" className="space-y-4">
                      <div>
                        <Label htmlFor="receiptTemplate">Template ticket</Label>
                        <select
                          id="receiptTemplate"
                          value={configuration.receipt.template}
                          onChange={(e) => updateConfiguration({
                            receipt: { ...configuration.receipt, template: e.target.value as 'standard' | 'compact' | 'detailed' }
                          })}
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="standard">Standard</option>
                          <option value="compact">Compact</option>
                          <option value="detailed">Détaillé</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="footerText">Texte de pied</Label>
                        <Input
                          id="footerText"
                          value={configuration.receipt.footerText}
                          onChange={(e) => updateConfiguration({
                            receipt: { ...configuration.receipt, footerText: e.target.value }
                          })}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Fonctionnalités</h4>
                        {Object.entries(configuration.features).map(([key, enabled]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label htmlFor={key} className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <input
                              id={key}
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => updateConfiguration({
                                features: { ...configuration.features, [key]: e.target.checked }
                              })}
                              className="rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="configName">Nom de la configuration</Label>
                      <Input
                        id="configName"
                        placeholder="Ma configuration POS"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveConfiguration} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>

                  {posConfigs.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold mb-2">Configurations POS</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {posConfigs.map((config) => (
                              <div key={config.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{config.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(config.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => setConfiguration(config.configuration as POSConfiguration)}
                                  >
                                    <CreditCard className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => cloneConfiguration(config.id, `${config.name} - Copie`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className={isPreviewMode ? 'col-span-1 xl:col-span-3 order-1' : 'xl:col-span-2 order-1 xl:order-2'}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Aperçu Interface POS
                  </CardTitle>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <Button
                      size="sm"
                      variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                      onClick={() => setPreviewDevice('desktop')}
                      className="p-1 sm:p-2"
                    >
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                      onClick={() => setPreviewDevice('tablet')}
                      className="p-1 sm:p-2"
                    >
                      <Tablet className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                      onClick={() => setPreviewDevice('mobile')}
                      className="p-1 sm:p-2"
                    >
                      <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${getDeviceClasses()} border rounded-lg overflow-hidden`}>
                  <div className="min-h-[600px] bg-background" style={{
                    '--primary': configuration.theme.primaryColor,
                    '--accent': configuration.theme.accentColor,
                    '--border-radius': configuration.theme.borderRadius,
                  } as React.CSSProperties}>
                    <POSInterface />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSTester;