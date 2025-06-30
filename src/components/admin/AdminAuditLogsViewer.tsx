
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Download, Eye, Filter, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { useAdminAuditLogs } from '@/hooks/useAdminAudit';
import { AdminAuditFilters, AdminAuditLogEntry } from '@/services/adminAuditService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminAuditLogsViewer: React.FC = () => {
  const [filters, setFilters] = useState<AdminAuditFilters>({
    limit: 50,
    offset: 0
  });
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogEntry | null>(null);
  const { logs, total, loading, error, fetchLogs, exportLogs } = useAdminAuditLogs(filters);
  const { toast } = useToast();

  const handleFilterChange = (key: keyof AdminAuditFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
    fetchLogs(newFilters);
  };

  const handleExport = async () => {
    try {
      await exportLogs(filters);
      toast({
        title: "Export réussi",
        description: "Les logs ont été exportés en CSV",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les logs",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'delete': return 'destructive';
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'login': return 'outline';
      case 'logout': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd MMM yyyy 'à' HH:mm:ss", { locale: fr });
    } catch {
      return timestamp;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur lors du chargement des logs: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Logs d'audit administrateur
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={() => fetchLogs()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type d'action</label>
              <Select onValueChange={(value) => handleFilterChange('action_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="login">Connexion</SelectItem>
                  <SelectItem value="logout">Déconnexion</SelectItem>
                  <SelectItem value="create">Création</SelectItem>
                  <SelectItem value="update">Modification</SelectItem>
                  <SelectItem value="delete">Suppression</SelectItem>
                  <SelectItem value="approve">Approbation</SelectItem>
                  <SelectItem value="reject">Rejet</SelectItem>
                  <SelectItem value="scraping_start">Début scraping</SelectItem>
                  <SelectItem value="scraping_stop">Arrêt scraping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Type de ressource</label>
              <Select onValueChange={(value) => handleFilterChange('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les ressources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les ressources</SelectItem>
                  <SelectItem value="subscription">Abonnement</SelectItem>
                  <SelectItem value="repairer">Réparateur</SelectItem>
                  <SelectItem value="promo_code">Code promo</SelectItem>
                  <SelectItem value="ad_banner">Bannière pub</SelectItem>
                  <SelectItem value="client_interest">Demande client</SelectItem>
                  <SelectItem value="scraping">Scraping</SelectItem>
                  <SelectItem value="chatbot">Chatbot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Niveau de sévérité</label>
              <Select onValueChange={(value) => handleFilterChange('severity_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les niveaux</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID de ressource..."
                  className="pl-8"
                  onChange={(e) => handleFilterChange('resource_id', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {total} logs trouvés
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Chargement des logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log trouvé avec ces filtres
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <Dialog key={log.id}>
                  <DialogTrigger asChild>
                    <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={getSeverityColor(log.severity_level || 'info')}>
                            {log.severity_level}
                          </Badge>
                          <Badge variant={getActionTypeColor(log.action_type)}>
                            {log.action_type}
                          </Badge>
                          <span className="font-medium">{log.resource_type}</span>
                          {log.resource_id && (
                            <span className="text-sm text-muted-foreground">
                              #{log.resource_id.substring(0, 8)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatTimestamp(log.timestamp || log.created_at || '')}
                        </div>
                      </div>
                      {log.action_details && Object.keys(log.action_details).length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {Object.entries(log.action_details).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-4">
                              {key}: {String(value).substring(0, 50)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Détails du log d'audit</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh]">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-medium">Timestamp</label>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(log.timestamp || log.created_at || '')}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium">Utilisateur admin</label>
                            <p className="text-sm text-muted-foreground">
                              {log.admin_user_id}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium">Type d'action</label>
                            <Badge variant={getActionTypeColor(log.action_type)}>
                              {log.action_type}
                            </Badge>
                          </div>
                          <div>
                            <label className="font-medium">Sévérité</label>
                            <Badge variant={getSeverityColor(log.severity_level || 'info')}>
                              {log.severity_level}
                            </Badge>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-medium">Type de ressource</label>
                            <p className="text-sm text-muted-foreground">{log.resource_type}</p>
                          </div>
                          <div>
                            <label className="font-medium">ID de ressource</label>
                            <p className="text-sm text-muted-foreground">
                              {log.resource_id || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium">Adresse IP</label>
                            <p className="text-sm text-muted-foreground">
                              {log.ip_address || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium">Session ID</label>
                            <p className="text-sm text-muted-foreground">
                              {log.session_id || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {log.action_details && Object.keys(log.action_details).length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <label className="font-medium">Détails de l'action</label>
                              <pre className="mt-2 text-sm bg-muted p-3 rounded overflow-auto">
                                {JSON.stringify(log.action_details, null, 2)}
                              </pre>
                            </div>
                          </>
                        )}

                        {log.before_data && Object.keys(log.before_data).length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <label className="font-medium">Données avant modification</label>
                              <pre className="mt-2 text-sm bg-muted p-3 rounded overflow-auto">
                                {JSON.stringify(log.before_data, null, 2)}
                              </pre>
                            </div>
                          </>
                        )}

                        {log.after_data && Object.keys(log.after_data).length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <label className="font-medium">Données après modification</label>
                              <pre className="mt-2 text-sm bg-muted p-3 rounded overflow-auto">
                                {JSON.stringify(log.after_data, null, 2)}
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogsViewer;
