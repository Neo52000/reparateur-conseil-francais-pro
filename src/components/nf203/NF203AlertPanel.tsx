import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info, Clock } from 'lucide-react';
import { NF203AlertService } from '@/services/nf203AlertService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface NF203AlertPanelProps {
  repairerId: string;
}

export function NF203AlertPanel({ repairerId }: NF203AlertPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['nf203-alerts', repairerId],
    queryFn: () => NF203AlertService.getActiveAlerts(repairerId),
    refetchInterval: 30000
  });

  const { data: stats } = useQuery({
    queryKey: ['nf203-alert-stats', repairerId],
    queryFn: () => NF203AlertService.getAlertStats(repairerId)
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => NF203AlertService.acknowledgeAlert(alertId, repairerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-alerts'] });
      toast({
        title: 'Alerte acquittée',
        description: 'L\'alerte a été marquée comme prise en compte',
      });
    }
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => NF203AlertService.resolveAlert(alertId, repairerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-alerts'] });
      toast({
        title: 'Alerte résolue',
        description: 'L\'alerte a été marquée comme résolue',
      });
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes NF203</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertes NF203
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="font-medium">Aucune alerte active</p>
            <p className="text-sm">Votre système de conformité fonctionne correctement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertes NF203
            {stats && stats.active > 0 && (
              <Badge variant="destructive">{stats.active}</Badge>
            )}
          </span>
          {stats && (
            <div className="flex gap-2 text-sm">
              {stats.critical > 0 && (
                <Badge variant="destructive">
                  {stats.critical} critique{stats.critical > 1 ? 's' : ''}
                </Badge>
              )}
              {stats.high > 0 && (
                <Badge variant="default">
                  {stats.high} haute{stats.high > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{alert.title}</p>
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                  disabled={acknowledgeMutation.isPending}
                >
                  Acquitter
                </Button>
                <Button
                  size="sm"
                  onClick={() => resolveMutation.mutate(alert.id)}
                  disabled={resolveMutation.isPending}
                >
                  Résoudre
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
