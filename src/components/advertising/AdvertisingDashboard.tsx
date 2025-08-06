import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Zap, Wand2, Target, DollarSign } from 'lucide-react';
import AICreativeGenerator from './AICreativeGenerator';
import ZapierIntegrations from './ZapierIntegrations';

const AdvertisingDashboard = () => {
  const metrics = [
    {
      title: "Campagnes actives",
      value: "12",
      change: "+3",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "ROAS moyen",
      value: "3.2x",
      change: "+0.4",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Budget dépensé",
      value: "2,450€",
      change: "-120€",
      icon: DollarSign,
      color: "text-orange-600"
    },
    {
      title: "Créatifs IA",
      value: "28",
      change: "+8",
      icon: Wand2,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Publicitaire IA</h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes publicitaires avec l'intelligence artificielle
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <Wand2 className="h-3 w-3 mr-1" />
          IA Activée
        </Badge>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                  {' '}depuis le mois dernier
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphique performance (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance des campagnes
          </CardTitle>
          <CardDescription>
            Évolution des métriques sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Graphique de performance</p>
              <p className="text-sm text-muted-foreground">À implémenter avec Recharts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs defaultValue="creatives" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creatives" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Créatifs IA
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campagnes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creatives">
          <AICreativeGenerator />
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des campagnes</CardTitle>
              <CardDescription>
                Créez et gérez vos campagnes publicitaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Module campagnes à implémenter
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics avancées</CardTitle>
              <CardDescription>
                Analysez en détail les performances de vos publicités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Module analytics à implémenter
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations">
          <ZapierIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvertisingDashboard;