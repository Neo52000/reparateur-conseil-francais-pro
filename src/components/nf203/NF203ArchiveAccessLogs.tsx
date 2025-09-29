import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileCheck, Search, Calendar } from 'lucide-react';
import { NF203ArchiveAccessService } from '@/services/nf203ArchiveAccessService';
import { Skeleton } from '@/components/ui/skeleton';

interface NF203ArchiveAccessLogsProps {
  repairerId: string;
  archiveId?: string;
}

export function NF203ArchiveAccessLogs({ repairerId, archiveId }: NF203ArchiveAccessLogsProps) {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['nf203-access-stats', repairerId, days],
    queryFn: () => NF203ArchiveAccessService.getAccessStats(repairerId, days)
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['nf203-access-logs', archiveId],
    queryFn: () => archiveId ? NF203ArchiveAccessService.getArchiveAccessHistory(archiveId) : Promise.resolve([]),
    enabled: !!archiveId
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'verify':
        return <FileCheck className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      view: 'Consultation',
      download: 'Téléchargement',
      export: 'Export',
      verify: 'Vérification',
      search: 'Recherche'
    };
    return labels[action] || action;
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs d'accès RGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Logs d'accès RGPD</span>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
              >
                {d}j
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total d'accès</p>
              <p className="text-2xl font-bold">{stats.total_accesses}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Moyenne/jour</p>
              <p className="text-2xl font-bold">{stats.daily_average}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Utilisateurs uniques</p>
              <p className="text-2xl font-bold">{stats.unique_users}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Action principale</p>
              <p className="text-lg font-bold capitalize">{getActionLabel(stats.most_common_action)}</p>
            </div>
          </div>
        )}

        {/* Liste des logs pour une archive spécifique */}
        {archiveId && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Historique d'accès détaillé</h4>
            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{getActionLabel(log.action)}</Badge>
                          {log.access_reason && (
                            <span className="text-sm text-muted-foreground">
                              - {log.access_reason}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                          {log.duration_ms && (
                            <span>• {(log.duration_ms / 1000).toFixed(1)}s</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun accès enregistré pour cette archive
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>🔒 <strong>Conformité RGPD - Article 30</strong></p>
          <p className="mt-1">
            Tous les accès aux archives sont tracés conformément au RGPD. Ces logs sont conservés
            de manière sécurisée et immuable pendant la durée légale.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
