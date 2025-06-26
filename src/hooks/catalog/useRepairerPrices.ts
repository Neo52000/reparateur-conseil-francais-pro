
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { RepairPrice } from '@/types/catalog';

interface RepairerCustomPrice {
  id: string;
  repairer_id: string;
  repair_price_id: string;
  custom_price_eur: number;
  custom_part_price_eur?: number;
  custom_labor_price_eur?: number;
  margin_percentage?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  repair_price?: RepairPrice;
}

export const useRepairerPrices = () => {
  const [repairerPrices, setRepairerPrices] = useState<RepairerCustomPrice[]>([]);
  const [basePrices, setBasePrices] = useState<RepairPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRepairerPrices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching repairer custom prices...');
      
      // Récupérer d'abord les prix personnalisés sans relations
      const { data: customPricesData, error: customError } = await supabase
        .from('repairer_custom_prices' as any)
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (customError) throw customError;

      // Récupérer les prix de base avec leurs relations
      const { data: basePricesData, error: baseError } = await supabase
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
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (baseError) throw baseError;

      // Associer les prix personnalisés avec leurs prix de base
      const enrichedCustomPrices = (customPricesData || []).map((customPrice: any) => {
        const relatedBasePrice = basePricesData?.find(bp => bp.id === customPrice.repair_price_id);
        return {
          ...customPrice,
          repair_price: relatedBasePrice
        };
      });

      console.log('Repairer prices fetched:', enrichedCustomPrices);
      console.log('Base prices fetched:', basePricesData);
      
      setRepairerPrices(enrichedCustomPrices);
      setBasePrices(basePricesData || []);
    } catch (err) {
      console.error('Error fetching repairer prices:', err);
      setError('Erreur lors du chargement des prix personnalisés');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos prix personnalisés',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomPrice = async (customPrice: Omit<RepairerCustomPrice, 'id' | 'created_at' | 'updated_at' | 'repairer_id' | 'repair_price'>) => {
    if (!user) return;
    
    try {
      console.log('Creating custom price:', customPrice);
      
      const { data, error } = await supabase
        .from('repairer_custom_prices' as any)
        .insert([{
          ...customPrice,
          repairer_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Custom price created:', data);
      toast({
        title: 'Prix personnalisé créé',
        description: 'Votre tarif personnalisé a été créé avec succès.',
      });
      
      await fetchRepairerPrices();
      return data;
    } catch (err) {
      console.error('Error creating custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la création du prix personnalisé');
    }
  };

  const updateCustomPrice = async (id: string, updates: Partial<RepairerCustomPrice>) => {
    try {
      console.log('Updating custom price:', id, updates);
      
      const { data, error } = await supabase
        .from('repairer_custom_prices' as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Custom price updated:', data);
      toast({
        title: 'Prix personnalisé modifié',
        description: 'Votre tarif a été mis à jour avec succès.',
      });
      
      await fetchRepairerPrices();
      return data;
    } catch (err) {
      console.error('Error updating custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la mise à jour du prix personnalisé');
    }
  };

  const deleteCustomPrice = async (id: string) => {
    try {
      console.log('Deleting custom price:', id);
      
      const { error } = await supabase
        .from('repairer_custom_prices' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('Custom price deleted');
      toast({
        title: 'Prix personnalisé supprimé',
        description: 'Votre tarif personnalisé a été supprimé avec succès.',
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error deleting custom price:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du prix personnalisé',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de la suppression du prix personnalisé');
    }
  };

  const bulkApplyMargin = async (margin: number, priceIds?: string[]) => {
    if (!user) return;
    
    try {
      console.log('Bulk applying margin:', margin, priceIds);
      
      // Si aucun ID spécifique, appliquer à tous les prix du réparateur
      const targetPrices = priceIds || repairerPrices.map(p => p.id);
      
      const updates = targetPrices.map(id => {
        const existingPrice = repairerPrices.find(p => p.id === id);
        if (!existingPrice?.repair_price) return null;
        
        const basePrice = existingPrice.repair_price.price_eur;
        const newPrice = basePrice * (1 + margin / 100);
        
        return {
          id,
          custom_price_eur: Math.round(newPrice * 100) / 100,
          margin_percentage: margin,
          updated_at: new Date().toISOString()
        };
      }).filter(Boolean);

      // Effectuer les mises à jour une par une pour éviter les problèmes de types
      for (const update of updates) {
        if (update) {
          await supabase
            .from('repairer_custom_prices' as any)
            .update({
              custom_price_eur: update.custom_price_eur,
              margin_percentage: update.margin_percentage,
              updated_at: update.updated_at
            })
            .eq('id', update.id);
        }
      }

      toast({
        title: 'Marge appliquée',
        description: `Marge de ${margin}% appliquée à ${updates.length} prix.`,
      });
      
      await fetchRepairerPrices();
    } catch (err) {
      console.error('Error applying bulk margin:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'application de la marge',
        variant: 'destructive',
      });
      throw new Error('Erreur lors de l\'application de la marge');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRepairerPrices();
    }
  }, [user]);

  return {
    repairerPrices,
    basePrices,
    loading,
    error,
    createCustomPrice,
    updateCustomPrice,
    deleteCustomPrice,
    bulkApplyMargin,
    refetch: fetchRepairerPrices
  };
};
