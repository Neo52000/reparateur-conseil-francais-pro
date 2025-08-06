
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Download, Settings } from 'lucide-react';

interface AdminAuditFiltersProps {
  filters: {
    action_type: string;
    resource_type: string;
    severity_level: string;
    start_date: string;
    end_date: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onExport: () => void;
  onShowCleanupConfig: () => void;
}

const AdminAuditFilters: React.FC<AdminAuditFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onShowCleanupConfig
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="action-type">Type d'action</Label>
            <Select value={filters.action_type} onValueChange={(value) => onFilterChange('action_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="create">Création</SelectItem>
                <SelectItem value="update">Modification</SelectItem>
                <SelectItem value="delete">Suppression</SelectItem>
                <SelectItem value="approve">Approbation</SelectItem>
                <SelectItem value="reject">Rejet</SelectItem>
                <SelectItem value="activate">Activation</SelectItem>
                <SelectItem value="deactivate">Désactivation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="resource-type">Type de ressource</Label>
            <Select value={filters.resource_type} onValueChange={(value) => onFilterChange('resource_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les ressources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ressources</SelectItem>
                <SelectItem value="subscription">Abonnement</SelectItem>
                <SelectItem value="repairer">Réparateur</SelectItem>
                <SelectItem value="promo_code">Code promo</SelectItem>
                <SelectItem value="scraping">Scraping</SelectItem>
                <SelectItem value="client_interest">Demande client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="severity">Niveau de sévérité</Label>
            <Select value={filters.severity_level} onValueChange={(value) => onFilterChange('severity_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              placeholder="Rechercher dans les logs..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={onExport} variant="outline" className="mt-6">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button 
            onClick={onShowCleanupConfig} 
            variant="outline" 
            className="mt-6"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditFilters;
