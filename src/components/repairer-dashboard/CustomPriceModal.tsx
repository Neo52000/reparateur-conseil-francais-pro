
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import type { RepairerCustomPrice, CreateCustomPriceData, UpdateCustomPriceData } from '@/types/repairerPricing';
import type { RepairPrice } from '@/types/catalog';

interface CustomPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCustomPriceData | UpdateCustomPriceData) => Promise<void>;
  editingPrice?: RepairerCustomPrice | null;
  basePrices: RepairPrice[];
}

const CustomPriceModal: React.FC<CustomPriceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPrice,
  basePrices
}) => {
  const { brands, deviceModels, repairTypes, loading } = useCatalog();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRepairType, setSelectedRepairType] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customPartPrice, setCustomPartPrice] = useState('');
  const [customLaborPrice, setCustomLaborPrice] = useState('');
  const [marginPercentage, setMarginPercentage] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'starting_from'>('fixed');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Filtered data
  const filteredModels = deviceModels.filter(model => model.brand_id === selectedBrand);
  const selectedBasePrice = basePrices.find(price => 
    price.device_model_id === selectedModel && price.repair_type_id === selectedRepairType
  );

  // Reset form
  const resetForm = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedRepairType('');
    setCustomPrice('');
    setCustomPartPrice('');
    setCustomLaborPrice('');
    setMarginPercentage('');
    setPriceType('fixed');
    setNotes('');
    setIsActive(true);
  };

  // Load editing data
  useEffect(() => {
    if (editingPrice) {
      setSelectedBrand(editingPrice.repair_price?.device_model?.brand_id || '');
      setSelectedModel(editingPrice.repair_price?.device_model_id || '');
      setSelectedRepairType(editingPrice.repair_price?.repair_type_id || '');
      setCustomPrice(editingPrice.custom_price_eur.toString());
      setCustomPartPrice(editingPrice.custom_part_price_eur?.toString() || '');
      setCustomLaborPrice(editingPrice.custom_labor_price_eur?.toString() || '');
      setMarginPercentage(editingPrice.margin_percentage?.toString() || '');
      setPriceType(editingPrice.price_type || 'fixed');
      setNotes(editingPrice.notes || '');
      setIsActive(editingPrice.is_active);
    } else {
      resetForm();
    }
  }, [editingPrice, isOpen]);

  // Calculate margin when base price changes
  useEffect(() => {
    if (selectedBasePrice && customPrice) {
      const custom = parseFloat(customPrice);
      const base = selectedBasePrice.price_eur;
      if (!isNaN(custom) && base > 0) {
        const margin = ((custom - base) / base) * 100;
        setMarginPercentage(margin.toFixed(1));
      }
    }
  }, [customPrice, selectedBasePrice]);

  // Apply margin to calculate price
  const applyMargin = () => {
    if (selectedBasePrice && marginPercentage) {
      const margin = parseFloat(marginPercentage);
      const basePrice = selectedBasePrice.price_eur;
      if (!isNaN(margin)) {
        const newPrice = basePrice * (1 + margin / 100);
        setCustomPrice(newPrice.toFixed(2));
      }
    }
  };

  const handleSave = async () => {
    if (!selectedModel || !selectedRepairType || !customPrice) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const repairPriceId = basePrices.find(price => 
      price.device_model_id === selectedModel && price.repair_type_id === selectedRepairType
    )?.id;

    if (!repairPriceId) {
      toast({
        title: 'Erreur',
        description: 'Combinaison modèle/réparation non trouvée dans le catalogue',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const data = {
        repair_price_id: repairPriceId,
        custom_price_eur: parseFloat(customPrice),
        custom_part_price_eur: customPartPrice ? parseFloat(customPartPrice) : undefined,
        custom_labor_price_eur: customLaborPrice ? parseFloat(customLaborPrice) : undefined,
        margin_percentage: marginPercentage ? parseFloat(marginPercentage) : undefined,
        price_type: priceType,
        is_starting_price: priceType === 'starting_from',
        is_active: isActive,
        notes: notes || undefined
      };

      await onSave(data);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving custom price:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPrice ? 'Modifier le prix personnalisé' : 'Créer un prix personnalisé'}
          </DialogTitle>
          <DialogDescription>
            Personnalisez un prix de réparation basé sur le catalogue de référence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection du produit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={!!editingPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!!editingPrice || !selectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.model_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repairType">Type de réparation</Label>
            <Select value={selectedRepairType} onValueChange={setSelectedRepairType} disabled={!!editingPrice}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type de réparation" />
              </SelectTrigger>
              <SelectContent>
                {repairTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix de référence */}
          {selectedBasePrice && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Prix de référence</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Prix total:</span>
                  <p className="font-medium">{selectedBasePrice.price_eur}€</p>
                </div>
                {selectedBasePrice.part_price_eur && (
                  <div>
                    <span className="text-gray-600">Pièce:</span>
                    <p className="font-medium">{selectedBasePrice.part_price_eur}€</p>
                  </div>
                )}
                {selectedBasePrice.labor_price_eur && (
                  <div>
                    <span className="text-gray-600">Main d'œuvre:</span>
                    <p className="font-medium">{selectedBasePrice.labor_price_eur}€</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type de prix */}
          <div className="space-y-3">
            <Label>Type de prix</Label>
            <RadioGroup value={priceType} onValueChange={(value: 'fixed' | 'starting_from') => setPriceType(value)}>
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
                onChange={(e) => setCustomPrice(e.target.value)}
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
                  onChange={(e) => setMarginPercentage(e.target.value)}
                  placeholder="0.0"
                />
                <Button type="button" variant="outline" onClick={applyMargin} disabled={!selectedBasePrice || !marginPercentage}>
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
                onChange={(e) => setCustomPartPrice(e.target.value)}
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
                onChange={(e) => setCustomLaborPrice(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes sur ce prix..."
              rows={3}
            />
          </div>

          {/* Activation */}
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Prix actif</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedModel || !selectedRepairType || !customPrice}>
            {saving ? 'Sauvegarde...' : editingPrice ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPriceModal;
