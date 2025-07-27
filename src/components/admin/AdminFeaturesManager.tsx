import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign,
  Database,
  ShoppingCart,
  PenTool,
  Wrench,
  Eye,
  BarChart3,
  Cog,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useFeatureManagement } from '@/hooks/useFeatureManagement';
import FeatureSyncDebugPanel from '@/components/admin/FeatureSyncDebugPanel';
import { useToast } from '@/hooks/use-toast';

const AdminFeaturesManager: React.FC = () => {
  const { toast } = useToast();
  const { 
    loading, 
    usageStats, 
    moduleConfigs, 
    planConfigs,
    planFeatures,
    planFeatureMatrix,
    updateModuleConfiguration, 
    toggleModuleStatus,
    togglePlanFeature,
    updatePlanPricing,
    getTotalStats,
    getPlanStats
  } = useFeatureManagement();

  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [editingPrices, setEditingPrices] = useState<Record<string, boolean>>({});
  const [tempPrices, setTempPrices] = useState<Record<string, { monthly: number, yearly: number }>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Chargement des fonctionnalités...</p>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();

  const getModuleIcon = (moduleType: string) => {
    switch (moduleType) {
      case 'pos': return Database;
      case 'ecommerce': return ShoppingCart;
      case 'blog': return PenTool;
      case 'repair': return Wrench;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'deprecated': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Total</p>
                <p className="text-2xl font-bold">{totalStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold">{totalStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usage Mensuel</p>
                <p className="text-2xl font-bold">{totalStats.monthlyUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impact Revenus</p>
                <p className="text-2xl font-bold">{totalStats.revenueImpact}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale avec onglets */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="plans">Plans & Fonctionnalités</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Statistiques par module */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistiques par Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageStats.map((stat) => {
                  const Icon = getModuleIcon(stat.moduleType);
                  return (
                    <div key={stat.moduleType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{stat.moduleName}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.activeUsers}/{stat.totalUsers} utilisateurs actifs
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(stat.status)} text-white`}>
                        {stat.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* État des modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="w-5 h-5" />
                  État des Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {moduleConfigs.map((config) => {
                  const Icon = getModuleIcon(config.moduleType);
                  return (
                    <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{config.moduleName}</p>
                          <p className="text-sm text-muted-foreground">v{config.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.isEnabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <Switch
                          checked={config.isEnabled}
                          onCheckedChange={() => toggleModuleStatus(config.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {/* Toggle mensuel/annuel */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button 
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                Mensuel
              </Button>
              <Button 
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
              >
                Annuel
              </Button>
            </div>
          </div>

          {/* Header des plans tarifaires */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {planConfigs.map((plan) => {
              const currentPrice = billingCycle === 'monthly' ? plan.planPriceMonthly : plan.planPriceYearly;
              const isEditing = editingPrices[plan.planName];
              
              return (
                <Card key={plan.planName}>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg mb-2">{plan.planName}</h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={tempPrices[plan.planName]?.monthly || plan.planPriceMonthly}
                          onChange={(e) => setTempPrices(prev => ({
                            ...prev,
                            [plan.planName]: {
                              ...prev[plan.planName],
                              monthly: parseFloat(e.target.value) || 0
                            }
                          }))}
                          className="w-full p-2 border rounded text-center"
                          placeholder="Prix mensuel"
                        />
                        <input
                          type="number"
                          value={tempPrices[plan.planName]?.yearly || plan.planPriceYearly}
                          onChange={(e) => setTempPrices(prev => ({
                            ...prev,
                            [plan.planName]: {
                              ...prev[plan.planName],
                              yearly: parseFloat(e.target.value) || 0
                            }
                          }))}
                          className="w-full p-2 border rounded text-center"
                          placeholder="Prix annuel"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => {
                            const prices = tempPrices[plan.planName];
                            if (prices) {
                              updatePlanPricing(plan.planName, prices.monthly, prices.yearly);
                            }
                            setEditingPrices(prev => ({ ...prev, [plan.planName]: false }));
                          }}>
                            Sauver
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingPrices(prev => ({ ...prev, [plan.planName]: false }));
                            setTempPrices(prev => ({ ...prev, [plan.planName]: undefined }));
                          }}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-primary">{currentPrice}€/{billingCycle === 'monthly' ? 'mois' : 'an'}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => {
                            setEditingPrices(prev => ({ ...prev, [plan.planName]: true }));
                            setTempPrices(prev => ({
                              ...prev,
                              [plan.planName]: {
                                monthly: plan.planPriceMonthly,
                                yearly: plan.planPriceYearly
                              }
                            }));
                          }}
                        >
                          Modifier tarifs
                        </Button>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">{plan.subscribers} abonnés</p>
                    <Badge variant="outline">{plan.revenue}€ revenus</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gestion des tarifs modules optionnels */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tarifs des Modules Optionnels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Module POS */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Module POS</h3>
                      <p className="text-sm text-muted-foreground">Point de vente & gestion d'inventaire</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prix mensuel:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue="49.90"
                          className="w-20 p-1 border rounded text-center text-sm"
                          step="0.10"
                        />
                        <span className="text-sm">€/mois</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prix annuel:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue="499.00"
                          className="w-20 p-1 border rounded text-center text-sm"
                          step="1.00"
                        />
                        <span className="text-sm">€/an</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Économie annuelle:</span>
                        <span className="text-green-600 font-medium">99.80€</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      Mettre à jour les tarifs POS
                    </Button>
                  </div>
                </div>

                {/* Module E-commerce */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Module E-commerce</h3>
                      <p className="text-sm text-muted-foreground">Boutique en ligne intégrée</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prix mensuel:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue="89.90"
                          className="w-20 p-1 border rounded text-center text-sm"
                          step="0.10"
                        />
                        <span className="text-sm">€/mois</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prix annuel:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue="890.00"
                          className="w-20 p-1 border rounded text-center text-sm"
                          step="1.00"
                        />
                        <span className="text-sm">€/an</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Économie annuelle:</span>
                        <span className="text-green-600 font-medium">188.80€</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      Mettre à jour les tarifs E-commerce
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Information importante</span>
                </div>
                <p className="text-sm text-blue-800">
                  Les modules optionnels sont uniquement disponibles avec les plans Premium et Enterprise. 
                  Toute modification des tarifs sera appliquée immédiatement pour les nouveaux abonnements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Matrice Plan × Fonctionnalité */}
          <Card>
            <CardHeader>
              <CardTitle>Matrice Plans & Fonctionnalités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Fonctionnalité</th>
                      {planConfigs.map((plan) => (
                        <th key={plan.planName} className="text-center p-3 font-medium min-w-[120px]">
                          {plan.planName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planFeatureMatrix.map((item) => (
                      <tr key={item.feature.featureKey} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{item.feature.featureName}</p>
                            <p className="text-sm text-muted-foreground">{item.feature.description}</p>
                            <Badge variant="outline" className="mt-1">{item.feature.category}</Badge>
                          </div>
                        </td>
                        {planConfigs.map((plan) => (
                          <td key={plan.planName} className="p-3 text-center">
                            <Switch
                              checked={item.planAccess[plan.planName] || false}
                              onCheckedChange={() => togglePlanFeature(plan.planName, item.feature.featureKey)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {moduleConfigs.map((config) => {
              const Icon = getModuleIcon(config.moduleType);
              const stats = usageStats.find(s => s.moduleType === config.moduleType);
              
              return (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <div>
                          <CardTitle>{config.moduleName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Version {config.version} • {config.dependencies.length} dépendances
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={config.isEnabled}
                        onCheckedChange={() => toggleModuleStatus(config.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
                        <p className="text-sm text-muted-foreground">Utilisateurs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats?.monthlyUsage || 0}</p>
                        <p className="text-sm text-muted-foreground">Usage/mois</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats?.revenueImpact || 0}€</p>
                        <p className="text-sm text-muted-foreground">Impact revenus</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{config.documentation}</p>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setActiveModule(config.id);
                        toast({
                          title: "Détails du module",
                          description: `Affichage des détails pour ${config.moduleName}`,
                        });
                      }}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        updateModuleConfiguration(config.id, { ...config.configuration });
                        toast({
                          title: "Configuration",
                          description: `Configuration de ${config.moduleName} mise à jour`,
                        });
                      }}>
                        <Settings className="w-4 h-4 mr-1" />
                        Configurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse d'utilisation détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usageStats.map((stat) => {
                  const Icon = getModuleIcon(stat.moduleType);
                  const utilizationRate = Math.round((stat.activeUsers / stat.totalUsers) * 100);
                  
                  return (
                    <div key={stat.moduleType} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{stat.moduleName}</h3>
                        <Badge variant="outline">{utilizationRate}% utilisation</Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Utilisateurs totaux</p>
                          <p className="font-medium">{stat.totalUsers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilisateurs actifs</p>
                          <p className="font-medium">{stat.activeUsers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Usage mensuel</p>
                          <p className="font-medium">{stat.monthlyUsage}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dernière mise à jour</p>
                          <p className="font-medium">
                            {new Date(stat.lastUpdate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {/* Panneau de debug en premier */}
          <FeatureSyncDebugPanel />
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Maintenance automatique</p>
                    <p className="text-sm text-muted-foreground">
                      Nettoyage automatique des logs et optimisation
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Collecte de métriques</p>
                    <p className="text-sm text-muted-foreground">
                      Collecte anonyme des statistiques d'utilisation
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Notifications admin</p>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les problèmes critiques
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFeaturesManager;