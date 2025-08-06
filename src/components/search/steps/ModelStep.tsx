import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import type { DeviceModel } from '@/types/catalog';
import type { SearchStepData } from '../AdvancedProductSearch';

interface ModelStepProps {
  searchData: Partial<SearchStepData>;
  onDataChange: (data: Partial<SearchStepData>) => void;
}

const ModelStep: React.FC<ModelStepProps> = ({
  searchData,
  onDataChange
}) => {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchModelsForBrand = async () => {
      if (!searchData.brandId || !searchData.deviceTypeId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('device_models')
          .select('*')
          .eq('brand_id', searchData.brandId)
          .eq('device_type_id', searchData.deviceTypeId)
          .eq('is_active', true)
          .order('model_name');

        if (error) throw error;

        setModels(data || []);
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModelsForBrand();
  }, [searchData.brandId, searchData.deviceTypeId]);

  const filteredModels = models.filter(model =>
    model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.model_number && model.model_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (modelId: string) => {
    const selectedModel = models.find(m => m.id === modelId);
    if (selectedModel) {
      onDataChange({
        modelId: selectedModel.id,
        modelName: selectedModel.model_name,
        // Reset étapes suivantes
        repairTypeId: '',
        repairTypeName: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          Aucun modèle disponible pour cette marque.
        </p>
        <p className="text-sm text-gray-500">
          Vous pouvez tout de même continuer avec une recherche générique.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Quel est le modèle de votre {searchData.brandName} ?
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="model-search">Rechercher un modèle</Label>
          <Input
            id="model-search"
            placeholder="Tapez le nom du modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="model-select">Ou sélectionnez dans la liste</Label>
          <Select onValueChange={handleSelect} value={searchData.modelId || ''}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.model_name}</span>
                    {model.model_number && (
                      <span className="text-sm text-gray-500">
                        {model.model_number}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {searchData.modelId && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Modèle sélectionné : {searchData.modelName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStep;