
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CatalogTreeNode } from '@/types/repairerCatalog';
import BrandNode from './catalog/BrandNode';

interface CatalogTreeViewProps {
  catalogTree: CatalogTreeNode[];
  onUpdatePreference: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string, updates: any) => void;
  onUpdateBrandSetting: (brandId: string, updates: any) => void;
}

const CatalogTreeView: React.FC<CatalogTreeViewProps> = ({
  catalogTree,
  onUpdatePreference,
  onUpdateBrandSetting
}) => {
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [editingMargin, setEditingMargin] = useState<string | null>(null);
  const [tempMargin, setTempMargin] = useState<string>('');

  const toggleBrand = (brandId: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId);
    } else {
      newExpanded.add(brandId);
    }
    setExpandedBrands(newExpanded);
  };

  const toggleModel = (modelId: string) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  const handleMarginEdit = (id: string, currentMargin?: number) => {
    setEditingMargin(id);
    setTempMargin(currentMargin?.toString() || '');
  };

  const saveMargin = (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string) => {
    const margin = parseFloat(tempMargin);
    if (!isNaN(margin)) {
      if (entityType === 'brand') {
        onUpdateBrandSetting(entityId, { default_margin_percentage: margin });
      } else {
        onUpdatePreference(entityType, entityId, { default_margin_percentage: margin });
      }
    }
    setEditingMargin(null);
    setTempMargin('');
  };

  return (
    <div className="space-y-4">
      {catalogTree.map(brand => (
        <BrandNode
          key={brand.id}
          brand={brand}
          expandedBrands={expandedBrands}
          expandedModels={expandedModels}
          editingMargin={editingMargin}
          tempMargin={tempMargin}
          onToggleBrand={toggleBrand}
          onToggleModel={toggleModel}
          onUpdatePreference={onUpdatePreference}
          onUpdateBrandSetting={onUpdateBrandSetting}
          onMarginEdit={handleMarginEdit}
          onSaveMargin={saveMargin}
          onTempMarginChange={setTempMargin}
        />
      ))}
      {catalogTree.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élément du catalogue disponible</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CatalogTreeView;
