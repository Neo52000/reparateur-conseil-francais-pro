
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PriceConfigurationProps {
  priceType: 'fixed' | 'starting_from';
  customPrice: string;
  customPartPrice: string;
  customLaborPrice: string;
  marginPercentage: string;
  selectedBasePrice: any;
  onPriceTypeChange: (value: 'fixed' | 'starting_from') => void;
  onCustomPriceChange: (value: string) => void;
  onCustomPartPriceChange: (value: string) => void;
  onCustomLaborPriceChange: (value: string) => void;
  onMarginPercentageChange: (value: string) => void;
  onApplyMargin: () => void;
}

const PriceConfiguration: React.FC<PriceConfigurationProps> = ({
  priceType,
  customPrice,
  customPartPrice,
  customLaborPrice,
  marginPercentage,
  selectedBasePrice,
  onPriceTypeChange,
  onCustomPriceChange,
  onCustomPartPriceChange,
  onCustomLaborPriceChange,
  onMarginPercentageChange,
  onApplyMargin
}) => {
  return (
    <>
      {/* Type de prix */}
      <div className="space-y-3">
        <Label>Type de prix</Label>
        <RadioGroup value={priceType} onValueChange={onPriceTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">Prix fixe</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="starting_from" id="starting_from" />
            <Label htmlFor="starting_from">À partir de</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Prix personnalisé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customPrice">
            Prix {priceType === 'starting_from' ? 'de départ' : 'fixe'} (€)
          </Label>
          <Input
            id="customPrice"
            type="number"
            step="0.01"
            value={customPrice}
            onChange={(e) => onCustomPriceChange(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin">Marge (%)</Label>
          <div className="flex space-x-2">
            <Input
              id="margin"
              type="number"
              step="0.1"
              value={marginPercentage}
              onChange={(e) => onMarginPercentageChange(e.target.value)}
              placeholder="0.0"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={onApplyMargin} 
              disabled={!selectedBasePrice || !marginPercentage}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </div>

      {/* Prix détaillés (optionnel) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customPartPrice">Prix pièce personnalisé (€)</Label>
          <Input
            id="customPartPrice"
            type="number"
            step="0.01"
            value={customPartPrice}
            onChange={(e) => onCustomPartPriceChange(e.target.value)}
            placeholder="Optionnel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customLaborPrice">Prix main d'œuvre personnalisé (€)</Label>
          <Input
            id="customLaborPrice"
            type="number"
            step="0.01"
            value={customLaborPrice}
            onChange={(e) => onCustomLaborPriceChange(e.target.value)}
            placeholder="Optionnel"
          />
        </div>
      </div>
    </>
  );
};

export default PriceConfiguration;
