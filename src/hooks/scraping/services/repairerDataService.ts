
import { supabase } from '@/integrations/supabase/client';
import { RepairerResult } from '../types';

export const fetchRepairersData = async () => {
  console.log("[repairerDataService] 🔍 Exécution de la requête principale...");
  
  const { data, error } = await supabase
    .from('repairers')
    .select('*')
    .order('scraped_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error("[repairerDataService] ❌ Erreur lors du chargement:", error);
    throw error;
  }

  return data as RepairerResult[];
};

export const updateRepairersStatus = async (selectedItems: string[], isVerified: boolean) => {
  const { data: updateData, error: updateError } = await supabase
    .from('repairers')
    .update({ is_verified: isVerified })
    .in('id', selectedItems)
    .select();

  if (updateError) {
    console.error("[repairerDataService] ❌ Erreur lors de la mise à jour:", updateError);
    throw updateError;
  }

  console.log("[repairerDataService] ✅ Données mises à jour:", updateData);
  return updateData;
};

export const deleteRepairers = async (selectedItems: string[]) => {
  const { data: deleteData, error: deleteError } = await supabase
    .from('repairers')
    .delete()
    .in('id', selectedItems)
    .select();

  if (deleteError) {
    console.error("[repairerDataService] ❌ Erreur lors de la suppression:", deleteError);
    throw deleteError;
  }

  console.log("[repairerDataService] ✅ Données supprimées:", deleteData);
  return deleteData;
};
