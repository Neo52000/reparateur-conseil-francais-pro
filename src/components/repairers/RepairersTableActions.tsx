
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  department?: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

interface RepairersTableActionsProps {
  repairers: RepairerData[];
  selectedIds: string[];
  loading: string | null;
  onRefresh: () => void;
  setLoading: (loading: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
}

export const useRepairersTableActions = ({
  repairers,
  selectedIds,
  loading,
  onRefresh,
  setLoading,
  setSelectedIds,
}: RepairersTableActionsProps) => {
  const { toast } = useToast();

  const generateRepairerId = (repairer: RepairerData) => {
    // Utilise le nom de la boutique + numéro du département
    const shopName = repairer.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const department = repairer.department || '00';
    return `${shopName}-${department}`;
  };

  const handleDeleteRepairer = async (repairerId: string) => {
    setLoading(repairerId);
    try {
      const { error } = await supabase
        .from("repairers")
        .delete()
        .eq("id", repairerId);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: "Réparateur supprimé avec succès"
      });
      onRefresh();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (repairerId: string, currentStatus: boolean) => {
    setLoading(repairerId);
    try {
      console.log('Changement de statut pour:', repairerId, 'de', currentStatus, 'vers', !currentStatus);
      
      const { error } = await supabase
        .from("repairers")
        .update({ 
          is_verified: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", repairerId);

      if (error) {
        console.error('Erreur Supabase lors du changement de statut:', error);
        throw error;
      }

      console.log('✅ Statut mis à jour avec succès');
      toast({
        title: "Succès",
        description: `Réparateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`
      });
      onRefresh();
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de modifier le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkSetActive = async (isActive: boolean) => {
    setLoading('bulk');
    try {
      console.log(`Changement de statut en masse pour ${selectedIds.length} réparateurs vers:`, isActive);
      
      const { error } = await supabase
        .from("repairers")
        .update({ 
          is_verified: isActive,
          updated_at: new Date().toISOString()
        })
        .in("id", selectedIds);

      if (error) {
        console.error('Erreur lors du changement de statut en masse:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: `Statut ${isActive ? 'activé' : 'désactivé'} pour ${selectedIds.length} réparateur(s)`
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error: any) {
      console.error('Erreur lors du changement de statut en masse:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de modifier le statut en masse",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer les réparateurs sélectionnés ? Cette action est irréversible.")) return;
    setLoading('bulk');
    try {
      const { error } = await supabase
        .from("repairers")
        .delete()
        .in("id", selectedIds);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: `${selectedIds.length} réparateur(s) supprimé(s)`
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error: any) {
      console.error('Erreur lors de la suppression en masse:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer des réparateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return {
    handleDeleteRepairer,
    handleToggleStatus,
    handleBulkSetActive,
    handleBulkDelete,
    generateRepairerId,
  };
};
