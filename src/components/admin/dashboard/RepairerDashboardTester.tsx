import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Monitor, 
  Smartphone, 
  Tablet,
  Eye,
  Settings,
  Undo,
  Redo
} from 'lucide-react';
import RepairerDashboardTabs from '@/components/repairer-dashboard/RepairerDashboardTabs';

interface DashboardConfiguration {
  layout: {
    gridColumns: number;
    spacing: string;
    containerMaxWidth: string;
  };
  components: {
    overview: { visible: boolean; metrics: string[]; chartType: 'line' | 'bar' | 'area'; };
    orders: { visible: boolean; statusFilters: string[]; defaultView: 'list' | 'grid'; };
    calendar: { visible: boolean; defaultView: 'month' | 'week' | 'day'; timeSlots: number; };
    inventory: { visible: boolean; lowStockAlert: boolean; categories: string[]; };
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
    fontFamily: string;
  };
  features: {
    realTimeUpdates: boolean;
    notificationSystem: boolean;
    exportData: boolean;
    advancedFilters: boolean;
  };
}

const defaultConfiguration: DashboardConfiguration = {
  layout: { gridColumns: 12, spacing: 'md', containerMaxWidth: '1200px' },
  components: {
    overview: { visible: true, metrics: ['orders', 'revenue', 'customers', 'repairs'], chartType: 'line' },
    orders: { visible: true, statusFilters: ['pending', 'in-progress', 'completed'], defaultView: 'list' },
    calendar: { visible: true, defaultView: 'week', timeSlots: 30 },
    inventory: { visible: true, lowStockAlert: true, categories: ['pieces', 'outils', 'accessoires'] }
  },
  theme: { primaryColor: 'hsl(222, 84%, 4.9%)', secondaryColor: 'hsl(210, 40%, 96%)', borderRadius: '0.5rem', fontFamily: 'system-ui' },
  features: { realTimeUpdates: true, notificationSystem: true, exportData: true, advancedFilters: true }
};

const mockData = {
  orders: [
    { id: '1', client: 'John Doe', device: 'iPhone 13', status: 'En cours', amount: 120, issue: 'Écran cassé', priority: 'high', estimatedPrice: 120 },
    { id: '2', client: 'Jane Smith', device: 'Samsung Galaxy S21', status: 'Terminé', amount: 85, issue: 'Batterie défaillante', priority: 'medium', estimatedPrice: 85 },
  ],
  appointments: [
    { id: '1', client: 'Mike Johnson', date: new Date(), duration: 60, time: '14:00', service: 'Réparation écran', phone: '0123456789' },
    { id: '2', client: 'Sarah Wilson', date: new Date(), duration: 90, time: '16:00', service: 'Diagnostic complet', phone: '0987654321' },
  ],
  inventory: [
    { id: '1', name: 'Écran iPhone 13', stock: 5, minStock: 10, part: 'Écran', price: 80 },
    { id: '2', name: 'Batterie Samsung S21', stock: 15, minStock: 8, part: 'Batterie', price: 45 },
  ],
  profileData: { name: 'Réparations Tech', businessName: 'Réparations Tech', rating: 4.8, completedRepairs: 1250, totalRepairs: 1250, joinDate: '2023-01-15' },
  avgRepairTime: 3.5
};

