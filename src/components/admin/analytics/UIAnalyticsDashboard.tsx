import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalConfigurations: number;
    activeTests: number;
    totalViews: number;
    conversionRate: number;
  };
  performance: {
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    bounceRate: number;
  }[];
  deviceBreakdown: {
    device: string;
    users: number;
    percentage: number;
  }[];
  topConfigurations: {
    name: string;
    views: number;
    conversions: number;
    conversionRate: number;
    performance: string;
  }[];
  abTestResults: {
    testName: string;
    variant: string;
    participants: number;
    conversionRate: number;
    confidence: number;
    status: 'running' | 'completed' | 'paused';
  }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#FF8042'];

export const UIAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  
  const { trackAnalyticsEvent } = useUIConfigurations();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Analytics UI pas encore implémentées en base de données
      console.log('UI Analytics will be implemented later');
      
      // Mode production - aucune donnée mockée
      setAnalyticsData(null);
    } catch (error) {
      console.log('Analytics UI pas encore implémentées');
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadAnalyticsData();
    trackAnalyticsEvent('dashboard_refresh', { timeRange: selectedTimeRange });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Interface</h2>
          <p className="text-muted-foreground">
            Analysez les performances de vos configurations d'interface
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Alert pour données non disponibles */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les analytics d'interface seront disponibles prochainement. 
          Cette fonctionnalité permettra d'analyser les performances des différentes configurations d'interface utilisateur.
        </AlertDescription>
      </Alert>

      {/* Métriques de base - vides en production */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configurations</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Monitor className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests actifs</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux conversion</p>
                <p className="text-2xl font-bold">0.0%</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <MousePointer className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques - vides pour la production */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Performance par appareil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-sm mt-2">Les données d'analytics apparaîtront ici</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-sm mt-2">Les graphiques de performance apparaîtront ici</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurations top performers - vide */}
      <Card>
        <CardHeader>
          <CardTitle>Top configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune configuration disponible</p>
            <p className="text-sm mt-2">Les meilleures configurations apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};