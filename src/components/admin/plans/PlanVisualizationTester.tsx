import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Upload,
  Palette,
  Type,
  Layout,
  Settings2,
  Eye,
  Grid3X3,
  Copy,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlanCard from '@/components/subscription/PlanCard';
import PlansGrid from '@/components/subscription/PlansGrid';

interface PlanConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    badge: string;
  };
  typography: {
    titleSize: number;
    priceSize: number;
    featureSize: number;
    fontWeight: number;
  };
  layout: {
    cardPadding: number;
    borderRadius: number;
    shadow: string;
    spacing: number;
  };
  badges: {
    position: string;
    style: string;
    text: string;
  };
  buttons: {
    style: string;
    size: string;
    variant: string;
  };
}

interface ViewportConfig {
  width: number;
  height: number;
  scale: number;
}

const defaultConfig: PlanConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937',
    badge: '#ef4444'
  },
  typography: {
    titleSize: 24,
    priceSize: 32,
    featureSize: 14,
    fontWeight: 500
  },
  layout: {
    cardPadding: 24,
    borderRadius: 12,
    shadow: 'lg',
    spacing: 16
  },
  badges: {
    position: 'top',
    style: 'solid',
    text: 'Populaire'
  },
  buttons: {
    style: 'default',
    size: 'default',
    variant: 'default'
  }
};

const mockPlans = [
  {
    id: '1',
    name: 'Gratuit',
    price_monthly: 0,
    price_yearly: 0,
    features: ['3 devis par mois', 'Support email', 'Catalogue de base']
  },
  {
    id: '2', 
    name: 'Visibilité',
    price_monthly: 29,
    price_yearly: 290,
    features: ['20 devis par mois', 'Support prioritaire', 'Catalogue complet', 'Analytics de base']
  },
  {
    id: '3',
    name: 'Pro',
    price_monthly: 79,
    price_yearly: 790,
    features: ['Devis illimités', 'Support 24/7', 'Analytics avancées', 'API access', 'Intégrations']
  },
  {
    id: '4',
    name: 'Premium',
    price_monthly: 149,
    price_yearly: 1490,
    features: ['Tout du Pro', 'Manager dédié', 'Formation personnalisée', 'SLA garanti', 'Fonctionnalités beta']
  }
];

const predefinedThemes = {
  corporate: {
    name: 'Corporate',
    colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6', background: '#ffffff', text: '#1f2937', badge: '#ef4444' }
  },
  modern: {
    name: 'Modern',
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#ec4899', background: '#fafafa', text: '#374151', badge: '#f59e0b' }
  },
  gaming: {
    name: 'Gaming',
    colors: { primary: '#10b981', secondary: '#34d399', accent: '#06b6d4', background: '#111827', text: '#f9fafb', badge: '#ef4444' }
  },
  minimal: {
    name: 'Minimal',
    colors: { primary: '#000000', secondary: '#6b7280', accent: '#f59e0b', background: '#ffffff', text: '#000000', badge: '#ef4444' }
  }
};

