import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNF203Archives } from '@/hooks/useNF203Archives';
import { Archive, HardDrive, Shield, Clock, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NF203ArchiveManagerProps {
  repairerId: string;
}

export function NF203ArchiveManager({ repairerId }: NF203ArchiveManagerProps) {
  const {
    archives,
    archiveStats,
    isLoading,
    setLegalHold,
    isSettingLegalHold,
    markExpired,
    isMarkingExpired
  } = useNF203Archives(repairerId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Archive className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = archiveStats;

  return (
    <div className="space-y-4">
      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">archives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.legal_hold || 0}</div>
            <p className="text-xs text-muted-foreground">légale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stockage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_size_mb || 0}</div>
            <p className="text-xs text-muted-foreground">MB utilisés</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markExpired()}
            disabled={isMarkingExpired}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            Marquer les archives expirées
          </Button>
        </CardContent>
      </Card>

      {/* Liste des archives */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archives récentes
              </CardTitle>
              <CardDescription>
                Historique des documents archivés
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {archives && archives.length > 0 ? (
                archives.map((archive) => (
                  <div
                    key={archive.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {archive.document_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {archive.archive_format}
                        </Badge>
                        {archive.legal_hold && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Conservation légale
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {Math.round(archive.file_size / 1024)} KB
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(archive.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLegalHold({
                          archiveId: archive.id,
                          enabled: !archive.legal_hold
                        })
                      }
                      disabled={isSettingLegalHold}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Aucune archive trouvée
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
