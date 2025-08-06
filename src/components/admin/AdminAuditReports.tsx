
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditLogs } from '@/hooks/useAdminAudit';
import { AdminAuditFilters } from '@/services/adminAuditService';
import { useToast } from '@/hooks/use-toast';
import { Download, Calendar, FileText, Filter, Mail } from 'lucide-react';

interface ReportConfig {
  name: string;
  description: string;
  filters: AdminAuditFilters;
  format: 'csv' | 'json';
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}

const AdminAuditReports: React.FC = () => {
  const { toast } = useToast();
  const [reportConfigs, setReportConfigs] = useState<ReportConfig[]>([
    {
      name: "Rapport de sécurité quotidien",
      description: "Actions critiques et suppressions des dernières 24h",
      filters: {
        severity_level: 'critical',
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        limit: 1000
      },
      format: 'csv',
      schedule: 'daily'
    },
    {
      name: "Analyse hebdomadaire des administrateurs",
      description: "Activité de tous les administrateurs sur 7 jours",
      filters: {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        limit: 5000
      },
      format: 'csv',
      schedule: 'weekly'
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [customFilters, setCustomFilters] = useState<AdminAuditFilters>({});
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const { exportLogs } = useAdminAuditLogs();

  const handleGenerateReport = async (config: ReportConfig) => {
    try {
      await exportLogs(config.filters);
      toast({
        title: "Rapport généré",
        description: `Le rapport "${config.name}" a été téléchargé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }
  };

  const handleCreateCustomReport = async () => {
    if (!reportName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour le rapport",
        variant: "destructive"
      });
      return;
    }

    const newReport: ReportConfig = {
      name: reportName,
      description: reportDescription,
      filters: customFilters,
      format: 'csv'
    };

    try {
      await exportLogs(customFilters);
      setReportConfigs(prev => [...prev, newReport]);
      setReportName('');
      setReportDescription('');
      setCustomFilters({});
      
      toast({
        title: "Rapport créé et téléchargé",
        description: `Le rapport "${reportName}" a été généré`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rapport",
        variant: "destructive"
      });
    }
  };

  const updateCustomFilter = (key: keyof AdminAuditFilters, value: any) => {
    // Ignore les valeurs par défaut
    const defaultValues = ['all-types', 'all-resources', 'all-levels', 'all-fields'];
    const finalValue = defaultValues.includes(value) ? undefined : value;
    setCustomFilters(prev => ({ ...prev, [key]: finalValue }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports d'audit</h2>
          <p className="text-muted-foreground">
            Génération et planification de rapports personnalisés
          </p>
        </div>
      </div>

      {/* Rapports prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports prédéfinis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportConfigs.map((config, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium">{config.name}</h4>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{config.format.toUpperCase()}</Badge>
                  {config.schedule && (
                    <Badge variant="secondary">{config.schedule}</Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateReport(config)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Télécharger
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedReport(config)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Création de rapport personnalisé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Créer un rapport personnalisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Nom du rapport</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Ex: Rapport mensuel des connexions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportDescription">Description</Label>
              <Input
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Description du rapport"
              />
            </div>
          </div>

          {/* Filtres personnalisés */}
          <div className="space-y-4">
            <h4 className="font-medium">Filtres</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type d'action</Label>
                <Select 
                  value={customFilters.action_type || ''} 
                  onValueChange={(value) => updateCustomFilter('action_type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">Tous les types</SelectItem>
                    <SelectItem value="login">Connexion</SelectItem>
                    <SelectItem value="logout">Déconnexion</SelectItem>
                    <SelectItem value="create">Création</SelectItem>
                    <SelectItem value="update">Modification</SelectItem>
                    <SelectItem value="delete">Suppression</SelectItem>
                    <SelectItem value="approve">Approbation</SelectItem>
                    <SelectItem value="deactivate">Désactivation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type de ressource</Label>
                <Select 
                  value={customFilters.resource_type || ''} 
                  onValueChange={(value) => updateCustomFilter('resource_type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les ressources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-resources">Toutes les ressources</SelectItem>
                    <SelectItem value="subscription">Abonnement</SelectItem>
                    <SelectItem value="repairer">Réparateur</SelectItem>
                    <SelectItem value="promo_code">Code promo</SelectItem>
                    <SelectItem value="scraping">Scraping</SelectItem>
                    <SelectItem value="client_interest">Demande client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau de sévérité</Label>
                <Select 
                  value={customFilters.severity_level || ''} 
                  onValueChange={(value) => updateCustomFilter('severity_level', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-levels">Tous les niveaux</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customFilters.start_date ? customFilters.start_date.split('T')[0] : ''}
                  onChange={(e) => updateCustomFilter('start_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customFilters.end_date ? customFilters.end_date.split('T')[0] : ''}
                  onChange={(e) => updateCustomFilter('end_date', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Nombre maximum de résultats</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="10000"
                value={customFilters.limit || 1000}
                onChange={(e) => updateCustomFilter('limit', parseInt(e.target.value) || 1000)}
              />
            </div>
          </div>

          <Button onClick={handleCreateCustomReport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Générer et télécharger le rapport
          </Button>
        </CardContent>
      </Card>

      {/* Planification automatique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planification automatique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fonctionnalité à venir : planification automatique des rapports avec envoi par email.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
              <div className="space-y-2">
                <Label>Fréquence</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Heure d'envoi</Label>
                <Input type="time" disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Email de destination</Label>
                <Input type="email" placeholder="admin@example.com" disabled />
              </div>
            </div>
            
            <Button disabled className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Programmer l'envoi automatique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditReports;
