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

  const getErrorMessage = (error: unknown) => {
    if (!error) return 'Erreur inconnue';
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    // PostgrestError / unknown objects
    const anyErr = error as any;
    if (typeof anyErr?.message === 'string') return anyErr.message;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Erreur inconnue';
    }
  };

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
      console.error('❌ handleDeleteRepairer failed:', error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le réparateur. (${getErrorMessage(error)})`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (repairerId: string, currentStatus: boolean) => {
    setLoading(repairerId);
    try {
      console.log('🔄 handleToggleStatus:', { repairerId, currentStatus, newStatus: !currentStatus });
      
      const { data, error, count } = await supabase
        .from('repairers')
        .update({ is_verified: !currentStatus })
        .eq('id', repairerId)
        .select('id, is_verified');
      
      console.log('📊 Update result:', { data, error, count });
      
      if (error) throw error;
      
      // Vérifier si des lignes ont été modifiées (RLS peut bloquer silencieusement)
      if (!data || data.length === 0) {
        throw new Error('Aucune ligne modifiée. Vérifiez vos permissions admin.');
      }
      
      toast({
        title: "Statut modifié",
        description: `Le réparateur a été ${currentStatus ? 'désactivé' : 'activé'}`,
      });
      onRefresh();
    } catch (error) {
      console.error('❌ handleToggleStatus failed:', { repairerId, currentStatus, error });
      toast({
        title: "Erreur",
        description: `Impossible de modifier le statut. (${getErrorMessage(error)})`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkSetActive = async () => {
    try {
      console.log('🔄 handleBulkSetActive:', { selectedIds, count: selectedIds.length });
      
      const { data, error } = await supabase
        .from('repairers')
        .update({ is_verified: true })
        .in('id', selectedIds)
        .select('id');
      
      console.log('📊 Bulk activate result:', { data, error, updatedCount: data?.length });
      
      if (error) throw error;
      
      // Vérifier si des lignes ont été modifiées
      if (!data || data.length === 0) {
        throw new Error('Aucune ligne modifiée. Vérifiez vos permissions admin.');
      }
      
      toast({
        title: "Réparateurs activés",
        description: `${data.length} réparateur(s) ont été activés`,
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      console.error('❌ handleBulkSetActive failed:', { selectedIds, error });
      toast({
        title: "Erreur",
        description: `Impossible d'activer les réparateurs. (${getErrorMessage(error)})`,
        variant: "destructive"
      });
    }
  };

  const handleBulkSetInactive = async () => {
    try {
      console.log('🔄 handleBulkSetInactive:', { selectedIds, count: selectedIds.length });
      
      const { data, error } = await supabase
        .from('repairers')
        .update({ is_verified: false })
        .in('id', selectedIds)
        .select('id');
      
      console.log('📊 Bulk deactivate result:', { data, error, updatedCount: data?.length });
      
      if (error) throw error;
      
      // Vérifier si des lignes ont été modifiées
      if (!data || data.length === 0) {
        throw new Error('Aucune ligne modifiée. Vérifiez vos permissions admin.');
      }
      
      toast({
        title: "Réparateurs désactivés",
        description: `${data.length} réparateur(s) ont été désactivés`,
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      console.error('❌ handleBulkSetInactive failed:', { selectedIds, error });
      toast({
        title: "Erreur",
        description: `Impossible de désactiver les réparateurs. (${getErrorMessage(error)})`,
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
      console.error('❌ confirmBulkDelete failed:', { selectedIds, error });
      toast({
        title: "Erreur",
        description: `Impossible de supprimer les réparateurs. (${getErrorMessage(error)})`,
        variant: "destructive"
      });
    }
  };

  return {
    handleDeleteRepairer,
    handleToggleStatus,
    handleBulkSetActive,
    handleBulkSetInactive,
    requestBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete,
    showBulkDeleteConfirm,
  };
};
