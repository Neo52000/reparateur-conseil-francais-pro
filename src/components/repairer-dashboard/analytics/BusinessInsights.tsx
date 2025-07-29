import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Lightbulb, Target, Users, Star, TrendingUp, FileText, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InsightData {
  performanceScore: number;
  competitorAnalysis: Array<{ metric: string; vous: number; concurrent: number; marche: number }>;
  customerSegments: Array<{ segment: string; revenue: number; satisfaction: number; count: number }>;
  opportunities: Array<{ opportunity: string; impact: string; effort: string; roi: number }>;
  benchmarks: Array<{ kpi: string; current: number; industry: number; target: number }>;
}

const BusinessInsights: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightData>({
    performanceScore: 0,
    competitorAnalysis: [],
    customerSegments: [],
    opportunities: [],
    benchmarks: []
  });

  useEffect(() => {
    if (profile?.id) {
      loadBusinessInsights();
    }
  }, [profile?.id]);

  const loadBusinessInsights = async () => {
    try {
      setLoading(true);
      
      // Données simulées pour la démo
      const mockInsights: InsightData = {
        performanceScore: 87,
        competitorAnalysis: [
          { metric: 'Prix moyen', vous: 85, concurrent: 92, marche: 88 },
          { metric: 'Délai', vous: 90, concurrent: 75, marche: 82 },
          { metric: 'Satisfaction', vous: 94, concurrent: 87, marche: 85 },
          { metric: 'Disponibilité', vous: 88, concurrent: 95, marche: 91 },
          { metric: 'Innovation', vous: 82, concurrent: 78, marche: 80 }
        ],
        customerSegments: [
          { segment: 'Particuliers fidèles', revenue: 3200, satisfaction: 96, count: 45 },
          { segment: 'Nouveaux clients', revenue: 1800, satisfaction: 88, count: 32 },
          { segment: 'Entreprises', revenue: 2100, satisfaction: 92, count: 12 },
          { segment: 'Clients ponctuels', revenue: 950, satisfaction: 85, count: 28 }
        ],
        opportunities: [
          { opportunity: 'Extension horaires soirée', impact: 'Élevé', effort: 'Moyen', roi: 85 },
          { opportunity: 'Service réparation domicile', impact: 'Très élevé', effort: 'Élevé', roi: 120 },
          { opportunity: 'Partenariat écoles/universités', impact: 'Moyen', effort: 'Faible', roi: 65 },
          { opportunity: 'Réparations express (-1h)', impact: 'Élevé', effort: 'Moyen', roi: 95 }
        ],
        benchmarks: [
          { kpi: 'Temps réparation', current: 2.5, industry: 3.2, target: 2.0 },
          { kpi: 'Taux satisfaction', current: 94, industry: 87, target: 96 },
          { kpi: 'Prix compétitif', current: 85, industry: 88, target: 90 },
          { kpi: 'Fidélisation', current: 78, industry: 72, target: 85 }
        ]
      };

      setInsights(mockInsights);

    } catch (error) {
      console.error('Erreur chargement insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunityColor = (impact: string) => {
    switch (impact) {
      case 'Très élevé': return 'bg-green-100 text-green-800 border-green-300';
      case 'Élevé': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generateReport = () => {
    // Fonctionnalité de génération de rapport
    console.log('Génération du rapport analytics...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score de performance global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score de Performance Global
            </span>
            <Button variant="outline" size="sm" onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{insights.performanceScore}/100</div>
            <div className="flex-1">
              <Progress value={insights.performanceScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Excellent! Vous êtes dans le top 15% des réparateurs de votre région.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="competitive" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitive">Concurrence</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        {/* Analyse concurrentielle */}
        <TabsContent value="competitive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyse Concurrentielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={insights.competitorAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={18} domain={[0, 100]} />
                  <Radar name="Vous" dataKey="vous" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Concurrent moyen" dataKey="concurrent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Radar name="Marché" dataKey="marche" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-4 h-4 bg-blue-500 inline-block rounded mr-2"></div>
                  <span className="text-sm">Votre performance</span>
                </div>
                <div>
                  <div className="w-4 h-4 bg-red-500 inline-block rounded mr-2"></div>
                  <span className="text-sm">Concurrence</span>
                </div>
                <div>
                  <div className="w-4 h-4 bg-green-500 inline-block rounded mr-2"></div>
                  <span className="text-sm">Moyenne marché</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments clients */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Analyse des Segments Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.customerSegments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `${value}€` : name === 'satisfaction' ? `${value}%` : `${value} clients`,
                    name === 'revenue' ? 'Revenus' : name === 'satisfaction' ? 'Satisfaction' : 'Nombre'
                  ]} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                  <Bar dataKey="satisfaction" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.customerSegments.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{segment.segment}</h4>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Revenus: <span className="font-medium text-foreground">{segment.revenue}€</span></p>
                      <p>Satisfaction: <span className="font-medium text-foreground">{segment.satisfaction}%</span></p>
                      <p>Clients: <span className="font-medium text-foreground">{segment.count}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunités */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Opportunités de Croissance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.opportunities.map((opp, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{opp.opportunity}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getOpportunityColor(opp.impact)}>
                            Impact: {opp.impact}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Effort: {opp.effort}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">+{opp.roi}%</div>
                        <div className="text-sm text-muted-foreground">ROI estimé</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommandation IA
                </h4>
                <p className="text-sm text-blue-800 mt-2">
                  Priorisez le "Service réparation domicile" - ROI élevé et différenciation forte.
                  Commencez par un test sur 3 mois dans un rayon de 5km.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks */}
        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Benchmarks Sectoriels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {insights.benchmarks.map((benchmark, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{benchmark.kpi}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Secteur: {benchmark.industry}
                          {benchmark.kpi.includes('Taux') || benchmark.kpi.includes('Prix') || benchmark.kpi.includes('Fidélisation') ? '%' : 'j'}
                        </span>
                        <span className="text-green-600 font-medium">
                          Objectif: {benchmark.target}
                          {benchmark.kpi.includes('Taux') || benchmark.kpi.includes('Prix') || benchmark.kpi.includes('Fidélisation') ? '%' : 'j'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress value={(benchmark.current / benchmark.target) * 100} className="h-3" />
                      <div className="absolute top-0 left-0 h-3 w-full flex items-center justify-between text-xs">
                        <span className="ml-2 font-medium text-white">
                          {benchmark.current}
                          {benchmark.kpi.includes('Taux') || benchmark.kpi.includes('Prix') || benchmark.kpi.includes('Fidélisation') ? '%' : 'j'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span className="flex items-center gap-1">
                        {benchmark.current > benchmark.industry ? '📈' : '📉'}
                        {benchmark.current > benchmark.industry ? 'Au-dessus' : 'En-dessous'} du secteur
                      </span>
                      <span>{benchmark.target}
                        {benchmark.kpi.includes('Taux') || benchmark.kpi.includes('Prix') || benchmark.kpi.includes('Fidélisation') ? '%' : 'j'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Recommandées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <RefreshCw className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Actualiser les données</div>
                <div className="text-sm text-muted-foreground">Dernière MAJ: il y a 2h</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Rapport mensuel</div>
                <div className="text-sm text-muted-foreground">Générer PDF complet</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <Target className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Définir objectifs</div>
                <div className="text-sm text-muted-foreground">Configurer les KPIs</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInsights;