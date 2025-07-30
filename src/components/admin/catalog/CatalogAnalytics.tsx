import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Users,
  Zap,
  Target
} from 'lucide-react';

interface CatalogAnalyticsProps {
  onStatsUpdate: (stats: { totalQuotes: number; unmatchedQuotes: number }) => void;
}

interface QuoteAnalytics {
  total_quotes: number;
  quotes_by_device_type: Array<{ device_type: string; count: number }>;
  quotes_by_brand: Array<{ brand: string; count: number }>;
  quotes_by_repair_type: Array<{ repair_type: string; count: number }>;
  unmatched_quotes: Array<{
    id: string;
    client_name: string;
    device_brand: string;
    device_model: string;
    repair_type: string;
    created_at: string;
  }>;
  conversion_stats: {
    total_quotes: number;
    accepted_quotes: number;
    conversion_rate: number;
  };
}

const CatalogAnalytics: React.FC<CatalogAnalyticsProps> = ({ onStatsUpdate }) => {
  const [analytics, setAnalytics] = useState<QuoteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (analytics) {
      onStatsUpdate({
        totalQuotes: analytics.total_quotes,
        unmatchedQuotes: analytics.unmatched_quotes.length
      });
    }
  }, [analytics, onStatsUpdate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Charger toutes les données nécessaires
      const [quotesResult, catalogResult] = await Promise.all([
        supabase
          .from('quotes_with_timeline')
          .select('*'),
        Promise.all([
          supabase.from('device_types').select('*'),
          supabase.from('brands').select('*'),
          supabase.from('device_models').select('*'),
          supabase.from('repair_types').select('*')
        ])
      ]);

      if (quotesResult.error) throw quotesResult.error;

      const quotes = quotesResult.data || [];
      const [deviceTypesResult, brandsResult, modelsResult, repairTypesResult] = catalogResult;

      // Vérifier les erreurs
      if (deviceTypesResult.error || brandsResult.error || modelsResult.error || repairTypesResult.error) {
        throw new Error('Erreur lors du chargement du catalogue');
      }

      const deviceTypes = deviceTypesResult.data || [];
      const brands = brandsResult.data || [];
      const models = modelsResult.data || [];
      const repairTypes = repairTypesResult.data || [];

      // Analyser les devis par type d'appareil
      const deviceTypeStats: { [key: string]: number } = {};
      quotes.forEach(quote => {
        const deviceType = quote.device_type || 'Non spécifié';
        deviceTypeStats[deviceType] = (deviceTypeStats[deviceType] || 0) + 1;
      });

      // Analyser les devis par marque
      const brandStats: { [key: string]: number } = {};
      quotes.forEach(quote => {
        const brand = quote.device_brand || 'Non spécifié';
        brandStats[brand] = (brandStats[brand] || 0) + 1;
      });

      // Analyser les devis par type de réparation
      const repairTypeStats: { [key: string]: number } = {};
      quotes.forEach(quote => {
        const repairType = quote.repair_type || 'Non spécifié';
        repairTypeStats[repairType] = (repairTypeStats[repairType] || 0) + 1;
      });

      // Identifier les devis non appariés au catalogue
      const unmatchedQuotes = quotes.filter(quote => {
        const hasMatchingDeviceType = deviceTypes.some(dt => 
          dt.name.toLowerCase() === quote.device_type?.toLowerCase()
        );
        const hasMatchingBrand = brands.some(b => 
          b.name.toLowerCase() === quote.device_brand?.toLowerCase()
        );
        const hasMatchingModel = models.some(m => 
          m.name.toLowerCase() === quote.device_model?.toLowerCase()
        );
        const hasMatchingRepairType = repairTypes.some(rt => 
          rt.name.toLowerCase() === quote.repair_type?.toLowerCase()
        );

        return !hasMatchingDeviceType || !hasMatchingBrand || !hasMatchingModel || !hasMatchingRepairType;
      });

      // Statistiques de conversion
      const acceptedQuotes = quotes.filter(q => q.status === 'accepted' || q.status === 'completed');
      const conversionRate = quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0;

      setAnalytics({
        total_quotes: quotes.length,
        quotes_by_device_type: Object.entries(deviceTypeStats)
          .map(([device_type, count]) => ({ device_type, count }))
          .sort((a, b) => b.count - a.count),
        quotes_by_brand: Object.entries(brandStats)
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => b.count - a.count),
        quotes_by_repair_type: Object.entries(repairTypeStats)
          .map(([repair_type, count]) => ({ repair_type, count }))
          .sort((a, b) => b.count - a.count),
        unmatched_quotes: unmatchedQuotes.map(quote => ({
          id: quote.id,
          client_name: quote.client_name,
          device_brand: quote.device_brand,
          device_model: quote.device_model,
          repair_type: quote.repair_type,
          created_at: quote.created_at
        })),
        conversion_stats: {
          total_quotes: quotes.length,
          accepted_quotes: acceptedQuotes.length,
          conversion_rate: conversionRate
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics du catalogue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Impossible de charger les analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total devis</p>
                <p className="text-2xl font-bold">{analytics.total_quotes}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux conversion</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.conversion_stats.conversion_rate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gaps catalogue</p>
                <p className="text-2xl font-bold text-red-600">{analytics.unmatched_quotes.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Couverture</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.total_quotes > 0 
                    ? ((analytics.total_quotes - analytics.unmatched_quotes.length) / analytics.total_quotes * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Types d'appareils populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Types d'appareils populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.quotes_by_device_type.slice(0, 5).map((item, index) => (
                <div key={item.device_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{item.device_type}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marques populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Marques populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.quotes_by_brand.slice(0, 5).map((item, index) => (
                <div key={item.brand} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{item.brand}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Types de réparation populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Réparations populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.quotes_by_repair_type.slice(0, 5).map((item, index) => (
                <div key={item.repair_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{item.repair_type}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devis non appariés */}
      {analytics.unmatched_quotes.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Devis non appariés au catalogue ({analytics.unmatched_quotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ces devis contiennent des éléments qui ne correspondent pas exactement au catalogue actuel. 
                Considérez ajouter ces éléments au catalogue pour améliorer la couverture.
              </p>
              
              <div className="space-y-2">
                {analytics.unmatched_quotes.slice(0, 10).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                    <div>
                      <p className="font-medium text-sm">{quote.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.device_brand} {quote.device_model} • {quote.repair_type}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      Gap détecté
                    </Badge>
                  </div>
                ))}
                
                {analytics.unmatched_quotes.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ... et {analytics.unmatched_quotes.length - 10} autres devis
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={loadAnalytics}>
                  Actualiser l'analyse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CatalogAnalytics;