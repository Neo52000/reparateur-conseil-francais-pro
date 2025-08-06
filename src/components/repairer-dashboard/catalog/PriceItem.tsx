
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator } from 'lucide-react';

interface PriceItemProps {
  price: any;
  modelId: string;
  editingMargin: string | null;
  tempMargin: string;
  onUpdatePreference: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string, updates: any) => void;
  onMarginEdit: (id: string, currentMargin?: number) => void;
  onSaveMargin: (entityType: 'brand' | 'device_model' | 'repair_type', entityId: string) => void;
  onTempMarginChange: (value: string) => void;
}

const PriceItem: React.FC<PriceItemProps> = ({
  price,
  modelId,
  editingMargin,
  tempMargin,
  onUpdatePreference,
  onMarginEdit,
  onSaveMargin,
  onTempMarginChange
}) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Switch
            checked={price.is_active}
            onCheckedChange={(checked) => 
              onUpdatePreference('repair_type', price.id, { is_active: checked })
            }
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
              onChange={(e) => onTempMarginChange(e.target.value)}
              className="w-20 h-6 text-sm"
              placeholder="Marge %"
            />
            <Button size="sm" onClick={() => onSaveMargin('repair_type', price.id)}>
              ✓
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarginEdit(price.id, price.margin_percentage)}
            className="text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            {price.margin_percentage ? `${price.margin_percentage}%` : 'Marge'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PriceItem;
