import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const IncidentsManager: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, [user]);

  const fetchIncidents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('monitor_incidents')
        .select(`
          *,
          monitors!inner(name, type, repairer_id)
        `)
        .eq('monitors.repairer_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des incidents:', error);
      toast.error('Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('monitor_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;

      setIncidents(incidents.map(incident => 
        incident.id === incidentId 
          ? { ...incident, ...updateData }
          : incident
      ));

      toast.success('Statut de l\'incident mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/10 text-blue-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-orange-500/10 text-orange-500';
      case 'critical': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-500';
      case 'investigating': return 'bg-orange-500/10 text-orange-500';
      case 'identified': return 'bg-yellow-500/10 text-yellow-500';
      case 'monitoring': return 'bg-blue-500/10 text-blue-500';
      case 'resolved': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement des incidents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Incidents</h2>
          <p className="text-muted-foreground">
            Gérez les incidents de vos monitors
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un incident
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouvert</SelectItem>
            <SelectItem value="investigating">En investigation</SelectItem>
            <SelectItem value="identified">Identifié</SelectItem>
            <SelectItem value="monitoring">Surveillance</SelectItem>
            <SelectItem value="resolved">Résolu</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sévérité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sévérités</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des incidents */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <CardTitle className="text-lg">{incident.title}</CardTitle>
                  </div>
                  <CardDescription>
                    Monitor: {incident.monitors.name} • {new Date(incident.started_at).toLocaleString('fr-FR')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incident.description && (
                  <p className="text-sm text-muted-foreground">
                    {incident.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Durée: {incident.resolved_at 
                    ? `${Math.round((new Date(incident.resolved_at).getTime() - new Date(incident.started_at).getTime()) / (1000 * 60))} minutes`
                    : `${Math.round((Date.now() - new Date(incident.started_at).getTime()) / (1000 * 60))} minutes (en cours)`
                  }
                </div>

                <div className="flex items-center gap-2">
                  <Select 
                    value={incident.status} 
                    onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="investigating">En investigation</SelectItem>
                      <SelectItem value="identified">Identifié</SelectItem>
                      <SelectItem value="monitoring">Surveillance</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>

                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Commentaires
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun incident</h3>
            <p className="text-muted-foreground">
              {statusFilter !== 'all' || severityFilter !== 'all'
                ? 'Aucun incident ne correspond à vos critères'
                : 'Parfait ! Aucun incident en cours'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};