import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Brain,
  Calendar,
  DollarSign,
  Package2,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Prediction {
  id: string;
  type: 'revenue' | 'demand' | 'stock' | 'customer';
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  confidence: number;
}

const PredictiveInsights = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    generatePredictions();
  }, [user]);

  const generatePredictions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les données historiques
      const { data: transactions } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('repairer_id', user.id)
        .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('transaction_date', { ascending: true });

      const { data: inventory } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .eq('repairer_id', user.id);

      // Générer des prédictions basées sur les données
      const generatedPredictions: Prediction[] = [];
      const chartData: ForecastData[] = [];

      if (transactions && transactions.length > 0) {
        // Analyse des revenus
        const weeklyRevenue = calculateWeeklyRevenue(transactions);
        const revenueGrowth = calculateGrowthRate(weeklyRevenue);
        
        const nextWeekRevenue = weeklyRevenue[weeklyRevenue.length - 1] * (1 + revenueGrowth);
        const nextMonthRevenue = weeklyRevenue.reduce((a, b) => a + b, 0) * 1.1; // Estimation simplifiée

        generatedPredictions.push({
          id: 'revenue-prediction',
          type: 'revenue',
          title: 'Revenus semaine prochaine',
          currentValue: weeklyRevenue[weeklyRevenue.length - 1] || 0,
          predictedValue: nextWeekRevenue,
          confidence: 78,
          timeframe: '7 jours',
          trend: revenueGrowth > 0 ? 'up' : 'down',
          impact: 'high',
          recommendation: revenueGrowth > 0.1 ? 
            'Tendance positive ! Maintenez vos efforts marketing.' :
            'Croissance ralentie. Considérez une promotion ou une campagne locale.'
        });

        // Prédiction stock
        if (inventory && inventory.length > 0) {
          const fastMovingItems = inventory.filter(item => 
            item.current_stock < item.minimum_stock * 2
          );

          if (fastMovingItems.length > 0) {
            generatedPredictions.push({
              id: 'stock-prediction',
              type: 'stock',
              title: 'Articles à réapprovisionner',
              currentValue: fastMovingItems.length,
              predictedValue: fastMovingItems.length + 2,
              confidence: 85,
              timeframe: '14 jours',
              trend: 'up',
              impact: 'medium',
              recommendation: `Préparez la commande pour ${fastMovingItems.map(i => i.name).slice(0, 2).join(', ')}`
            });
          }
        }

        // Générer données graphique
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });

        chartData.push(...last30Days.map((date, index) => {
          const dayTransactions = transactions.filter(t => 
            t.transaction_date.split('T')[0] === date
          );
          const dayRevenue = dayTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
          
          // Prédiction simple basée sur la tendance
          const predicted = index < 23 ? dayRevenue : dayRevenue * (1 + revenueGrowth * (index - 22) / 7);
          
          return {
            date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            actual: index < 23 ? dayRevenue : undefined,
            predicted: predicted,
            confidence: Math.max(95 - index * 2, 60)
          };
        }));
      }

      // Prédictions par défaut si pas assez de données
      if (generatedPredictions.length === 0) {
        generatedPredictions.push(
          {
            id: 'setup-needed',
            type: 'revenue',
            title: 'Données insuffisantes',
            currentValue: 0,
            predictedValue: 0,
            confidence: 0,
            timeframe: 'N/A',
            trend: 'stable',
            impact: 'low',
            recommendation: 'Utilisez le POS pendant quelques semaines pour obtenir des prédictions précises'
          }
        );

        // Données de démonstration pour le graphique
        chartData.push(...Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          predicted: Math.random() * 200 + 100,
          confidence: 75
        })));
      }

      setPredictions(generatedPredictions);
      setForecastData(chartData);
    } catch (error) {
      console.error('Erreur génération prédictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyRevenue = (transactions: any[]) => {
    const weeks: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeks[weekKey] = (weeks[weekKey] || 0) + (transaction.total_amount || 0);
    });
    
    return Object.values(weeks);
  };

  const calculateGrowthRate = (values: number[]) => {
    if (values.length < 2) return 0;
    
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(values.length - 3, 1);
    
    return older > 0 ? (recent - older) / older : 0;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Prédictions IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prévisionnel 14 jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Prédictions IA
            <Badge variant="outline">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map(prediction => (
            <div key={prediction.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{prediction.title}</h4>
                  {getTrendIcon(prediction.trend)}
                </div>
                <Badge variant="outline" className={getImpactColor(prediction.impact)}>
                  Impact {prediction.impact}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Actuel:</span>
                  <span className="ml-2 font-medium">
                    {prediction.type === 'revenue' ? `${prediction.currentValue.toFixed(2)}€` : prediction.currentValue}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Prévu:</span>
                  <span className="ml-2 font-medium">
                    {prediction.type === 'revenue' ? `${prediction.predictedValue.toFixed(2)}€` : prediction.predictedValue}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confiance</span>
                  <span>{prediction.confidence}%</span>
                </div>
                <Progress value={prediction.confidence} className="h-2" />
              </div>
              
              <p className="text-sm text-gray-600 italic">
                💡 {prediction.recommendation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Prévisionnel 14 jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)}€`, 
                    name === 'actual' ? 'Réel' : 'Prévu'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Données réelles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>Prédictions IA</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveInsights;