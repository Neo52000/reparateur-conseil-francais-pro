import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Palette, 
  Type, 
  Layout, 
  RefreshCw, 
  Save,
  Download,
  Copy,
  Settings2,
  Eye,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for configuration
interface DashboardConfig {
  layout: {
    cardSpacing: number;
    borderRadius: number;
    shadow: string;
    padding: number;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
  };
  typography: {
    headerSize: number;
    bodySize: number;
    fontWeight: string;
    lineHeight: number;
  };
  responsive: {
    viewMode: 'desktop' | 'tablet' | 'mobile';
    breakpoint: number;
  };
  theme: 'light' | 'dark' | 'auto';
}

const dashboardTabs = [
  { value: 'overview', label: 'Aperçu général', icon: '📊' },
  { value: 'orders', label: 'Commandes', icon: '📦' },
  { value: 'calendar', label: 'Planning', icon: '📅' },
  { value: 'inventory', label: 'Inventaire', icon: '📋' },
  { value: 'quotes', label: 'Devis', icon: '💰' },
  { value: 'clients', label: 'Clients', icon: '👥' },
  { value: 'billing', label: 'Facturation', icon: '🧾' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'analytics', label: 'Analytiques', icon: '📈' },
  { value: 'catalog', label: 'Catalogue', icon: '🛠️' },
  { value: 'settings', label: 'Paramètres', icon: '⚙️' },
  { value: 'support', label: 'Support', icon: '🎧' },
  { value: 'pos', label: 'Point de vente', icon: '🏪' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'notifications', label: 'Notifications', icon: '🔔' },
  { value: 'profile', label: 'Profil', icon: '👤' }
];

const userPlans = [
  { value: 'free', label: 'Gratuit', features: ['Fonctionnalités de base'] },
  { value: 'basic', label: 'Basic', features: ['Calendrier', 'Inventaire'] },
  { value: 'premium', label: 'Premium', features: ['Toutes fonctionnalités', 'Analytics'] },
  { value: 'enterprise', label: 'Enterprise', features: ['API', 'Support prioritaire', 'Personnalisation'] }
];

const predefinedThemes = {
  modern: {
    name: 'Moderne',
    colors: { primary: 'hsl(217, 91%, 60%)', accent: 'hsl(262, 83%, 58%)', background: 'hsl(0, 0%, 98%)', cardBackground: 'hsl(0, 0%, 100%)', text: 'hsl(0, 0%, 15%)' }
  },
  corporate: {
    name: 'Corporate',
    colors: { primary: 'hsl(210, 100%, 40%)', accent: 'hsl(195, 100%, 50%)', background: 'hsl(210, 11%, 96%)', cardBackground: 'hsl(0, 0%, 100%)', text: 'hsl(210, 11%, 15%)' }
  },
  tech: {
    name: 'Tech',
    colors: { primary: 'hsl(142, 71%, 45%)', accent: 'hsl(158, 64%, 52%)', background: 'hsl(142, 13%, 7%)', cardBackground: 'hsl(142, 13%, 10%)', text: 'hsl(142, 13%, 90%)' }
  }
};

