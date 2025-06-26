
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import RepairPricesTable from './RepairPricesTable';
import { supabase } from '@/integrations/supabase/client';
import type { RepairPrice } from '@/types/catalog';

const RepairPricesManagement = () => {
  const { deviceModels, repairTypes, loading } = useCatalog();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedRepairType, setSelectedRepairType] = useState('');
  const [repairPrices, setRepairPrices] = useState<RepairPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    fetchRepairPrices();
  }, []);

  const fetchRepairPrices = async () => {
    try {
      setPricesLoading(true);
      const { data, error } = await supabase
        .from('repair_prices')
        .select(`
          *,
          device_model:device_models(
            *,
            brand:brands(*)
          ),
          repair_type:repair_types(
            *,
            category:repair_categories(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données pour s'assurer de la compatibilité des types
      const transformedData = (data || []).map(item => ({
        ...item,
        device_model: item.device_model ? {
          ...item.device_model,
          storage_options: Array.isArray(item.device_model.storage_options) 
            ? item.device_model.storage_options 
            : [],
          colors: Array.isArray(item.device_model.colors) 
            ? item.device_model.colors 
            : [],
          connectivity: Array.isArray(item.device_model.connectivity) 
            ? item.device_model.connectivity 
            : [],
          special_features: Array.isArray(item.device_model.special_features) 
            ? item.device_model.special_features 
            : []
        } : null
      })) as RepairPrice[];
      
      setRepairPrices(transformedData);
    } catch (error) {
      console.error('Error fetching repair prices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prix de réparation.',
        variant: 'destructive',
      });
    } finally {
      setPricesLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      try {
        const { error } = await supabase
          .from('repair_prices')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchRepairPrices();
        toast({
          title: 'Prix supprimé',
          description: 'Le prix a été supprimé avec succès.',
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le prix.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (repairPrice: RepairPrice) => {
    // TODO: Implement edit functionality
    console.log('Edit repair price:', repairPrice);
  };

  const brands = [...new Set(deviceModels.map(model => model.brand).filter(Boolean))];
  
  const filteredPrices = repairPrices.filter(price => {
    const matchesSearch = 
      price.device_model?.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.device_model?.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.repair_type?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !selectedBrand || price.device_model?.brand?.id === selectedBrand;
    const matchesRepairType = !selectedRepairType || price.repair_type?.id === selectedRepairType;
    
    return matchesSearch && matchesBrand && matchesRepairType;
  });

  // Statistiques des prix
  const priceStats = {
    total: repairPrices.length,
    avgPrice: repairPrices.length > 0 
      ? repairPrices.reduce((sum, price) => sum + price.price_eur, 0) / repairPrices.length 
      : 0,
    minPrice: repairPrices.length > 0 
      ? Math.min(...repairPrices.map(price => price.price_eur)) 
      : 0,
    maxPrice: repairPrices.length > 0 
      ? Math.max(...repairPrices.map(price => price.price_eur)) 
      : 0,
  };

  if (loading || pricesLoading) {
    return <div className="flex justify-center p-8">Chargement des prix...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Grille tarifaire recommandée</h2>
          <p className="text-sm text-gray-600">
            {filteredPrices.length} prix configuré{filteredPrices.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => console.log('Add new price')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau prix
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix configurés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceStats.avgPrice.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix minimum</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{priceStats.minPrice.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix maximum</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{priceStats.maxPrice.toFixed(2)}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un modèle ou type de réparation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les marques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les marques</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRepairType} onValueChange={setSelectedRepairType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            {repairTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RepairPricesTable
        repairPrices={filteredPrices}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RepairPricesManagement;
