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

const AdminFeaturesManager: React.FC = () => {
  const { 
    loading, 
    usageStats, 
    moduleConfigs, 
    updateModuleConfiguration, 
    toggleModuleStatus, 
    getTotalStats 
  } = useFeatureManagement();

  const [activeModule, setActiveModule] = useState<string | null>(null);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button variant="outline" size="sm">
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