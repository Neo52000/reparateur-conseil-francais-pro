
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useFrenchDepartments } from '@/hooks/useFrenchDepartments';

export interface RepairersFiltersState {
  region: string;
  department: string;
  city: string;
  hasGps: boolean | null;
  isActive: 'all' | 'active' | 'inactive';
}

interface RepairersFiltersProps {
  filters: RepairersFiltersState;
  onFiltersChange: (filters: RepairersFiltersState) => void;
  stats?: {
    total: number;
    filtered: number;
    withGps: number;
  };
}

const RepairersFilters: React.FC<RepairersFiltersProps> = ({ 
  filters, 
  onFiltersChange,
  stats 
}) => {
  const { regions, getDepartmentsByRegion, loading } = useFrenchDepartments();

  const handleRegionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      region: value === 'all' ? '' : value,
      department: '' // Reset department when region changes
    });
  };

  const handleDepartmentChange = (value: string) => {
    onFiltersChange({
      ...filters,
      department: value === 'all' ? '' : value
    });
  };

  const handleCityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      city: value
    });
  };

  const handleGpsFilter = (value: string) => {
    onFiltersChange({
      ...filters,
      hasGps: value === 'all' ? null : value === 'with'
    });
  };

  const handleActiveFilter = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value as 'all' | 'active' | 'inactive'
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      region: '',
      department: '',
      city: '',
      hasGps: null,
      isActive: 'all'
    });
  };

  const activeFiltersCount = [
    filters.region,
    filters.department,
    filters.city,
    filters.hasGps !== null,
    filters.isActive !== 'all'
  ].filter(Boolean).length;

  const availableDepartments = filters.region 
    ? getDepartmentsByRegion(filters.region)
    : [];

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filtres</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Région */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Région</label>
          <Select 
            value={filters.region || 'all'} 
            onValueChange={handleRegionChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les régions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les régions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Département */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Département</label>
          <Select 
            value={filters.department || 'all'} 
            onValueChange={handleDepartmentChange}
            disabled={loading || (!filters.region && availableDepartments.length === 0)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filters.region ? "Choisir un département" : "Sélectionnez d'abord une région"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {availableDepartments.map(dep => (
                <SelectItem key={dep.code} value={dep.code}>
                  {dep.code} - {dep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ville */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Ville</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une ville..."
              value={filters.city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filtre GPS */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Coordonnées GPS</label>
          <Select 
            value={filters.hasGps === null ? 'all' : filters.hasGps ? 'with' : 'without'} 
            onValueChange={handleGpsFilter}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="with">
                <span className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-green-500" />
                  Avec GPS
                </span>
              </SelectItem>
              <SelectItem value="without">
                <span className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-500" />
                  Sans GPS
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Actif/Inactif */}
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Statut</label>
          <Select 
            value={filters.isActive} 
            onValueChange={handleActiveFilter}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Actifs
                </span>
              </SelectItem>
              <SelectItem value="inactive">
                <span className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-destructive" />
                  Inactifs
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{stats.filtered}</strong> / {stats.total} réparateurs
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-green-500" />
            <strong className="text-foreground">{stats.withGps}</strong> géolocalisés
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-red-500" />
            <strong className="text-foreground">{stats.total - stats.withGps}</strong> sans GPS
          </span>
        </div>
      )}
    </div>
  );
};

export default RepairersFilters;
