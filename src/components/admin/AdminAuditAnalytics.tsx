
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminAuditLogs } from '@/hooks/useAdminAudit';
import { AdminAuditFilters } from '@/services/adminAuditService';
import { Calendar, TrendingUp, AlertTriangle, Users, Database, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TimeRange = '1d' | '7d' | '30d' | '90d';

const AdminAuditAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { toast } = useToast();

  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case '1d':
        start.setDate(now.getDate() - 1);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
    }
    
    return {
      start_date: start.toISOString(),
      end_date: now.toISOString()
    };
  };

  const dateRange = getDateRange(timeRange);
  const { logs, loading, exportLogs } = useAdminAuditLogs({
    ...dateRange,
    limit: 1000
  });

  const analytics = useMemo(() => {
    if (!logs.length) return null;

    // Analyse par type d'action
    const actionTypes: Record<string, number> = {};
    const severityLevels = { info: 0, warning: 0, critical: 0 };
    const resourceTypes: Record<string, number> = {};
    const adminUsers: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};

    logs.forEach(log => {
      // Types d'actions
      actionTypes[log.action_type] = (actionTypes[log.action_type] || 0) + 1;
      
      // Niveaux de sévérité
      const severity = log.severity_level || 'info';
      if (severity in severityLevels) {
        severityLevels[severity as keyof typeof severityLevels]++;
      }
      
      // Types de ressources
      resourceTypes[log.resource_type] = (resourceTypes[log.resource_type] || 0) + 1;
      
      // Utilisateurs admin
      adminUsers[log.admin_user_id] = (adminUsers[log.admin_user_id] || 0) + 1;
      
      // Activité quotidienne
      const date = new Date(log.timestamp || log.created_at || '').toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return {
      totalActions: logs.length,
      actionTypes: Object.entries(actionTypes).sort(([,a], [,b]) => b - a),
      severityLevels,
      resourceTypes: Object.entries(resourceTypes).sort(([,a], [,b]) => b - a),
      adminUsers: Object.entries(adminUsers).sort(([,a], [,b]) => b - a),
      dailyActivity: Object.entries(dailyActivity).sort(([a], [b]) => a.localeCompare(b)),
      avgDailyActions: Object.values(dailyActivity).reduce((a, b) => a + b, 0) / Object.keys(dailyActivity).length || 0
    };
  }, [logs]);

  const handleExport = async () => {
    try {
      await exportLogs(dateRange);
      toast({
        title: "Export réussi",
        description: "Les données analytiques ont été exportées en CSV",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Aucune donnée disponible pour la période sélectionnée
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Période :</span>
          </div>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Dernières 24h</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des actions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.avgDailyActions)} actions/jour en moyenne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.severityLevels.critical}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.severityLevels.critical / analytics.totalActions) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs ayant effectué des actions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.dailyActivity.length > 1 ? (
                analytics.dailyActivity[analytics.dailyActivity.length - 1][1] > 
                analytics.dailyActivity[analytics.dailyActivity.length - 2][1] ? '+' : '-'
              ) : '~'} 
              {analytics.dailyActivity.length > 1 ? 
                Math.abs(
                  analytics.dailyActivity[analytics.dailyActivity.length - 1][1] - 
                  analytics.dailyActivity[analytics.dailyActivity.length - 2][1]
                ) : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              vs jour précédent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.actionTypes.slice(0, 10).map(([type, count]) => (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{type}</Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${(count / analytics.totalActions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ressources les plus affectées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.resourceTypes.slice(0, 8).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par sévérité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Info</span>
                  </div>
                  <span className="font-medium">{analytics.severityLevels.info}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 rounded-full h-2" 
                    style={{ width: `${(analytics.severityLevels.info / analytics.totalActions) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">Avertissement</span>
                  </div>
                  <span className="font-medium">{analytics.severityLevels.warning}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-amber-500 rounded-full h-2" 
                    style={{ width: `${(analytics.severityLevels.warning / analytics.totalActions) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Critique</span>
                  </div>
                  <span className="font-medium">{analytics.severityLevels.critical}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 rounded-full h-2" 
                    style={{ width: `${(analytics.severityLevels.critical / analytics.totalActions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administrateurs les plus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.adminUsers.slice(0, 8).map(([adminId, count]) => (
                <div key={adminId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{adminId.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">Administrateur</p>
                  </div>
                  <Badge variant="outline">{count} actions</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité quotidienne */}
      <Card>
        <CardHeader>
          <CardTitle>Activité quotidienne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.dailyActivity.slice(-14).map(([date, count]) => (
              <div key={date} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</span>
                  <span className="text-sm font-medium">{count} actions</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 rounded-full h-2" 
                    style={{ width: `${(count / Math.max(...analytics.dailyActivity.map(([,c]) => c))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditAnalytics;
