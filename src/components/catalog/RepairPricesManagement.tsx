
import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import RepairPricesTable from './RepairPricesTable';
import RepairPriceDialog from './RepairPriceDialog';
import RepairPricesHeader from './RepairPricesHeader';
import RepairPricesStats from './RepairPricesStats';
import RepairPricesFilters from './RepairPricesFilters';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<RepairPrice | null>(null);

  useEffect(() => {
    fetchRepairPrices();
  }, []);

  const fetchRepairPrices = async () => {
    try {
      setPricesLoading(true);
      console.log('Fetching repair prices...');
      
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

      if (error) {
        console.error('Error fetching repair prices:', error);
        throw error;
      }
      
      console.log('Repair prices fetched:', data);
      
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

  const handleEdit = (repairPrice: RepairPrice) => {
    setEditingPrice(repairPrice);
    setIsDialogOpen(true);
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
        console.error('Error deleting repair price:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le prix.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    await fetchRepairPrices();
    setIsDialogOpen(false);
    setEditingPrice(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrice(null);
  };

  const handleAddNew = () => {
    setEditingPrice(null);
    setIsDialogOpen(true);
  };

  const filteredPrices = repairPrices.filter(price => {
    const matchesSearch = 
      price.device_model?.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.device_model?.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.repair_type?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !selectedBrand || selectedBrand === 'all' || price.device_model?.brand?.id === selectedBrand;
    const matchesRepairType = !selectedRepairType || selectedRepairType === 'all' || price.repair_type?.id === selectedRepairType;
    
    return matchesSearch && matchesBrand && matchesRepairType;
  });

  if (loading || pricesLoading) {
    return <div className="flex justify-center p-8">Chargement des prix...</div>;
  }

  return (
    <div className="space-y-6">
      <RepairPricesHeader
        filteredPricesCount={filteredPrices.length}
        onAddNew={handleAddNew}
      />

      <RepairPricesStats repairPrices={repairPrices} />

      <RepairPricesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedRepairType={selectedRepairType}
        setSelectedRepairType={setSelectedRepairType}
        deviceModels={deviceModels}
        repairTypes={repairTypes}
      />

      <RepairPricesTable
        repairPrices={filteredPrices}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RepairPriceDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        repairPrice={editingPrice}
      />
    </div>
  );
};

export default RepairPricesManagement;
