import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, AlertTriangle, Power, PowerOff, Zap } from 'lucide-react';
import { APP_CONFIG } from '@/config';

const FeatureFlagsToggle: React.FC = () => {
  const [features, setFeatures] = useState(APP_CONFIG.features);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFeatureToggle = (featureKey: keyof typeof APP_CONFIG.features, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: enabled
    }));
    setHasChanges(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleCategoryToggle = (category: string, enable: boolean) => {
    const categoryFeatures = featuresList.filter(f => f.category === category && !f.readonly);
    categoryFeatures.forEach(feature => {
      handleFeatureToggle(feature.key, enable);
    });
  };

  const getPresetConfig = (preset: 'minimal' | 'core' | 'full') => {
    const configs = {
      minimal: ['enableAdvancedSearch', 'enableNotifications'],
      core: ['enableAdvancedSearch', 'enableNotifications', 'enableAnalytics', 'enableChatbotModule'],
      full: Object.keys(APP_CONFIG.features).filter(key => key !== 'enableDemo')
    };
    return configs[preset];
  };

  const applyPreset = (preset: 'minimal' | 'core' | 'full') => {
    const enabledFeatures = getPresetConfig(preset);
    Object.keys(APP_CONFIG.features).forEach(key => {
      const featureKey = key as keyof typeof APP_CONFIG.features;
      if (featureKey !== 'enableDemo') {
        handleFeatureToggle(featureKey, enabledFeatures.includes(key));
      }
    });
  };

  const featuresList = [
    // Modules Business
    {
      key: 'enableSuppliersDirectory' as keyof typeof APP_CONFIG.features,
      title: 'Annuaire Fournisseurs',
      description: 'Module d\'annuaire des fournisseurs de pièces détachées',
      status: features.enableSuppliersDirectory,
      category: 'Modules Business'
    },
    {
      key: 'enableWeatherModule' as keyof typeof APP_CONFIG.features,
      title: 'Module Météo',
      description: 'Dashboard météorologique avec données locales',
      status: features.enableWeatherModule,
      category: 'Modules Business'
    },
    {
      key: 'enablePOSModule' as keyof typeof APP_CONFIG.features,
      title: 'Point de Vente (POS)',
      description: 'Interface de caisse et gestion des ventes',
      status: features.enablePOSModule,
      category: 'Modules Business'
    },
    {
      key: 'enableEcommerceModule' as keyof typeof APP_CONFIG.features,
      title: 'E-commerce',
      description: 'Gestion boutique en ligne et commandes',
      status: features.enableEcommerceModule,
      category: 'Modules Business'
    },
    {
      key: 'enableChatbotModule' as keyof typeof APP_CONFIG.features,
      title: 'Chatbot IA',
      description: 'Assistant conversationnel intelligent',
      status: features.enableChatbotModule,
      category: 'Modules Business'
    },
    {
      key: 'enableBlogModule' as keyof typeof APP_CONFIG.features,
      title: 'Blog & Articles',
      description: 'Système de publication et gestion de contenu',
      status: features.enableBlogModule,
      category: 'Modules Business'
    },
    
    // Modules Techniques
    {
      key: 'enableScrapingModule' as keyof typeof APP_CONFIG.features,
      title: 'Scraping Auto',
      description: 'Collecte automatisée de données réparateurs',
      status: features.enableScrapingModule,
      category: 'Modules Techniques'
    },
    {
      key: 'enableAutomationModule' as keyof typeof APP_CONFIG.features,
      title: 'Automatisation',
      description: 'Workflows et tâches automatisées',
      status: features.enableAutomationModule,
      category: 'Modules Techniques'
    },
    {
      key: 'enableMonitoringModule' as keyof typeof APP_CONFIG.features,
      title: 'Monitoring',
      description: 'Surveillance système et performances',
      status: features.enableMonitoringModule,
      category: 'Modules Techniques'
    },
    {
      key: 'enableSEOModule' as keyof typeof APP_CONFIG.features,
      title: 'SEO Manager',
      description: 'Optimisation référencement naturel',
      status: features.enableSEOModule,
      category: 'Modules Techniques'
    },
    {
      key: 'enableAdvertisingAI' as keyof typeof APP_CONFIG.features,
      title: 'Publicité IA',
      description: 'Gestion intelligente des campagnes publicitaires',
      status: features.enableAdvertisingAI,
      category: 'Modules Techniques'
    },
    
    // Fonctionnalités Core
    {
      key: 'enableAdvancedSearch' as keyof typeof APP_CONFIG.features,
      title: 'Recherche Avancée',
      description: 'Fonctionnalités de recherche et filtrage avancés',
      status: features.enableAdvancedSearch,
      category: 'Fonctionnalités Core'
    },
    {
      key: 'enableNotifications' as keyof typeof APP_CONFIG.features,
      title: 'Notifications',
      description: 'Système de notifications utilisateurs',
      status: features.enableNotifications,
      category: 'Fonctionnalités Core'
    },
    {
      key: 'enableAnalytics' as keyof typeof APP_CONFIG.features,
      title: 'Analytics',
      description: 'Suivi et analyse des données utilisateurs',
      status: features.enableAnalytics,
      category: 'Fonctionnalités Core'
    },
    
    // Modules de Test
    {
      key: 'enableDashboardTester' as keyof typeof APP_CONFIG.features,
      title: 'Dashboard Tester',
      description: 'Tests automatisés du tableau de bord',
      status: features.enableDashboardTester,
      category: 'Modules de Test'
    },
    {
      key: 'enablePOSTester' as keyof typeof APP_CONFIG.features,
      title: 'POS Tester',
      description: 'Tests automatisés du point de vente',
      status: features.enablePOSTester,
      category: 'Modules de Test'
    },
    {
      key: 'enablePlansTester' as keyof typeof APP_CONFIG.features,
      title: 'Plans Tester',
      description: 'Tests automatisés des plans d\'abonnement',
      status: features.enablePlansTester,
      category: 'Modules de Test'
    },
    
    // Système
    {
      key: 'enableDemo' as keyof typeof APP_CONFIG.features,
      title: 'Mode Démo',
      description: 'Mode démonstration pour les tests (PRODUCTION: désactivé)',
      status: features.enableDemo,
      category: 'Système',
      readonly: true
    }
  ];

  const groupedFeatures = featuresList.reduce((groups, feature) => {
    const category = feature.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
    return groups;
  }, {} as Record<string, typeof featuresList>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Gestion des Feature Flags</CardTitle>
          </div>
          <CardDescription>
            Activez ou désactivez les modules et fonctionnalités de l'application en temps réel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasChanges && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Des modifications ont été apportées. Vous devez recharger la page pour les appliquer.
                <Button 
                  onClick={handleReload} 
                  size="sm" 
                  className="ml-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recharger la page
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Presets de Diagnostic */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Presets de Diagnostic
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => applyPreset('minimal')}>
                Mode Minimal
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset('core')}>
                Mode Core
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset('full')}>
                Mode Complet
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Utilisez ces presets pour diagnostiquer rapidement les problèmes
            </p>
          </div>

          {Object.entries(groupedFeatures).map(([category, features]) => {
            const activeCount = features.filter(f => f.status).length;
            const totalCount = features.length;
            const readonlyCount = features.filter(f => f.readonly).length;
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <Badge variant="secondary">
                      {activeCount}/{totalCount - readonlyCount} actifs
                    </Badge>
                  </div>
                  {!features.every(f => f.readonly) && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCategoryToggle(category, true)}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        Tout activer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCategoryToggle(category, false)}
                      >
                        <PowerOff className="h-3 w-3 mr-1" />
                        Tout désactiver
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={feature.key} className="font-medium">
                            {feature.title}
                          </Label>
                          {feature.readonly && (
                            <Badge variant="destructive" className="text-xs">
                              PRODUCTION
                            </Badge>
                          )}
                          {feature.status && (
                            <Badge variant="default" className="text-xs">
                              ACTIF
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <Switch
                        id={feature.key}
                        checked={feature.status}
                        onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                        disabled={feature.readonly}
                      />
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            );
          })}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Instructions d'utilisation :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Activez/désactivez les modules selon vos besoins</li>
              <li>• Les changements nécessitent un rechargement de page</li>
              <li>• Les modules désactivés affichent un message informatif</li>
              <li>• Le mode démo est verrouillé en production</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagsToggle;