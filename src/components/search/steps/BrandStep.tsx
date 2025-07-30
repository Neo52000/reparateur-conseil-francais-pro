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
    const fetchBrandsForDeviceType = async () => {
      if (!searchData.deviceTypeId) return;

      setLoading(true);
      try {
        // Récupérer les marques qui ont des modèles pour ce type de device
        const { data, error } = await supabase
          .from('brands')
          .select(`
            id,
            name,
            logo_url,
            device_models!inner(device_type_id)
          `)
          .eq('device_models.device_type_id', searchData.deviceTypeId);

        if (error) throw error;

        // Dédoublonner les marques
        const uniqueBrands = data.reduce((acc: Brand[], brand: any) => {
          if (!acc.find(b => b.id === brand.id)) {
            acc.push({
              id: brand.id,
              name: brand.name,
              logo_url: brand.logo_url,
              created_at: brand.created_at
            });
          }
          return acc;
        }, []);

        setBrands(uniqueBrands.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandsForDeviceType();
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
        {brands.map((brand) => {
          const isSelected = searchData.brandId === brand.id;
          
          return (
            <Card
              key={brand.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(brand)}
            >
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
                  isSelected ? 'text-primary' : 'text-gray-900'
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