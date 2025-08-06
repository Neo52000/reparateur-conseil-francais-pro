import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Calendar, Euro, Users, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PredictionData {
  demandForecast: Array<{ period: string; predicted: number; confidence: number }>;
  revenueForecast: Array<{ month: string; revenue: number; growth: number }>;
  seasonalTrends: Array<{ season: string; demand: number; profitability: number }>;
  riskFactors: Array<{ factor: string; risk: number; impact: string }>;
}

const PredictiveAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<PredictionData>({
    demandForecast: [],
    revenueForecast: [],
    seasonalTrends: [],
    riskFactors: []
  });

  useEffect(() => {
    if (profile?.id) {
      loadPredictiveData();
    }
  }, [profile?.id]);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      
      // Simuler des données prédictives (en réalité, cela viendrait de modèles IA)
      const mockPredictions: PredictionData = {
        demandForecast: [
          { period: 'Sem 1', predicted: 25, confidence: 89 },
          { period: 'Sem 2', predicted: 28, confidence: 85 },
          { period: 'Sem 3', predicted: 32, confidence: 82 },
          { period: 'Sem 4', predicted: 30, confidence: 88 },
          { period: 'Sem 5', predicted: 35, confidence: 84 },
          { period: 'Sem 6', predicted: 38, confidence: 81 }
        ],
        revenueForecast: [
          { month: 'Fév', revenue: 4200, growth: 12 },
          { month: 'Mar', revenue: 4680, growth: 15 },
          { month: 'Avr', revenue: 5150, growth: 18 },
          { month: 'Mai', revenue: 5890, growth: 22 },
          { month: 'Jun', revenue: 6420, growth: 25 }
        ],
        seasonalTrends: [
          { season: 'Hiver', demand: 85, profitability: 92 },
          { season: 'Printemps', demand: 95, profitability: 88 },
          { season: 'Été', demand: 78, profitability: 85 },
          { season: 'Automne', demand: 92, profitability: 90 }
        ],
        riskFactors: [
          { factor: 'Concurrence locale', risk: 35, impact: 'Moyen' },
          { factor: 'Pénurie pièces', risk: 68, impact: 'Élevé' },
          { factor: 'Évolution technologique', risk: 42, impact: 'Moyen' },
          { factor: 'Saisonnalité', risk: 25, impact: 'Faible' }
        ]
      };

      setPredictions(mockPredictions);

    } catch (error) {
      console.error('Erreur chargement prédictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const PredictionCard = ({ title, icon: Icon, children }: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec insights rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Précision IA</p>
                <p className="text-xl font-bold">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Croissance prévue</p>
                <p className="text-xl font-bold text-green-500">+22%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Demande pic</p>
                <p className="text-xl font-bold">Semaine 6</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alertes</p>
                <p className="text-xl font-bold">2 Risques</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prévision de demande */}
        <PredictionCard title="Prévision de demande (6 semaines)" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictions.demandForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'predicted' ? `${value} réparations` : `${value}% confiance`,
                  name === 'predicted' ? 'Prédiction' : 'Confiance'
                ]} 
              />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <Badge variant="secondary">
              IA Recommendation: Préparer 15% de stock supplémentaire pour semaine 6
            </Badge>
          </div>
        </PredictionCard>

        {/* Prévision de revenus */}
        <PredictionCard title="Prévision revenus (5 mois)" icon={Euro}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={predictions.revenueForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, 'Revenus prévus']} />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Croissance moyenne prévue: <span className="font-semibold text-green-600">+18%</span>
            </p>
            <Badge variant="secondary">
              Objectif CA annuel: Atteignable à 94%
            </Badge>
          </div>
        </PredictionCard>

        {/* Tendances saisonnières */}
        <PredictionCard title="Analyse saisonnière" icon={Calendar}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={predictions.seasonalTrends}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ season, demand }) => `${season} (${demand}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="demand"
              >
                {predictions.seasonalTrends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <Badge variant="outline">
              Meilleure période: Printemps (95% demande, 88% rentabilité)
            </Badge>
          </div>
        </PredictionCard>

        {/* Facteurs de risque */}
        <PredictionCard title="Analyse des risques" icon={AlertTriangle}>
          <div className="space-y-4">
            {predictions.riskFactors.map((risk, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{risk.factor}</span>
                  <Badge variant={risk.risk > 60 ? 'destructive' : risk.risk > 30 ? 'default' : 'secondary'}>
                    {risk.impact}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Progress value={risk.risk} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Niveau de risque: <span className={getRiskColor(risk.risk)}>{risk.risk}%</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Générer plan d'action IA
            </Button>
          </div>
        </PredictionCard>
      </div>

      {/* Recommandations IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recommandations intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900">📈 Optimisation des prix</h4>
              <p className="text-sm text-blue-800 mt-2">
                L'IA recommande d'augmenter les tarifs écran iPhone de 8% en période de forte demande (semaines 5-6).
                Impact estimé: +1,200€ de revenus supplémentaires.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900">🎯 Stratégie marketing</h4>
              <p className="text-sm text-green-800 mt-2">
                Concentrer les efforts publicitaires 2 semaines avant les pics saisonniers.
                ROI estimé: +35% par rapport à la stratégie actuelle.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900">⚠️ Gestion des stocks</h4>
              <p className="text-sm text-yellow-800 mt-2">
                Risque de rupture détecté pour les écrans Samsung Galaxy S23.
                Commander 25 unités avant la fin du mois pour éviter les pertes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalytics;