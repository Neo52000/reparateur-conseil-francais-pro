
import React from 'react';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CatalogTreeNode } from '@/types/repairerCatalog';
import ModelNode from './ModelNode';

interface BrandNodeProps {
  brand: CatalogTreeNode;
  expandedBrands: Set<string>;
  expandedModels: Set<string>;
  editingMargin: string | null;
  tempMargin: string;
  onToggleBrand: (brandId: string) => void;
  onToggleModel: (modelId: string) => void;
  onUpdatePreference: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string, updates: any) => void;
  onUpdateBrandSetting: (brandId: string, updates: any) => void;
  onMarginEdit: (id: string, currentMargin?: number) => void;
  onSaveMargin: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string) => void;
  onTempMarginChange: (value: string) => void;
}

const BrandNode: React.FC<BrandNodeProps> = ({
  brand,
  expandedBrands,
  expandedModels,
  editingMargin,
  tempMargin,
  onToggleBrand,
  onToggleModel,
  onUpdatePreference,
  onUpdateBrandSetting,
  onMarginEdit,
  onSaveMargin,
  onTempMarginChange
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <Collapsible
          open={expandedBrands.has(brand.id)}
          onOpenChange={() => onToggleBrand(brand.id)}
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
                    onChange={(e) => onTempMarginChange(e.target.value)}
                    className="w-24 h-8 text-sm"
                    placeholder="Marge par défaut %"
                  />
                  <Button size="sm" onClick={() => onSaveMargin('brand', brand.id)}>
                    ✓
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarginEdit(brand.id, brand.margin_percentage)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {brand.margin_percentage ? `Marge: ${brand.margin_percentage}%` : 'Définir marge'}
                </Button>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-4 space-y-2">
              {brand.children?.map(model => (
                <ModelNode
                  key={model.id}
                  model={model}
                  brandId={brand.id}
                  expandedModels={expandedModels}
                  editingMargin={editingMargin}
                  tempMargin={tempMargin}
                  onToggleModel={onToggleModel}
                  onUpdatePreference={onUpdatePreference}
                  onMarginEdit={onMarginEdit}
                  onSaveMargin={onSaveMargin}
                  onTempMarginChange={onTempMarginChange}
                />
              ))}
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
};

export default BrandNode;
