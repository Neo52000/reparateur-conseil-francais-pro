
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Upload } from 'lucide-react';

interface CatalogToolbarProps {
  searchTerm: string;
  filterType: string;
  selectedItems: string[];
  bulkAction: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onBulkActionChange: (value: string) => void;
  onBulkApply: () => void;
  onClearSelection: () => void;
}

const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
  searchTerm,
  filterType,
  selectedItems,
  bulkAction,
  onSearchChange,
  onFilterChange,
  onBulkActionChange,
  onBulkApply,
  onClearSelection
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher marques, modèles, réparations..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={onFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout afficher</SelectItem>
                <SelectItem value="active">Éléments actifs</SelectItem>
                <SelectItem value="inactive">Éléments désactivés</SelectItem>
                <SelectItem value="custom_prices">Avec prix personnalisés</SelectItem>
                <SelectItem value="no_custom_prices">Sans prix personnalisés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>

        {/* Actions en masse */}
        {selectedItems.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} élément(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <Select value={bulkAction} onValueChange={onBulkActionChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Action en masse..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activer tous</SelectItem>
                    <SelectItem value="deactivate">Désactiver tous</SelectItem>
                    <SelectItem value="margin_10">Appliquer marge 10%</SelectItem>
                    <SelectItem value="margin_15">Appliquer marge 15%</SelectItem>
                    <SelectItem value="margin_20">Appliquer marge 20%</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={onBulkApply} disabled={!bulkAction}>
                  Appliquer
                </Button>
                <Button variant="outline" onClick={onClearSelection}>
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CatalogToolbar;
