
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BatchGeocodingService } from '@/services/geocoding/BatchGeocodingService';
import { 
  MapPin, 
  RefreshCw, 
  Play, 
  Square, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodingProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  percentage: number;
}

interface DataStats {
  totalRepairers: number;
  withGps: number;
  withoutGps: number;
  withRegion: number;
  withDepartment: number;
  gpsPercentage: number;
}

const DataQualityDashboard: React.FC = () => {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [progress, setProgress] = useState<GeocodingProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repairers')
        .select('lat, region, department');

      if (error) throw error;

      const total = data?.length || 0;
      const withGps = data?.filter(r => r.lat && r.lat !== 0).length || 0;
      const withRegion = data?.filter(r => r.region && r.region !== '').length || 0;
      const withDepartment = data?.filter(r => r.department && r.department !== '').length || 0;

      setStats({
        totalRepairers: total,
        withGps,
        withoutGps: total - withGps,
        withRegion,
        withDepartment,
        gpsPercentage: total > 0 ? Math.round((withGps / total) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const startGeocoding = async () => {
    setGeocoding(true);
    setProgress({ total: 0, processed: 0, success: 0, failed: 0, percentage: 0 });
    
    abortControllerRef.current = new AbortController();

    try {
      toast({
        title: "Géocodage lancé",
        description: "Le géocodage des adresses est en cours..."
      });

      const result = await BatchGeocodingService.runBatchGeocoding(
        (p) => setProgress(p),
        abortControllerRef.current.signal
      );

      toast({
        title: "Géocodage terminé",
        description: `${result.success} adresses géocodées avec succès, ${result.failed} échecs`
      });

      // Rafraîchir les stats
      await fetchStats();

    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Erreur de géocodage",
        description: "Une erreur est survenue pendant le géocodage",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeocoding = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast({
        title: "Géocodage arrêté",
        description: "Le processus a été interrompu"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Chargement des statistiques...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Qualité des données
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Total réparateurs</div>
              <div className="text-2xl font-bold">{stats?.totalRepairers || 0}</div>
            </div>

            {/* Avec GPS */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Avec coordonnées GPS
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats?.withGps || 0}
                <span className="text-sm font-normal ml-2">({stats?.gpsPercentage}%)</span>
              </div>
            </div>

            {/* Sans GPS */}
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                Sans coordonnées GPS
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats?.withoutGps || 0}
              </div>
            </div>

            {/* Région/Département */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <MapPin className="h-4 w-4" />
                Avec région/département
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats?.withRegion || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Géocodage batch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Géocodage automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>
              {stats?.withoutGps || 0} réparateurs n'ont pas de coordonnées GPS et ne sont pas affichés sur la carte.
            </span>
          </div>

          <div className="flex items-center gap-4">
            {geocoding ? (
              <Button variant="destructive" onClick={stopGeocoding}>
                <Square className="h-4 w-4 mr-2" />
                Arrêter
              </Button>
            ) : (
              <Button onClick={startGeocoding} disabled={!stats?.withoutGps}>
                <Play className="h-4 w-4 mr-2" />
                Lancer le géocodage
              </Button>
            )}
            
            <span className="text-sm text-muted-foreground">
              Utilise l'API gratuite adresse.data.gouv.fr
            </span>
          </div>

          {progress && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Traités: {progress.processed}/{progress.total}</span>
                <Badge variant="default" className="bg-green-500">
                  ✓ {progress.success}
                </Badge>
                <Badge variant="destructive">
                  ✗ {progress.failed}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataQualityDashboard;
