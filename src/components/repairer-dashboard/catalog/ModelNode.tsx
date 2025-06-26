
import React from 'react';
import { ChevronDown, ChevronRight, Calculator, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CatalogTreeNode } from '@/types/repairerCatalog';
import PriceItem from './PriceItem';

interface ModelNodeProps {
  model: CatalogTreeNode;
  brandId: string;
  expandedModels: Set<string>;
  editingMargin: string | null;
  tempMargin: string;
  onToggleModel: (modelId: string) => void;
  onUpdatePreference: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string, updates: any) => void;
  onMarginEdit: (id: string, currentMargin?: number) => void;
  onSaveMargin: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string) => void;
  onTempMarginChange: (value: string) => void;
}

const ModelNode: React.FC<ModelNodeProps> = ({
  model,
  brandId,
  expandedModels,
  editingMargin,
  tempMargin,
  onToggleModel,
  onUpdatePreference,
  onMarginEdit,
  onSaveMargin,
  onTempMarginChange
}) => {
  return (
    <div className="ml-6 border-l-2 border-gray-200 pl-4">
      <Collapsible
        open={expandedModels.has(model.id)}
        onOpenChange={() => onToggleModel(model.id)}
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
            />
            {editingMargin === model.id ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={tempMargin}
                  onChange={(e) => onTempMarginChange(e.target.value)}
                  className="w-20 h-6 text-sm"
                  placeholder="Marge %"
                />
                <Button size="sm" onClick={() => onSaveMargin('device_model', model.id)}>
                  ✓
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarginEdit(model.id, model.margin_percentage)}
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
            {model.prices?.map(price => (
              <PriceItem
                key={price.id}
                price={price}
                modelId={model.id}
                editingMargin={editingMargin}
                tempMargin={tempMargin}
                onUpdatePreference={onUpdatePreference}
                onMarginEdit={onMarginEdit}
                onSaveMargin={onSaveMargin}
                onTempMarginChange={onTempMarginChange}
              />
            ))}
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
};

export default ModelNode;
