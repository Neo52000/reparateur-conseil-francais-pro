import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Filter, Shield, User, Clock, Search } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const AuditLogsViewer = () => {
  const { logs, loading, filterLogs } = useAuditLogs();
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key !== 'search') {
      filterLogs(newFilters);
    }
  };

  const handleSearch = () => {
    filterLogs(filters);
  };

  const getActionColor = (action: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'CREATE': 'default',
      'UPDATE': 'secondary',
      'DELETE': 'destructive',
      'LOGIN': 'default',
      'LOGOUT': 'secondary',
      'ERROR': 'destructive',
    };
    
    return colors[action.toUpperCase()] || 'outline';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Journal d'Audit
          </h2>
          <p className="text-muted-foreground">
            Consultez l'historique des actions et événements système
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="UPDATE">Modification</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="LOGIN">Connexion</SelectItem>
                  <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type de ressource</label>
              <Select
                value={filters.resourceType}
                onValueChange={(value) => handleFilterChange('resourceType', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="order">Commande</SelectItem>
                  <SelectItem value="inventory">Inventaire</SelectItem>
                  <SelectItem value="settings">Paramètres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date de début</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date de fin</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Événements récents</CardTitle>
          <CardDescription>
            {logs.length} événement(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun événement trouvé avec les filtres actuels
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.resource_type}</span>
                            {log.resource_id && (
                              <span className="text-xs text-muted-foreground">
                                ID: {log.resource_id}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            {formatTimestamp(log.created_at)}
                          </div>

                          {(log.old_values || log.new_values) && (
                            <div className="text-xs bg-muted p-2 rounded">
                              {log.old_values && (
                                <div className="mb-1">
                                  <span className="font-medium">Avant:</span> {JSON.stringify(log.old_values)}
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <span className="font-medium">Après:</span> {JSON.stringify(log.new_values)}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {log.user_id && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>User: {log.user_id}</span>
                              </div>
                            )}
                            {log.ip_address && (
                              <span>IP: {log.ip_address}</span>
                            )}
                            {log.session_id && (
                              <span>Session: {log.session_id.slice(0, 8)}...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsViewer;