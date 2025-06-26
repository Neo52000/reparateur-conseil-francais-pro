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