const RepairerDashboardTester: React.FC = () => {
  const [configuration, setConfiguration] = useState<DashboardConfiguration>(defaultConfiguration);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [undoStack, setUndoStack] = useState<DashboardConfiguration[]>([]);
  const [redoStack, setRedoStack] = useState<DashboardConfiguration[]>([]);
  const [configName, setConfigName] = useState('');
  
  const { toast } = useToast();
  const { configurations, saveConfiguration, cloneConfiguration, trackAnalyticsEvent } = useUIConfigurations();
  
  // Auto-save avec feedback visuel
  const { isSaving: isAutoSaving, lastSaved: autoSaveTime, forceSave } = useAutoSave({
    data: configuration,
    onSave: async (config) => {
      if (configName.trim()) {
        await saveConfiguration({
          name: configName,
          type: 'repairer_dashboard',
          configuration: config,
          is_active: true,
          description: `Auto-sauvegarde - ${new Date().toLocaleString()}`,
          tags: ['dashboard', 'repairer', 'auto-save']
        });
      }
    },
    delay: 5000, // 5 secondes pour feedback immédiat
    enabled: !!configName.trim()
  });

  const pushToUndoStack = useCallback((config: DashboardConfiguration) => {
    setUndoStack(prev => [...prev.slice(-9), config]);
    setRedoStack([]);
  }, []);

  const updateConfiguration = useCallback((updates: Partial<DashboardConfiguration>) => {
    setConfiguration(prev => {
      pushToUndoStack(prev);
      const newConfig = { ...prev, ...updates };
      trackAnalyticsEvent('dashboard_config_changed', { changes: Object.keys(updates), timestamp: Date.now() });
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
      type: 'repairer_dashboard',
      configuration,
      is_active: true,
      description: `Configuration du tableau de bord - ${new Date().toLocaleDateString()}`,
      tags: ['dashboard', 'repairer', 'interface']
    });
    setConfigName('');
    toast({ title: "Succès", description: "Configuration sauvegardée avec succès" });
  };

  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const dashboardConfigs = configurations.filter(config => config.type === 'repairer_dashboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Testeur de Tableau de Bord Réparateur</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configurez et testez l'interface du tableau de bord réparateur</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {!isPreviewMode && (
          <div className="xl:col-span-1 order-2 xl:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="layout" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="layout" className="text-xs sm:text-sm">Layout</TabsTrigger>
                    <TabsTrigger value="components" className="text-xs sm:text-sm">Composants</TabsTrigger>
                    <TabsTrigger value="theme" className="text-xs sm:text-sm">Thème</TabsTrigger>
                    <TabsTrigger value="features" className="text-xs sm:text-sm">Options</TabsTrigger>
                  </TabsList>

                  <TabsContent value="layout" className="space-y-4">
                    <div>
                      <Label htmlFor="gridColumns">Colonnes de grille</Label>
                      <Input
                        id="gridColumns"
                        type="number"
                        min="6"
                        max="24"
                        value={configuration.layout.gridColumns}
                        onChange={(e) => updateConfiguration({
                          layout: { ...configuration.layout, gridColumns: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Visibilité des composants</h4>
                      {Object.entries(configuration.components).map(([key, component]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="capitalize">{key}</Label>
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

                  <TabsContent value="theme" className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Couleur primaire</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={configuration.theme.primaryColor}
                        onChange={(e) => updateConfiguration({
                          theme: { ...configuration.theme, primaryColor: e.target.value }
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
                      placeholder="Ma configuration dashboard"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveConfiguration} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                {dashboardConfigs.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-semibold mb-2">Configurations sauvegardées</h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {dashboardConfigs.map((config) => (
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
                                  onClick={() => setConfiguration(config.configuration as DashboardConfiguration)}
                                >
                                  <Play className="h-3 w-3" />
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
                  <Monitor className="h-5 w-5" />
                  Aperçu du Tableau de Bord
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
                <div className="min-h-[400px] sm:min-h-[600px] bg-background" style={{
                  '--primary': configuration.theme.primaryColor,
                  '--secondary': configuration.theme.secondaryColor,
                  '--border-radius': configuration.theme.borderRadius,
                  '--font-family': configuration.theme.fontFamily,
                  '--grid-columns': configuration.layout.gridColumns,
                  '--spacing': configuration.layout.spacing === 'sm' ? '0.5rem' : 
                              configuration.layout.spacing === 'md' ? '1rem' : 
                              configuration.layout.spacing === 'lg' ? '1.5rem' : '1rem',
                } as React.CSSProperties}>
                  <RepairerDashboardTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    orders={mockData.orders}
                    appointments={mockData.appointments}
                    inventory={mockData.inventory}
                    profileData={mockData.profileData}
                    avgRepairTime={mockData.avgRepairTime}
                    dashboardConfig={configuration}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RepairerDashboardTester;