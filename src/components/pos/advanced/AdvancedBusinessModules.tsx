import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Users, 
  TrendingUp, 
  FileText, 
  ShoppingCart, 
  Clock, 
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Settings,
  Download,
  Upload,
  Star,
  Award,
  Zap,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessModules } from '@/hooks/useBusinessModules';
import LoyaltyProgramManager from './LoyaltyProgramManager';

const AdvancedBusinessModules: React.FC = () => {
  const { toast } = useToast();
  const { 
    loyaltyProgram, 
    loyaltyCustomers, 
    loyaltyTransactions, 
    getLoyaltyStats,
    loading 
  } = useBusinessModules();
  
  const [activeModules, setActiveModules] = useState({
    loyalty: !!loyaltyProgram,
    forecasting: false,
    advanced_analytics: false,
    business_intelligence: false,
    automated_marketing: false,
    warranty_management: false,
    subscription_billing: false,
    multi_location: false
  });

  const businessModules = [
    {
      id: 'loyalty',
      name: 'Programme de Fidélité',
      description: 'Système de points et récompenses avancé',
      icon: Star,
      category: 'marketing',
      features: [
        'Points par achat',
        'Niveaux VIP',
        'Récompenses personnalisées',
        'Parrainage client',
        'Cartes de fidélité',
        'Promotions ciblées'
      ],
      metrics: loyaltyProgram ? {
        active_customers: loyaltyCustomers.length,
        points_distributed: getLoyaltyStats().totalPointsDistributed,
        redemption_rate: getLoyaltyStats().redemptionRate,
        revenue_increase: 18.2
      } : {
        active_customers: 0,
        points_distributed: 0,
        redemption_rate: 0,
        revenue_increase: 0
      }
    },
    {
      id: 'forecasting',
      name: 'Prévisions IA',
      description: 'Prédictions de ventes et tendances',
      icon: Brain,
      category: 'analytics',
      features: [
        'Prévision de ventes',
        'Optimisation stock',
        'Analyse saisonnière',
        'Détection tendances',
        'Alertes automatiques',
        'Recommandations IA'
      ],
      metrics: {
        accuracy: 92.1,
        predictions_generated: 456,
        cost_savings: 15.3,
        stock_optimization: 28.7
      }
    },
    {
      id: 'advanced_analytics',
      name: 'Analytics Avancés',
      description: 'Tableaux de bord et rapports détaillés',
      icon: BarChart3,
      category: 'analytics',
      features: [
        'Tableaux personnalisés',
        'Métriques avancées',
        'Comparaisons période',
        'Alertes intelligentes',
        'Export données',
        'API analytics'
      ],
      metrics: {
        reports_generated: 89,
        dashboard_views: 1524,
        data_points: 25640,
        insight_accuracy: 94.7
      }
    },
    {
      id: 'business_intelligence',
      name: 'Business Intelligence',
      description: 'Aide à la décision avec IA',
      icon: Target,
      category: 'strategy',
      features: [
        'Tableaux décisionnels',
        'KPI intelligents',
        'Benchmarking',
        'Recommandations',
        'Modélisation',
        'Scénarios prédictifs'
      ],
      metrics: {
        decision_support: 156,
        roi_improvement: 22.4,
        efficiency_gain: 31.2,
        strategic_insights: 78
      }
    },
    {
      id: 'automated_marketing',
      name: 'Marketing Automatisé',
      description: 'Campagnes et communications automatiques',
      icon: Zap,
      category: 'marketing',
      features: [
        'Emails automatiques',
        'SMS personnalisés',
        'Segmentation client',
        'A/B Testing',
        'Workflows marketing',
        'Attribution ROI'
      ],
      metrics: {
        campaigns_active: 12,
        conversion_rate: 8.9,
        revenue_attributed: 25680,
        automation_savings: 18.5
      }
    },
    {
      id: 'warranty_management',
      name: 'Gestion Garanties',
      description: 'Suivi complet des garanties et SAV',
      icon: Award,
      category: 'service',
      features: [
        'Registre garanties',
        'Alertes expiration',
        'Suivi réparations',
        'Base connaissance',
        'Procédures SAV',
        'Reporting garanties'
      ],
      metrics: {
        warranties_tracked: 3247,
        claims_processed: 156,
        satisfaction_rate: 96.3,
        processing_time: 2.1
      }
    },
    {
      id: 'subscription_billing',
      name: 'Facturation Abonnements',
      description: 'Gestion des revenus récurrents',
      icon: Calendar,
      category: 'finance',
      features: [
        'Facturation récurrente',
        'Gestion abonnements',
        'Proration automatique',
        'Dunning management',
        'Métriques MRR/ARR',
        'Churn analytics'
      ],
      metrics: {
        active_subscriptions: 89,
        monthly_recurring_revenue: 12450,
        churn_rate: 3.2,
        ltv_growth: 15.7
      }
    },
    {
      id: 'multi_location',
      name: 'Multi-Magasins',
      description: 'Gestion centralisée de plusieurs points de vente',
      icon: Users,
      category: 'operations',
      features: [
        'Vue consolidée',
        'Transferts inter-magasins',
        'Reporting centralisé',
        'Gestion utilisateurs',
        'Synchronisation data',
        'Performance comparée'
      ],
      metrics: {
        locations_managed: 5,
        inter_store_transfers: 127,
        centralized_revenue: 156780,
        efficiency_gain: 24.3
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous les modules', icon: Settings },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'strategy', name: 'Stratégie', icon: Target },
    { id: 'service', name: 'Service Client', icon: Award },
    { id: 'finance', name: 'Finance', icon: Calculator },
    { id: 'operations', name: 'Opérations', icon: Users }
  ];

  const formatMetric = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return `${value.toLocaleString('fr-FR')} €`;
      case 'percentage':
        return `${value}%`;
      case 'decimal':
        return `${value} jours`;
      case 'count':
        return value.toLocaleString('fr-FR');
      default:
        return value.toString();
    }
  };

  const getModuleStatusColor = (moduleId: string) => {
    return activeModules[moduleId as keyof typeof activeModules] ? 'text-green-500' : 'text-gray-400';
  };

  const toggleModule = (moduleId: string) => {
    setActiveModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId as keyof typeof activeModules]
    }));
    
    const module = businessModules.find(m => m.id === moduleId);
    toast({
      title: `Module ${activeModules[moduleId as keyof typeof activeModules] ? 'désactivé' : 'activé'}`,
      description: `${module?.name} ${activeModules[moduleId as keyof typeof activeModules] ? 'arrêté' : 'démarré'} avec succès`,
    });
  };

  const filteredModules = (category: string) => {
    if (category === 'all') return businessModules;
    return businessModules.filter(module => module.category === category);
  };

  const ModuleCard = ({ module }: { module: any }) => {
    const isActive = activeModules[module.id as keyof typeof activeModules];
    
    return (
      <Card className={`${isActive ? 'border-green-200 bg-green-50/50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <module.icon className={`h-6 w-6 ${getModuleStatusColor(module.id)}`} />
              <div>
                <CardTitle className="text-lg">{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Actif' : 'Inactif'}
              </Badge>
              <Switch
                checked={isActive}
                onCheckedChange={() => toggleModule(module.id)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Fonctionnalités</h4>
            <div className="grid grid-cols-2 gap-2">
              {module.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {isActive && (
            <div>
              <h4 className="font-medium mb-3">Métriques de performance</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(module.metrics).map(([key, value]) => {
                  const metricLabels = {
                    active_customers: { label: 'Clients actifs', type: 'count' },
                    points_distributed: { label: 'Points distribués', type: 'count' },
                    redemption_rate: { label: 'Taux rachat', type: 'percentage' },
                    revenue_increase: { label: 'Hausse CA', type: 'percentage' },
                    accuracy: { label: 'Précision', type: 'percentage' },
                    predictions_generated: { label: 'Prédictions', type: 'count' },
                    cost_savings: { label: 'Économies', type: 'percentage' },
                    stock_optimization: { label: 'Optim. stock', type: 'percentage' },
                    reports_generated: { label: 'Rapports', type: 'count' },
                    dashboard_views: { label: 'Vues dashboard', type: 'count' },
                    data_points: { label: 'Points data', type: 'count' },
                    insight_accuracy: { label: 'Précision insights', type: 'percentage' },
                    decision_support: { label: 'Supports décision', type: 'count' },
                    roi_improvement: { label: 'Amélioration ROI', type: 'percentage' },
                    efficiency_gain: { label: 'Gain efficacité', type: 'percentage' },
                    strategic_insights: { label: 'Insights stratégiques', type: 'count' },
                    campaigns_active: { label: 'Campagnes actives', type: 'count' },
                    conversion_rate: { label: 'Taux conversion', type: 'percentage' },
                    revenue_attributed: { label: 'CA attribué', type: 'currency' },
                    automation_savings: { label: 'Gains auto', type: 'percentage' },
                    warranties_tracked: { label: 'Garanties suivies', type: 'count' },
                    claims_processed: { label: 'SAV traités', type: 'count' },
                    satisfaction_rate: { label: 'Satisfaction', type: 'percentage' },
                    processing_time: { label: 'Temps traitement', type: 'decimal' },
                    active_subscriptions: { label: 'Abonnements actifs', type: 'count' },
                    monthly_recurring_revenue: { label: 'MRR', type: 'currency' },
                    churn_rate: { label: 'Taux churn', type: 'percentage' },
                    ltv_growth: { label: 'Croissance LTV', type: 'percentage' },
                    locations_managed: { label: 'Magasins gérés', type: 'count' },
                    inter_store_transfers: { label: 'Transferts', type: 'count' },
                    centralized_revenue: { label: 'CA centralisé', type: 'currency' }
                  };

                  const metric = metricLabels[key as keyof typeof metricLabels];
                  if (!metric) return null;

                  return (
                    <div key={key} className="bg-white p-3 rounded border">
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                      <div className="text-lg font-semibold">
                        {formatMetric(value as number, metric.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurer
            </Button>
            {isActive && (
              <>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rapports
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const overallStats = {
    modules_active: Object.values(activeModules).filter(Boolean).length,
    total_modules: businessModules.length,
    performance_score: 87.3,
    roi_impact: 24.6
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modules Métier Avancés</h2>
          <p className="text-muted-foreground">Fonctionnalités avancées pour optimiser votre business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importer config
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exporter rapports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Actifs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.modules_active}/{overallStats.total_modules}</div>
            <Progress value={(overallStats.modules_active / overallStats.total_modules) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.performance_score}%</div>
            <p className="text-xs text-muted-foreground">+5.2% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact ROI</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overallStats.roi_impact}%</div>
            <p className="text-xs text-muted-foreground">Amélioration mesurée</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatisation</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Tâches automatisées</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              <category.icon className="mr-2 h-4 w-4" />
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {category.id === 'marketing' && activeModules.loyalty && (
              <LoyaltyProgramManager />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredModules(category.id).map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdvancedBusinessModules;