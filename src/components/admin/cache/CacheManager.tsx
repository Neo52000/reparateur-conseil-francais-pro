import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  HardDrive, 
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useSystemCache } from '@/hooks/useSystemCache';

const CacheManager: React.FC = () => {
  const { stats, entries, loading, loadCacheData, clearCache, warmupCache } = useSystemCache();

  // Les fonctions sont maintenant gérées par le hook useSystemCache

  if (loading && !stats) {
    return <div className="p-6">Chargement des données de cache...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire de Cache</h2>
          <p className="text-muted-foreground">Monitoring et administration du système de cache</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={warmupCache} disabled={loading}>
            <Zap className="w-4 h-4 mr-2" />
            Préchauffer
          </Button>
          <Button variant="destructive" onClick={() => clearCache()} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Vider tout
          </Button>
          <Button onClick={loadCacheData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_size_mb.toFixed(1)} MB</div>
            <Progress value={(stats?.memory_usage_percent || 0)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Utilisation mémoire: {stats?.memory_usage_percent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.hit_ratio.toFixed(1)}%</div>
            <Progress value={stats?.hit_ratio || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Échec: {stats?.miss_ratio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opérations/sec</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.operations_per_second}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Débit en temps réel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clés actives</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_keys.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Entrées en cache
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entrées de cache récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Entrées de cache populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-center p-8 text-muted-foreground">
                Aucune entrée de cache trouvée
              </p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {entry.cache_key}
                    </code>
                    <Badge variant="secondary">{entry.size_mb} MB</Badge>
                    <Badge variant="outline">{entry.hit_count} hits</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-x-4">
                    <span>Créé: {new Date(entry.created_at).toLocaleString('fr-FR')}</span>
                    <span>Dernier accès: {new Date(entry.last_accessed).toLocaleString('fr-FR')}</span>
                    <span>TTL: {Math.floor(entry.ttl_seconds / 60)}min</span>
                  </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => clearCache(entry.cache_key)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration du cache */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration et maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Politique d'éviction</h4>
              <p className="text-sm text-muted-foreground">LRU (Least Recently Used)</p>
              <Badge variant="outline">Actuel</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">TTL par défaut</h4>
              <p className="text-sm text-muted-foreground">1 heure</p>
              <Badge variant="outline">3600s</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Taille maximale</h4>
              <p className="text-sm text-muted-foreground">2 GB</p>
              <Badge variant="outline">Limite</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheManager;