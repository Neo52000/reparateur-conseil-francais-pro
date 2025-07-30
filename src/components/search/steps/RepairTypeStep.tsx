import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Star, Wrench } from 'lucide-react';
import type { RepairType } from '@/types/catalog';
import type { SearchStepData } from '../AdvancedProductSearch';

interface RepairTypeStepProps {
  searchData: Partial<SearchStepData>;
  onDataChange: (data: Partial<SearchStepData>) => void;
}

const RepairTypeStep: React.FC<RepairTypeStepProps> = ({
  searchData,
  onDataChange
}) => {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepairTypes = async () => {
      setLoading(true);
      try {
        // Récupérer tous les types de réparation actifs
        const { data, error } = await supabase
          .from('repair_types')
          .select(`
            *,
            category:repair_categories(*)
          `)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setRepairTypes(data || []);
      } catch (error) {
        console.error('Error fetching repair types:', error);
        setRepairTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepairTypes();
  }, []);

  const handleSelect = (repairType: RepairType) => {
    onDataChange({
      repairTypeId: repairType.id,
      repairTypeName: repairType.name
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des types de réparation...</p>
        </div>
      </div>
    );
  }

  if (repairTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Aucun type de réparation disponible.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Quel est le problème avec votre {searchData.modelName || searchData.brandName} ?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repairTypes.map((repairType) => {
          const isSelected = searchData.repairTypeId === repairType.id;
          
          return (
            <Card
              key={repairType.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(repairType)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Wrench className={`h-6 w-6 ${
                    isSelected ? 'text-primary' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${
                    isSelected ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {repairType.name}
                  </h4>
                  
                  {repairType.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {repairType.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getDifficultyColor(repairType.difficulty_level)}>
                      {repairType.difficulty_level}
                    </Badge>
                    
                    {repairType.estimated_time_minutes && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.ceil(repairType.estimated_time_minutes / 60)}h
                      </div>
                    )}
                    
                    {repairType.warranty_days && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 mr-1" />
                        {repairType.warranty_days}j garantie
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RepairTypeStep;