import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseRepairersTableActionsProps {
  repairers: any[];
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
}: UseRepairersTableActionsProps) => {
  const { toast } = useToast();
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const handleDeleteRepairer = async (repairerId: string) => {
    setLoading(repairerId);
    try {
      const { error } = await supabase
        .from('repairers')
        .delete()
        .eq('id', repairerId);

      if (error) throw error;
      toast({
        title: "Réparateur supprimé",
        description: "Le réparateur a été supprimé avec succès",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (repairerId: string, currentStatus: boolean) => {
    setLoading(repairerId);
    try {
      // Note: is_active field might not exist yet, this is a placeholder
      const { error } = await supabase
        .from('repairers')
        .update({ is_verified: !currentStatus })
        .eq('id', repairerId);
      
      if (error) throw error;
      
      toast({
        title: "Statut modifié",
        description: `Le réparateur a été ${currentStatus ? 'désactivé' : 'activé'}`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkSetActive = async () => {
    try {
      const { error } = await supabase
        .from('repairers')
        .update({ is_verified: true })
        .in('id', selectedIds);
      
      if (error) throw error;
      
      toast({
        title: "Réparateurs activés",
        description: `${selectedIds.length} réparateurs ont été activés`,
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer les réparateurs",
        variant: "destructive"
      });
    }
  };

  const requestBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteConfirm(false);
  };

  const confirmBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('repairers')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
      
      toast({
        title: "Réparateurs supprimés",
        description: `${selectedIds.length} réparateurs ont été supprimés`,
      });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les réparateurs",
        variant: "destructive"
      });
    }
  };

  return {
    handleDeleteRepairer,
    handleToggleStatus,
    handleBulkSetActive,
    requestBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete,
    showBulkDeleteConfirm,
  };
};
