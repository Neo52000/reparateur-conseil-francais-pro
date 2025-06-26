
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Search, 
  Filter, 
  ToggleLeft, 
  ToggleRight, 
  TrendingUp, 
  Download,
  Upload,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRepairerCatalog } from '@/hooks/catalog/useRepairerCatalog';
import CatalogTreeView from './CatalogTreeView';

const FullCatalogSection = () => {
  const { 
    catalogTree, 
    stats, 
    loading, 
    updateCatalogPreference, 
    updateBrandSetting, 
    bulkUpdateItems 
  } = useRepairerCatalog();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    const updates = selectedItems.map(itemId => {
      const [entityType, entityId] = itemId.split(':');
      return {
        entity_type: entityType as 'brand' | 'device_model' | 'repair_type',
        entity_id: entityId,
        is_active: bulkAction === 'activate',
        margin_percentage: bulkAction === 'margin_10' ? 10 : 
                         bulkAction === 'margin_15' ? 15 : 
                         bulkAction === 'margin_20' ? 20 : undefined
      };
    });

    await bulkUpdateItems(updates);
    setSelectedItems([]);
    setBulkAction('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3">Chargement du catalogue complet...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marques</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBrands || 0} actives, {stats.inactiveBrands || 0} désactivées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModels || 0}</div>
            <p className="text-xs text-muted-foreground">
              Appareils disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix du catalogue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBasePrices || 0}</div>
            <p className="text-xs text-muted-foregreen">
              Prix de référence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix personnalisés</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.customPricesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vos tarifs personnalisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher marques, modèles, réparations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
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
                  <Select value={bulkAction} onValueChange={setBulkAction}>
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
                  <Button onClick={handleBulkAction} disabled={!bulkAction}>
                    Appliquer
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedItems([])}>
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vue arborescente du catalogue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Catalogue complet</span>
            <Badge variant="outline" className="ml-auto">
              Vue hiérarchique
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CatalogTreeView
            catalogTree={catalogTree}
            onUpdatePreference={updateCatalogPreference}
            onUpdateBrandSetting={updateBrandSetting}
          />
        </CardContent>
      </Card>

      {/* Guide d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle>Guide d'utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🎯 Gestion des prix</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Utilisez "Prix fixe" pour un tarif précis</li>
                <li>• Choisissez "À partir de" pour des prix variables</li>
                <li>• Définissez des marges par marque/modèle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Actions rapides</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Désactivez les marques non supportées</li>
                <li>• Utilisez les actions en masse</li>
                <li>• Exportez vos tarifs en CSV</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullCatalogSection;