const PlanVisualizationTester: React.FC = () => {
  const [config, setConfig] = useState<PlanConfig>(defaultConfig);
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'grid' | 'mobile'>('grid');
  const [isYearly, setIsYearly] = useState(false);
  const [viewport, setViewport] = useState<ViewportConfig>({ width: 1200, height: 800, scale: 1 });
  const [activeTab, setActiveTab] = useState('visual');
  const { toast } = useToast();

  const updateConfig = (section: keyof PlanConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const applyTheme = (themeName: keyof typeof predefinedThemes) => {
    const theme = predefinedThemes[themeName];
    setConfig(prev => ({
      ...prev,
      colors: theme.colors
    }));
    toast({
      title: 'Thème appliqué',
      description: `Le thème ${theme.name} a été appliqué avec succès.`,
    });
  };

  const exportConfig = () => {
    const configString = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configString);
    toast({
      title: 'Configuration exportée',
      description: 'La configuration a été copiée dans le presse-papier.',
    });
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setConfig(imported);
          toast({
            title: 'Configuration importée',
            description: 'La configuration a été importée avec succès.',
          });
        } catch (error) {
          toast({
            title: 'Erreur d\'import',
            description: 'Le fichier n\'est pas valide.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    toast({
      title: 'Configuration réinitialisée',
      description: 'La configuration par défaut a été restaurée.',
    });
  };

  const generateCSS = () => {
    return `
/* Configuration générée automatiquement */
.plan-card {
  background: ${config.colors.background};
  color: ${config.colors.text};
  padding: ${config.layout.cardPadding}px;
  border-radius: ${config.layout.borderRadius}px;
  box-shadow: var(--shadow-${config.layout.shadow});
}

.plan-title {
  font-size: ${config.typography.titleSize}px;
  font-weight: ${config.typography.fontWeight};
  color: ${config.colors.primary};
}

.plan-price {
  font-size: ${config.typography.priceSize}px;
  font-weight: 700;
  color: ${config.colors.primary};
}

.plan-feature {
  font-size: ${config.typography.featureSize}px;
  color: ${config.colors.text};
}

.plan-badge {
  background: ${config.colors.badge};
  color: white;
}

.plan-button {
  background: ${config.colors.primary};
  color: white;
  border-radius: ${config.layout.borderRadius}px;
}
    `.trim();
  };

  const renderPreview = () => {
    const style = {
      '--primary': config.colors.primary,
      '--secondary': config.colors.secondary,
      '--accent': config.colors.accent,
      '--background': config.colors.background,
      '--text': config.colors.text,
      '--badge': config.colors.badge,
      '--card-padding': `${config.layout.cardPadding}px`,
      '--border-radius': `${config.layout.borderRadius}px`,
      '--title-size': `${config.typography.titleSize}px`,
      '--price-size': `${config.typography.priceSize}px`,
      '--feature-size': `${config.typography.featureSize}px`,
      '--font-weight': config.typography.fontWeight,
    } as React.CSSProperties;

    if (viewMode === 'card' && selectedPlan !== 'all') {
      const plan = mockPlans.find(p => p.id === selectedPlan);
      if (plan) {
        return (
          <div style={style} className="p-4">
            <PlanCard
              plan={plan}
              isYearly={isYearly}
              currentPlan="gratuit"
              loading={false}
              onSubscribe={() => {}}
            />
          </div>
        );
      }
    }

    return (
      <div style={style} className="p-4">
        <PlansGrid
          plans={mockPlans}
          isYearly={isYearly}
          currentPlan="gratuit"
          loading={false}
          onSubscribe={() => {}}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Interface Plans</h1>
            <p className="text-muted-foreground">Configurez et prévisualisez l'affichage des plans réparateurs</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetConfig} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={exportConfig} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <label htmlFor="import-config">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </span>
              </Button>
              <input
                id="import-config"
                type="file"
                accept=".json"
                onChange={importConfig}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Panel de configuration */}
          <div className="xl:col-span-4 order-2 xl:order-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="visual" className="text-xs sm:text-sm">Visual</TabsTrigger>
                    <TabsTrigger value="layout" className="text-xs sm:text-sm">Layout</TabsTrigger>
                    <TabsTrigger value="advanced" className="text-xs sm:text-sm">Avancé</TabsTrigger>
                    <TabsTrigger value="export" className="text-xs sm:text-sm">Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="visual" className="space-y-4">
                    {/* Sélection du mode d'affichage */}
                    <div className="space-y-2">
                      <Label>Mode d'affichage</Label>
                      <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grille complète</SelectItem>
                          <SelectItem value="card">Carte individuelle</SelectItem>
                          <SelectItem value="mobile">Aperçu mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sélection du plan (si mode carte) */}
                    {viewMode === 'card' && (
                      <div className="space-y-2">
                        <Label>Plan à afficher</Label>
                        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockPlans.map(plan => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Toggle mensuel/annuel */}
                    <div className="flex items-center space-x-2">
                      <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                      <Label>Affichage annuel</Label>
                    </div>

                    <Separator />

                    {/* Thèmes prédéfinis */}
                    <div className="space-y-2">
                      <Label>Thèmes prédéfinis</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(predefinedThemes).map(([key, theme]) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => applyTheme(key as keyof typeof predefinedThemes)}
                          >
                            {theme.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Couleurs */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Couleurs
                      </Label>
                      {Object.entries(config.colors).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key}</span>
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) => updateConfig('colors', key, e.target.value)}
                            className="w-16 h-8 p-0 border-none"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    {/* Typographie */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Typographie
                      </Label>
                      
                      <div className="space-y-2">
                        <Label>Taille titre: {config.typography.titleSize}px</Label>
                        <Slider
                          value={[config.typography.titleSize]}
                          onValueChange={([value]) => updateConfig('typography', 'titleSize', value)}
                          min={16}
                          max={40}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Taille prix: {config.typography.priceSize}px</Label>
                        <Slider
                          value={[config.typography.priceSize]}
                          onValueChange={([value]) => updateConfig('typography', 'priceSize', value)}
                          min={20}
                          max={50}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Taille features: {config.typography.featureSize}px</Label>
                        <Slider
                          value={[config.typography.featureSize]}
                          onValueChange={([value]) => updateConfig('typography', 'featureSize', value)}
                          min={10}
                          max={20}
                          step={1}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Layout */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        Mise en page
                      </Label>
                      
                      <div className="space-y-2">
                        <Label>Padding: {config.layout.cardPadding}px</Label>
                        <Slider
                          value={[config.layout.cardPadding]}
                          onValueChange={([value]) => updateConfig('layout', 'cardPadding', value)}
                          min={8}
                          max={48}
                          step={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Border radius: {config.layout.borderRadius}px</Label>
                        <Slider
                          value={[config.layout.borderRadius]}
                          onValueChange={([value]) => updateConfig('layout', 'borderRadius', value)}
                          min={0}
                          max={24}
                          step={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ombre</Label>
                        <Select value={config.layout.shadow} onValueChange={(value) => updateConfig('layout', 'shadow', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune</SelectItem>
                            <SelectItem value="sm">Petite</SelectItem>
                            <SelectItem value="md">Moyenne</SelectItem>
                            <SelectItem value="lg">Grande</SelectItem>
                            <SelectItem value="xl">Extra large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    {/* Configuration avancée */}
                    <div className="space-y-3">
                      <Label>Configuration avancée</Label>
                      <p className="text-sm text-muted-foreground">
                        Fonctionnalités avancées pour personnaliser l'affichage
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="space-y-2">
                      <Label>Position des badges</Label>
                      <Select value={config.badges.position} onValueChange={(value) => updateConfig('badges', 'position', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Haut</SelectItem>
                          <SelectItem value="corner">Coin</SelectItem>
                          <SelectItem value="inline">En ligne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Boutons */}
                    <div className="space-y-2">
                      <Label>Style des boutons</Label>
                      <Select value={config.buttons.variant} onValueChange={(value) => updateConfig('buttons', 'variant', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Défaut</SelectItem>
                          <SelectItem value="outline">Contour</SelectItem>
                          <SelectItem value="ghost">Fantôme</SelectItem>
                          <SelectItem value="secondary">Secondaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-4">
                    {/* Export CSS */}
                    <div className="space-y-2">
                      <Label>CSS généré</Label>
                      <textarea
                        value={generateCSS()}
                        readOnly
                        className="w-full h-40 p-3 text-xs font-mono bg-muted rounded border"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(generateCSS());
                          toast({ title: 'CSS copié dans le presse-papier' });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier CSS
                      </Button>
                    </div>

                    <Separator />

                    {/* Export JSON */}
                    <div className="space-y-2">
                      <Label>Configuration JSON</Label>
                      <textarea
                        value={JSON.stringify(config, null, 2)}
                        readOnly
                        className="w-full h-32 p-3 text-xs font-mono bg-muted rounded border"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Zone d'aperçu */}
          <div className="xl:col-span-8 order-1 xl:order-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Aperçu temps réel
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-auto ${
                  viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`} style={{ minHeight: '600px' }}>
                  {renderPreview()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanVisualizationTester;