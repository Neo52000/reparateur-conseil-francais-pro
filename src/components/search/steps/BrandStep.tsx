import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Brand } from '@/types/catalog';
import type { SearchStepData } from '../AdvancedProductSearch';

interface BrandStepProps {
  searchData: Partial<SearchStepData>;
  onDataChange: (data: Partial<SearchStepData>) => void;
}

const BrandStep: React.FC<BrandStepProps> = ({
  searchData,
  onDataChange
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBrands = async () => {
      if (!searchData.deviceTypeId) return;

      setLoading(true);
      try {
        // Récupérer toutes les marques avec indication des modèles disponibles
        const { data: allBrands, error: brandsError } = await supabase
          .from('brands')
          .select('id, name, logo_url, created_at')
          .order('name');

        if (brandsError) throw brandsError;

        // Récupérer les marques qui ont des modèles pour ce type de device
        const { data: brandsWithModels, error: modelsError } = await supabase
          .from('brands')
          .select(`
            id,
            device_models!inner(device_type_id)
          `)
          .eq('device_models.device_type_id', searchData.deviceTypeId);

        if (modelsError) throw modelsError;

        // Marquer les marques qui ont des modèles disponibles
        const brandsWithModelsIds = new Set(
          brandsWithModels.map(brand => brand.id)
        );

        const enrichedBrands = allBrands.map(brand => ({
          ...brand,
          hasModels: brandsWithModelsIds.has(brand.id)
        }));

        setBrands(enrichedBrands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBrands();
  }, [searchData.deviceTypeId]);

  const handleSelect = (brand: Brand) => {
    onDataChange({
      brandId: brand.id,
      brandName: brand.name,
      // Reset étapes suivantes
      modelId: '',
      modelName: '',
      repairTypeId: '',
      repairTypeName: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des marques...</p>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Aucune marque disponible pour ce type de produit.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Quelle est la marque de votre {searchData.deviceTypeName?.toLowerCase()} ?
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {brands.map((brand: any) => {
          const isSelected = searchData.brandId === brand.id;
          const hasModels = brand.hasModels;
          
          return (
            <Card
              key={brand.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg relative ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : hasModels
                  ? 'hover:border-primary/50'
                  : 'hover:border-gray-300 opacity-75'
              }`}
              onClick={() => handleSelect(brand)}
            >
              {!hasModels && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Limité
                  </span>
                </div>
              )}
              <div className="text-center">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-12 w-12 object-contain mx-auto mb-3"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-600 font-semibold text-sm">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h4 className={`font-medium text-sm ${
                  isSelected ? 'text-primary' : hasModels ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {brand.name}
                </h4>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BrandStep;