
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { useRepairerCatalog } from '@/hooks/catalog/useRepairerCatalog';
import CatalogTreeView from './CatalogTreeView';
import CatalogStats from './catalog/CatalogStats';
import CatalogToolbar from './catalog/CatalogToolbar';

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
      <CatalogStats stats={stats} />

      <CatalogToolbar
        searchTerm={searchTerm}
        filterType={filterType}
        selectedItems={selectedItems}
        bulkAction={bulkAction}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterType}
        onBulkActionChange={setBulkAction}
        onBulkApply={handleBulkAction}
        onClearSelection={() => setSelectedItems([])}
      />

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
