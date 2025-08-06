
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';
import { supabase } from '@/integrations/supabase/client';
import type { RepairPrice, DeviceModel, RepairType } from '@/types/catalog';

interface RepairPriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  repairPrice?: RepairPrice | null;
}

interface PriceSuggestion {
  price_eur: number;
  part_price_eur?: number;
  labor_price_eur?: number;
  confidence: number;
  reasoning: string;
}

const RepairPriceDialog: React.FC<RepairPriceDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  repairPrice
}) => {
  const { deviceModels, repairTypes } = useCatalog();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);

  const [formData, setFormData] = useState({
    device_model_id: '',
    repair_type_id: '',
    price_eur: '',
    part_price_eur: '',
    labor_price_eur: '',
    is_available: true,
    notes: ''
  });

  useEffect(() => {
    if (repairPrice) {
      setFormData({
        device_model_id: repairPrice.device_model_id,
        repair_type_id: repairPrice.repair_type_id,
        price_eur: repairPrice.price_eur.toString(),
        part_price_eur: repairPrice.part_price_eur?.toString() || '',
        labor_price_eur: repairPrice.labor_price_eur?.toString() || '',
        is_available: repairPrice.is_available,
        notes: repairPrice.notes || ''
      });
    } else {
      setFormData({
        device_model_id: '',
        repair_type_id: '',
        price_eur: '',
        part_price_eur: '',
        labor_price_eur: '',
        is_available: true,
        notes: ''
      });
    }
    setPriceSuggestion(null);
  }, [repairPrice, isOpen]);

  const getAIPriceSuggestion = async () => {
    if (!formData.device_model_id || !formData.repair_type_id) {
      toast({
        title: 'Information manquante',
        description: 'Veuillez sélectionner un modèle et un type de réparation pour obtenir une suggestion IA.',
        variant: 'destructive'
      });
      return;
    }

    const selectedModel = deviceModels.find(m => m.id === formData.device_model_id);
    const selectedRepairType = repairTypes.find(r => r.id === formData.repair_type_id);

    if (!selectedModel || !selectedRepairType) return;

    try {
      setAiSuggesting(true);
      
      const { data, error } = await supabase.functions.invoke('ai-price-suggestion', {
        body: {
          device_model: selectedModel.model_name,
          device_brand: selectedModel.brand?.name || '',
          repair_type: selectedRepairType.name,
          repair_difficulty: selectedRepairType.difficulty_level,
          device_release_date: selectedModel.release_date,
          screen_size: selectedModel.screen_size
        }
      });

      if (error) throw error;

      setPriceSuggestion(data);
      
      // Auto-remplir les champs avec les suggestions
      setFormData(prev => ({
        ...prev,
        price_eur: data.price_eur.toString(),
        part_price_eur: data.part_price_eur?.toString() || '',
        labor_price_eur: data.labor_price_eur?.toString() || ''
      }));

      toast({
        title: 'Suggestion IA générée',
        description: 'Les prix ont été suggérés par l\'IA et pré-remplis.',
      });
    } catch (error) {
      console.error('Error getting AI price suggestion:', error);
      toast({
        title: 'Erreur IA',
        description: 'Impossible d\'obtenir une suggestion de prix.',
        variant: 'destructive'
      });
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.device_model_id || !formData.repair_type_id || !formData.price_eur) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const priceData = {
        device_model_id: formData.device_model_id,
        repair_type_id: formData.repair_type_id,
        price_eur: parseFloat(formData.price_eur),
        part_price_eur: formData.part_price_eur ? parseFloat(formData.part_price_eur) : null,
        labor_price_eur: formData.labor_price_eur ? parseFloat(formData.labor_price_eur) : null,
        is_available: formData.is_available,
        notes: formData.notes || null
      };

      let error;
      if (repairPrice) {
        const { error: updateError } = await supabase
          .from('repair_prices')
          .update(priceData)
          .eq('id', repairPrice.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('repair_prices')
          .insert([priceData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: repairPrice ? 'Prix modifié' : 'Prix créé',
        description: `Le prix a été ${repairPrice ? 'mis à jour' : 'créé'} avec succès.`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving repair price:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le prix.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = deviceModels.find(m => m.id === formData.device_model_id);
  const selectedRepairType = repairTypes.find(r => r.id === formData.repair_type_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {repairPrice ? 'Modifier le prix' : 'Nouveau prix de réparation'}
          </DialogTitle>
          <DialogDescription>
            Configurez les tarifs pour ce type de réparation. Utilisez l'IA pour obtenir des suggestions de prix.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_model">Modèle d'appareil *</Label>
              <Select value={formData.device_model_id} onValueChange={(value) => setFormData(prev => ({ ...prev, device_model_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {deviceModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.brand?.name} {model.model_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair_type">Type de réparation *</Label>
              <Select value={formData.repair_type_id} onValueChange={(value) => setFormData(prev => ({ ...prev, repair_type_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {repairTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                      {type.difficulty_level && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {type.difficulty_level}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.device_model_id && formData.repair_type_id && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Suggestion IA disponible</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getAIPriceSuggestion}
                disabled={aiSuggesting}
              >
                {aiSuggesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Suggérer prix
              </Button>
            </div>
          )}

          {priceSuggestion && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Suggestion IA</span>
                <Badge variant="outline" className="text-xs">
                  Confiance: {Math.round(priceSuggestion.confidence * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-green-800 mb-2">{priceSuggestion.reasoning}</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>Prix total: <span className="font-bold">{priceSuggestion.price_eur}€</span></div>
                {priceSuggestion.part_price_eur && (
                  <div>Pièce: <span className="font-bold">{priceSuggestion.part_price_eur}€</span></div>
                )}
                {priceSuggestion.labor_price_eur && (
                  <div>Main d'œuvre: <span className="font-bold">{priceSuggestion.labor_price_eur}€</span></div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_eur">Prix total (€) *</Label>
              <Input
                id="price_eur"
                type="number"
                step="0.01"
                value={formData.price_eur}
                onChange={(e) => setFormData(prev => ({ ...prev, price_eur: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="part_price_eur">Prix pièce (€)</Label>
              <Input
                id="part_price_eur"
                type="number"
                step="0.01"
                value={formData.part_price_eur}
                onChange={(e) => setFormData(prev => ({ ...prev, part_price_eur: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_price_eur">Main d'œuvre (€)</Label>
              <Input
                id="labor_price_eur"
                type="number"
                step="0.01"
                value={formData.labor_price_eur}
                onChange={(e) => setFormData(prev => ({ ...prev, labor_price_eur: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes optionnelles..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
            />
            <Label htmlFor="is_available">Disponible</Label>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {repairPrice ? 'Modifier' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepairPriceDialog;