export default function RepairerDashboardTester() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [dataMode, setDataMode] = useState('demo');
  const [config, setConfig] = useState<DashboardConfig>({
    layout: {
      cardSpacing: 16,
      borderRadius: 8,
      shadow: 'soft',
      padding: 24
    },
    colors: {
      primary: 'hsl(217, 91%, 60%)',
      accent: 'hsl(262, 83%, 58%)',
      background: 'hsl(0, 0%, 98%)',
      cardBackground: 'hsl(0, 0%, 100%)',
      text: 'hsl(0, 0%, 15%)'
    },
    typography: {
      headerSize: 24,
      bodySize: 14,
      fontWeight: 'medium',
      lineHeight: 1.5
    },
    responsive: {
      viewMode: 'desktop',
      breakpoint: 1024
    },
    theme: 'light'
  });

  const updateConfig = useCallback((section: keyof DashboardConfig, updates: Record<string, any>) => {
    setConfig(prev => ({
      ...prev,
      [section]: { 
        ...(prev[section] as Record<string, any>), 
        ...updates 
      }
    }));
  }, []);

  const applyTheme = useCallback((themeName: keyof typeof predefinedThemes) => {
    const theme = predefinedThemes[themeName];
    updateConfig('colors', theme.colors);
    toast({
      title: "Thème appliqué",
      description: `Le thème ${theme.name} a été appliqué avec succès.`
    });
  }, [updateConfig, toast]);

  const resetConfig = useCallback(() => {
    setConfig({
      layout: { cardSpacing: 16, borderRadius: 8, shadow: 'soft', padding: 24 },
      colors: { primary: 'hsl(217, 91%, 60%)', accent: 'hsl(262, 83%, 58%)', background: 'hsl(0, 0%, 98%)', cardBackground: 'hsl(0, 0%, 100%)', text: 'hsl(0, 0%, 15%)' },
      typography: { headerSize: 24, bodySize: 14, fontWeight: 'medium', lineHeight: 1.5 },
      responsive: { viewMode: 'desktop', breakpoint: 1024 },
      theme: 'light'
    });
    toast({
      title: "Configuration réinitialisée",
      description: "Retour aux paramètres par défaut."
    });
  }, [toast]);

  const exportConfig = useCallback(() => {
    const configJson = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configJson);
    toast({
      title: "Configuration copiée",
      description: "La configuration JSON a été copiée dans le presse-papiers."
    });
  }, [config, toast]);

  const generatePreviewStyles = useCallback(() => {
    const { layout, colors, typography, responsive } = config;
    
    return {
      '--preview-primary': colors.primary,
      '--preview-accent': colors.accent,
      '--preview-bg': colors.background,
      '--preview-card-bg': colors.cardBackground,
      '--preview-text': colors.text,
      '--preview-spacing': `${layout.cardSpacing}px`,
      '--preview-radius': `${layout.borderRadius}px`,
      '--preview-padding': `${layout.padding}px`,
      '--preview-header-size': `${typography.headerSize}px`,
      '--preview-body-size': `${typography.bodySize}px`,
      '--preview-font-weight': typography.fontWeight,
      '--preview-line-height': typography.lineHeight.toString(),
      width: responsive.viewMode === 'mobile' ? '375px' : 
             responsive.viewMode === 'tablet' ? '768px' : '100%',
    } as React.CSSProperties;
  }, [config]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Test Interface Réparateur</h2>
          <p className="text-muted-foreground">
            Configurez et testez l'affichage du tableau de bord réparateur en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={exportConfig}>
            <Copy className="h-4 w-4 mr-2" />
            Copier config
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="colors">Couleurs</TabsTrigger>
                  <TabsTrigger value="typo">Typo</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Onglet à tester</Label>
                    <Select value={selectedTab} onValueChange={setSelectedTab}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dashboardTabs.map(tab => (
                          <SelectItem key={tab.value} value={tab.value}>
                            {tab.icon} {tab.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Plan utilisateur</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userPlans.map(plan => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mode d'affichage</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={config.responsive.viewMode === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('responsive', { viewMode: 'desktop' })}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={config.responsive.viewMode === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('responsive', { viewMode: 'tablet' })}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={config.responsive.viewMode === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('responsive', { viewMode: 'mobile' })}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Thèmes prédéfinis</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(predefinedThemes).map(([key, theme]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => applyTheme(key as keyof typeof predefinedThemes)}
                          className="justify-start"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          {theme.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Espacement des cartes: {config.layout.cardSpacing}px</Label>
                    <Slider
                      value={[config.layout.cardSpacing]}
                      onValueChange={([value]) => updateConfig('layout', { cardSpacing: value })}
                      max={32}
                      min={8}
                      step={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Border radius: {config.layout.borderRadius}px</Label>
                    <Slider
                      value={[config.layout.borderRadius]}
                      onValueChange={([value]) => updateConfig('layout', { borderRadius: value })}
                      max={24}
                      min={0}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Padding des cartes: {config.layout.padding}px</Label>
                    <Slider
                      value={[config.layout.padding]}
                      onValueChange={([value]) => updateConfig('layout', { padding: value })}
                      max={48}
                      min={12}
                      step={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Couleur primaire</Label>
                    <Input
                      type="color"
                      value={config.colors.primary.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)?.[0] || '#3b82f6'}
                      onChange={(e) => {
                        const hex = e.target.value;
                        // Conversion approximative hex vers HSL pour l'exemple
                        updateConfig('colors', { primary: `hsl(217, 91%, 60%)` });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Couleur d'accent</Label>
                    <Input
                      type="color"
                      value={config.colors.accent.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)?.[0] || '#8b5cf6'}
                      onChange={(e) => updateConfig('colors', { accent: 'hsl(262, 83%, 58%)' })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="typo" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taille en-têtes: {config.typography.headerSize}px</Label>
                    <Slider
                      value={[config.typography.headerSize]}
                      onValueChange={([value]) => updateConfig('typography', { headerSize: value })}
                      max={32}
                      min={16}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Taille texte: {config.typography.bodySize}px</Label>
                    <Slider
                      value={[config.typography.bodySize]}
                      onValueChange={([value]) => updateConfig('typography', { bodySize: value })}
                      max={18}
                      min={12}
                      step={1}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <Card className="h-[800px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu temps réel
                <Badge variant="secondary">
                  {dashboardTabs.find(t => t.value === selectedTab)?.label}
                </Badge>
                <Badge variant="outline">
                  Plan {userPlans.find(p => p.value === selectedPlan)?.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div 
                className="preview-container h-full border rounded-lg overflow-auto"
                style={generatePreviewStyles()}
              >
                <div className="p-6 space-y-4" style={{ 
                  backgroundColor: config.colors.background,
                  color: config.colors.text,
                  fontSize: `${config.typography.bodySize}px`,
                  lineHeight: config.typography.lineHeight
                }}>
                  {/* Mock Dashboard Preview */}
                  <div className="flex items-center justify-between">
                    <h1 style={{ 
                      fontSize: `${config.typography.headerSize}px`,
                      fontWeight: config.typography.fontWeight 
                    }}>
                      Tableau de bord - {dashboardTabs.find(t => t.value === selectedTab)?.label}
                    </h1>
                    <Badge style={{ backgroundColor: config.colors.primary, color: 'white' }}>
                      {userPlans.find(p => p.value === selectedPlan)?.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="rounded-lg shadow-sm p-4"
                        style={{
                          backgroundColor: config.colors.cardBackground,
                          borderRadius: `${config.layout.borderRadius}px`,
                          padding: `${config.layout.padding}px`,
                          margin: `${config.layout.cardSpacing / 2}px`
                        }}
                      >
                        <h3 className="font-semibold mb-2">Métrique {i}</h3>
                        <p className="text-2xl font-bold" style={{ color: config.colors.primary }}>
                          {i * 123}
                        </p>
                        <p className="text-sm opacity-70">+12% ce mois</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-lg shadow-sm p-6"
                    style={{
                      backgroundColor: config.colors.cardBackground,
                      borderRadius: `${config.layout.borderRadius}px`,
                      padding: `${config.layout.padding}px`
                    }}
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      Contenu de l'onglet {dashboardTabs.find(t => t.value === selectedTab)?.label}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="h-4 rounded" style={{ backgroundColor: config.colors.primary, opacity: 0.3 }}></div>
                        <div className="h-4 rounded" style={{ backgroundColor: config.colors.accent, opacity: 0.3 }}></div>
                        <div className="h-4 rounded w-3/4" style={{ backgroundColor: config.colors.primary, opacity: 0.2 }}></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-16 rounded" style={{ backgroundColor: config.colors.accent, opacity: 0.1 }}></div>
                        <div className="h-8 rounded" style={{ backgroundColor: config.colors.primary, opacity: 0.1 }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}