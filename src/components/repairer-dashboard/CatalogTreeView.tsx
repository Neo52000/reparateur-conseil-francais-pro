
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Settings, Calculator, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { CatalogTreeNode } from '@/types/repairerCatalog';

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

  const renderPriceItem = (price: any, modelId: string) => (
    <div key={price.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Switch
            checked={price.is_active}
            onCheckedChange={(checked) => 
              onUpdatePreference('repair_type', price.id, { is_active: checked })
            }
            size="sm"
          />
          <span className={`text-sm ${!price.is_active ? 'text-gray-400 line-through' : ''}`}>
            {price.name}
          </span>
        </div>
        
        {price.has_custom_price && (
          <Badge variant="secondary" className="text-xs">
            {price.price_type === 'starting_from' ? 'À partir de' : 'Prix fixe'}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-sm">
          <span className="text-gray-500">Base: {price.base_price}€</span>
          {price.custom_price && (
            <span className="ml-2 font-bold text-green-600">
              {price.price_type === 'starting_from' ? 'À partir de ' : ''}
              {price.custom_price}€
            </span>
          )}
        </div>
        
        {editingMargin === price.id ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={tempMargin}
              onChange={(e) => setTempMargin(e.target.value)}
              className="w-20 h-6 text-sm"
              placeholder="Marge %"
            />
            <Button size="sm" onClick={() => saveMargin('repair_type', price.id)}>
              ✓
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMarginEdit(price.id, price.margin_percentage)}
            className="text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            {price.margin_percentage ? `${price.margin_percentage}%` : 'Marge'}
          </Button>
        )}
      </div>
    </div>
  );

  const renderModel = (model: CatalogTreeNode, brandId: string) => (
    <div key={model.id} className="ml-6 border-l-2 border-gray-200 pl-4">
      <Collapsible
        open={expandedModels.has(model.id)}
        onOpenChange={() => toggleModel(model.id)}
      >
        <div className="flex items-center justify-between py-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2">
              {expandedModels.has(model.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className={`font-medium ${!model.is_active ? 'text-gray-400 line-through' : ''}`}>
                {model.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {model.prices?.length || 0} prix
              </Badge>
            </Button>
          </CollapsibleTrigger>

          <div className="flex items-center space-x-2">
            <Switch
              checked={model.is_active}
              onCheckedChange={(checked) => 
                onUpdatePreference('device_model', model.id, { is_active: checked })
              }
              size="sm"
            />
            {editingMargin === model.id ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={tempMargin}
                  onChange={(e) => setTempMargin(e.target.value)}
                  className="w-20 h-6 text-sm"
                  placeholder="Marge %"
                />
                <Button size="sm" onClick={() => saveMargin('device_model', model.id)}>
                  ✓
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarginEdit(model.id, model.margin_percentage)}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {model.margin_percentage ? `${model.margin_percentage}%` : 'Marge'}
              </Button>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {model.prices?.map(price => renderPriceItem(price, model.id))}
            {model.prices?.length === 0 && (
              <div className="text-sm text-gray-500 italic">
                Aucun prix configuré pour ce modèle
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderBrand = (brand: CatalogTreeNode) => (
    <Card key={brand.id} className="mb-4">
      <CardContent className="p-4">
        <Collapsible
          open={expandedBrands.has(brand.id)}
          onOpenChange={() => toggleBrand(brand.id)}
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2">
                {expandedBrands.has(brand.id) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <span className={`text-lg font-semibold ${!brand.is_active ? 'text-gray-400 line-through' : ''}`}>
                  {brand.name}
                </span>
                <Badge variant="outline">
                  {brand.children?.length || 0} modèles
                </Badge>
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-3">
              <Switch
                checked={brand.is_active}
                onCheckedChange={(checked) => 
                  onUpdateBrandSetting(brand.id, { is_active: checked })
                }
              />
              {editingMargin === brand.id ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={tempMargin}
                    onChange={(e) => setTempMargin(e.target.value)}
                    className="w-24 h-8 text-sm"
                    placeholder="Marge par défaut %"
                  />
                  <Button size="sm" onClick={() => saveMargin('brand', brand.id)}>
                    ✓
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarginEdit(brand.id, brand.margin_percentage)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {brand.margin_percentage ? `Marge: ${brand.margin_percentage}%` : 'Définir marge'}
                </Button>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-4 space-y-2">
              {brand.children?.map(model => renderModel(model, brand.id))}
              {brand.children?.length === 0 && (
                <div className="text-sm text-gray-500 italic ml-6">
                  Aucun modèle disponible pour cette marque
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {catalogTree.map(brand => renderBrand(brand))}
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
