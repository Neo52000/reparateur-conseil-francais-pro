
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  BarChart3, 
  Settings, 
  Zap, 
  Users, 
  Globe,
  TrendingUp,
  TestTube,
  Brush,
  Brain,
  Image
} from 'lucide-react';
import CampaignManagement from './CampaignManagement';
import AdvancedTargeting from './AdvancedTargeting';
import AdvancedAnalytics from './AdvancedAnalytics';
import AutomatedCampaigns from './AutomatedCampaigns';
import ABTestingManager from './ABTestingManager';
import CreativesLibrary from './CreativesLibrary';
import GeoTargetingManager from './GeoTargetingManager';
import AdBannerManagement from './AdBannerManagement';

const AdvancedAdvertisingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabsConfig = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: BarChart3,
      description: 'Tableau de bord principal'
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      icon: Target,
      description: 'Gestion des campagnes publicitaires'
    },
    {
      id: 'banners',
      label: 'Bannières',
      icon: Image,
      description: 'Gestion des bannières publicitaires'
    },
    {
      id: 'targeting',
      label: 'Ciblage avancé',
      icon: Users,
      description: 'Segments et critères de ciblage'
    },
    {
      id: 'automation',
      label: 'Automatisation',
      icon: Zap,
      description: 'Campagnes automatisées et IA',
      badge: 'Beta'
    },
    {
      id: 'geo',
      label: 'Géofencing',
      icon: Globe,
      description: 'Ciblage géographique avancé',
      badge: 'Beta'
    },
    {
      id: 'testing',
      label: 'A/B Testing',
      icon: TestTube,
      description: 'Tests et optimisations'
    },
    {
      id: 'creatives',
      label: 'Créatifs',
      icon: Brush,
      description: 'Bibliothèque multimédia',
      badge: 'IA'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Analyses détaillées'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Module Publicitaire Avancé
          </h1>
          <p className="text-gray-600 mt-1">
            Ciblage intelligent, automatisation IA et analytics avancées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Version 2.0</Badge>
          <Badge variant="outline">IA Intégrée</Badge>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Segments ciblés</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI moyen</p>
                <p className="text-2xl font-bold">285%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Automatisations</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets améliorée */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto p-2 bg-gray-100 rounded-lg gap-1">
            {tabsConfig.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md whitespace-nowrap bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50"
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de bord principal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performances récentes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Campagne Réparateurs Premium</span>
                      <Badge variant="default">+15% CTR</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Segment Clients Lyon</span>
                      <Badge variant="secondary">Optimisé IA</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Actions recommandées</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Optimisation IA disponible</p>
                        <p className="text-sm text-blue-700">3 campagnes peuvent être améliorées</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Nouveau segment détecté</p>
                        <p className="text-sm text-green-700">Clients premium avec fort potentiel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignManagement />
        </TabsContent>

        <TabsContent value="banners">
          <AdBannerManagement />
        </TabsContent>

        <TabsContent value="targeting">
          <AdvancedTargeting />
        </TabsContent>

        <TabsContent value="automation">
          <AutomatedCampaigns />
        </TabsContent>

        <TabsContent value="geo">
          <GeoTargetingManager />
        </TabsContent>

        <TabsContent value="testing">
          <ABTestingManager />
        </TabsContent>

        <TabsContent value="creatives">
          <CreativesLibrary />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAdvertisingDashboard;
