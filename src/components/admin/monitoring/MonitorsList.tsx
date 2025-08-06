import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Globe, 
  Zap, 
  Server, 
  TrendingUp, 
  Users, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreateMonitorDialog } from './CreateMonitorDialog';

export const MonitorsList: React.FC = () => {
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchMonitors();
  }, [user]);

  const fetchMonitors = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonitors(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des monitors:', error);
      toast.error('Erreur lors du chargement des monitors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monitors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMonitors(monitors.filter(m => m.id !== id));
      toast.success('Monitor supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleMonitorStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('monitors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setMonitors(monitors.map(m => 
        m.id === id ? { ...m, is_active: !currentStatus } : m
      ));
      
      toast.success(`Monitor ${!currentStatus ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const getMonitorIcon = (type: string) => {
    switch (type) {
      case 'http': return <Globe className="h-4 w-4" />;
      case 'infrastructure': return <Server className="h-4 w-4" />;
      case 'business_metric': return <TrendingUp className="h-4 w-4" />;
      case 'client_satisfaction': return <Users className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-success/10 text-success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactif
      </Badge>
    );
  };

  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (monitor.url && monitor.url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || monitor.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement des monitors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Monitors</h2>
          <p className="text-muted-foreground">
            Gérez vos monitors de surveillance
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Monitor
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un monitor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type de monitor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="http">HTTP/HTTPS</SelectItem>
            <SelectItem value="ping">Ping</SelectItem>
            <SelectItem value="dns">DNS</SelectItem>
            <SelectItem value="ssl">SSL</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="business_metric">Métrique Business</SelectItem>
            <SelectItem value="seo_rank">SEO Ranking</SelectItem>
            <SelectItem value="client_satisfaction">Satisfaction Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMonitors.map((monitor) => (
          <Card key={monitor.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getMonitorIcon(monitor.type)}
                  <div>
                    <CardTitle className="text-lg">{monitor.name}</CardTitle>
                    <CardDescription>
                      {monitor.url || 'Monitor personnalisé'}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(monitor.is_active)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium capitalize">{monitor.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intervalle:</span>
                    <div className="font-medium">{monitor.check_interval_minutes}min</div>
                  </div>
                </div>

                {/* Statut simulé */}
                <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-sm font-medium">Opérationnel</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dernière vérification: il y a 2min
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleMonitorStatus(monitor.id, monitor.is_active)}
                  >
                    {monitor.is_active ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteMonitor(monitor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMonitors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun monitor trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' 
                ? 'Aucun monitor ne correspond à vos critères de recherche'
                : 'Créez votre premier monitor pour commencer la surveillance'
              }
            </p>
            {(!searchTerm && typeFilter === 'all') && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un monitor
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CreateMonitorDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          fetchMonitors();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};