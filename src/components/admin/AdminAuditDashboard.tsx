
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditLogs } from '@/hooks/useAdminAudit';
import { AdminAuditFilters } from '@/services/adminAuditService';
import AdminAuditLogsViewer from './AdminAuditLogsViewer';
import AdminAuditStats from './AdminAuditStats';
import { Activity, BarChart3, Shield, Users, Database, AlertTriangle, FileText, BookOpen, File } from 'lucide-react';

const AdminAuditDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Statistiques en temps réel
  const { logs: recentLogs, loading } = useAdminAuditLogs({ 
    limit: 10,
    offset: 0
  });

  const { logs: criticalLogs } = useAdminAuditLogs({
    severity_level: 'critical',
    limit: 5
  });

  const { logs: todayLogs } = useAdminAuditLogs({
    start_date: new Date().toISOString().split('T')[0],
    limit: 100
  });

  const getActionTypeStats = () => {
    const stats: Record<string, number> = {};
    todayLogs.forEach(log => {
      stats[log.action_type] = (stats[log.action_type] || 0) + 1;
    });
    return Object.entries(stats).sort(([,a], [,b]) => b - a);
  };

  const getSeverityStats = () => {
    const stats = { info: 0, warning: 0, critical: 0 };
    todayLogs.forEach(log => {
      const severity = log.severity_level || 'info';
      stats[severity as keyof typeof stats]++;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const actionStats = getActionTypeStats();
  const severityStats = getSeverityStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord d'audit</h1>
          <p className="text-muted-foreground">
            Surveillance et traçabilité des actions administratives
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {todayLogs.length} actions aujourd'hui
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Logs détaillés
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions aujourd'hui</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes actions confondues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions critiques</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{severityStats.critical}</div>
                <p className="text-xs text-muted-foreground">
                  Nécessitent une attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{severityStats.warning}</div>
                <p className="text-xs text-muted-foreground">
                  Actions à surveiller
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions normales</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{severityStats.info}</div>
                <p className="text-xs text-muted-foreground">
                  Fonctionnement normal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphique des actions par type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions par type (aujourd'hui)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actionStats.slice(0, 8).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{type}</Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions critiques récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalLogs.length > 0 ? (
                    criticalLogs.map((log) => (
                      <div key={log.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="destructive">{log.action_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp || log.created_at || '').toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm">{log.resource_type}</p>
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {log.resource_id.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune action critique récente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intégration des statistiques existantes */}
          <AdminAuditStats />
        </TabsContent>

        <TabsContent value="logs">
          <AdminAuditLogsViewer />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Surveillance de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-red-600 mb-2">Suppressions</h4>
                    <p className="text-2xl font-bold">
                      {todayLogs.filter(log => log.action_type === 'delete').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-amber-600 mb-2">Désactivations</h4>
                    <p className="text-2xl font-bold">
                      {todayLogs.filter(log => log.action_type === 'deactivate').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-blue-600 mb-2">Connexions</h4>
                    <p className="text-2xl font-bold">
                      {todayLogs.filter(log => log.action_type === 'login').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Actions récentes sensibles</h4>
                  <div className="space-y-2">
                    {todayLogs
                      .filter(log => ['delete', 'deactivate', 'configuration_change'].includes(log.action_type))
                      .slice(0, 10)
                      .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.action_type === 'delete' ? 'destructive' : 'secondary'}>
                              {log.action_type}
                            </Badge>
                            <span className="text-sm">{log.resource_type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp || log.created_at || '').toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activité des administrateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Analyse des actions par utilisateur administrateur
                </div>
                
                {/* Groupement par admin_user_id */}
                {(() => {
                  const adminStats: Record<string, number> = {};
                  todayLogs.forEach(log => {
                    adminStats[log.admin_user_id] = (adminStats[log.admin_user_id] || 0) + 1;
                  });
                  
                  return Object.entries(adminStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([adminId, count]) => (
                      <div key={adminId} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{adminId.substring(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">Administrateur</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground">actions</p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation complète du projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* PRD */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">PRD (Product Requirements)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Spécifications produit complètes et roadmap
                  </p>
                  <a 
                    href="/docs/PRD.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir le PRD →
                  </a>
                </div>

                {/* Guide utilisateur */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Guide utilisateur</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manuel d'utilisation pour tous les rôles
                  </p>
                  <a 
                    href="/docs/user-guide.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Voir le guide →
                  </a>
                </div>

                {/* Documentation technique */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Doc technique</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Architecture et guide développeur
                  </p>
                  <a 
                    href="/docs/README.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Voir la doc →
                  </a>
                </div>

                {/* Résumé refactoring */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <File className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Résumé refactoring</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Historique des améliorations et optimisations
                  </p>
                  <a 
                    href="/docs/REFACTORING_SUMMARY.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    Voir le résumé →
                  </a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Note d'accès</h4>
                <p className="text-sm text-blue-700">
                  Ces documents sont accessibles directement depuis le serveur local. 
                  En production, ils peuvent être configurés pour être servis statiquement 
                  ou intégrés dans une section dédiée de l'interface admin.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuditDashboard;
