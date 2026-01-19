import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Play, Square, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BatchGeocodingService } from '@/services/geocoding/BatchGeocodingService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface GeocodingProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  percentage: number;
}

export function BatchGeocodingPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<GeocodingProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['geocoding-stats'],
    queryFn: () => BatchGeocodingService.getGeocodingStats(),
    refetchInterval: isRunning ? 5000 : false,
  });

  const startGeocoding = async () => {
    if (isRunning) return;

    setIsRunning(true);
    abortControllerRef.current = new AbortController();

    toast.info('Géocodage batch démarré', {
      description: 'Traitement des adresses en cours...'
    });

    try {
      const result = await BatchGeocodingService.runBatchGeocoding(
        (p) => setProgress(p),
        abortControllerRef.current.signal
      );

      if (abortControllerRef.current.signal.aborted) {
        toast.warning('Géocodage interrompu', {
          description: `${result.success} adresses géocodées avant l'arrêt`
        });
      } else {
        toast.success('Géocodage terminé', {
          description: `${result.success} succès, ${result.failed} échecs sur ${result.total} adresses`
        });
      }

      // Refresh stats and repairers data
      await refetchStats();
      queryClient.invalidateQueries({ queryKey: ['repairers'] });

    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Erreur lors du géocodage', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeocoding = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const coveragePercentage = stats?.percentage || 0;
  const coverageColor = coveragePercentage >= 80 ? 'text-green-600' : 
                        coveragePercentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Géocodage des adresses</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            disabled={statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
        <CardDescription>
          Convertit les adresses en coordonnées GPS via l'API adresse.data.gouv.fr
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total réparateurs</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.withGps || 0}</div>
            <div className="text-sm text-muted-foreground">Avec GPS</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats?.withoutGps || 0}</div>
            <div className="text-sm text-muted-foreground">Sans GPS</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${coverageColor}`}>{coveragePercentage}%</div>
            <div className="text-sm text-muted-foreground">Couverture</div>
          </div>
        </div>

        {/* Coverage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Couverture GPS</span>
            <span className={coverageColor}>{coveragePercentage}%</span>
          </div>
          <Progress value={coveragePercentage} className="h-3" />
        </div>

        {/* Progress during geocoding */}
        {isRunning && progress && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">Géocodage en cours...</span>
              <Badge variant="secondary">
                {progress.processed} / {progress.total}
              </Badge>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {progress.success} succès
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                {progress.failed} échecs
              </div>
            </div>
          </div>
        )}

        {/* Info alert */}
        {!isRunning && stats && stats.withoutGps > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.withoutGps}</strong> réparateurs n'ont pas de coordonnées GPS et ne sont pas visibles sur la carte.
              Lancez le géocodage pour les localiser automatiquement.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!isRunning ? (
            <Button 
              onClick={startGeocoding}
              disabled={!stats || stats.withoutGps === 0}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Lancer le géocodage ({stats?.withoutGps || 0} adresses)
            </Button>
          ) : (
            <Button 
              onClick={stopGeocoding}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Arrêter le géocodage
            </Button>
          )}
        </div>

        {/* API Info */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            🇫🇷 Utilise l'API gouvernementale <strong>adresse.data.gouv.fr</strong> (gratuite, sans clé API).
            Délai de 200ms entre chaque requête pour respecter les limites.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
