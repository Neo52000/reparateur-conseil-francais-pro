import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Taille max des chunks pour éviter les URLs trop longues
const CHUNK_SIZE = 50;

interface UseRepairersTableActionsProps {
  repairers: any[];
  selectedIds: string[];
  loading: string | null;
  onRefresh: () => void;
  setLoading: (loading: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
}

// Utilitaire pour découper un tableau en chunks
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

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
      console.log('🔄 handleBulkSetActive:', { count: selectedIds.length });
      
      const chunks = chunkArray(selectedIds, CHUNK_SIZE);
      let totalUpdated = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} items)`);
        
        const { data, error } = await supabase
          .from('repairers')
          .update({ is_verified: true })
          .in('id', chunk)
          .select('id');
        
        if (error) throw error;
        totalUpdated += data?.length || 0;
      }
      
      if (totalUpdated === 0) {
        throw new Error('Aucune ligne modifiée. Vérifiez vos permissions admin.');
      }
      
      toast({
        title: "Réparateurs activés",
        description: `${totalUpdated} réparateur(s) ont été activés`,
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      console.error('❌ handleBulkSetActive failed:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'activer les réparateurs. (${getErrorMessage(error)})`,
        variant: "destructive"
      });
    }
  };

  const handleBulkSetInactive = async () => {
    try {
      console.log('🔄 handleBulkSetInactive:', { count: selectedIds.length });
      
      const chunks = chunkArray(selectedIds, CHUNK_SIZE);
      let totalUpdated = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} items)`);
        
        const { data, error } = await supabase
          .from('repairers')
          .update({ is_verified: false })
          .in('id', chunk)
          .select('id');
        
        if (error) throw error;
        totalUpdated += data?.length || 0;
      }
      
      if (totalUpdated === 0) {
        throw new Error('Aucune ligne modifiée. Vérifiez vos permissions admin.');
      }
      
      toast({
        title: "Réparateurs désactivés",
        description: `${totalUpdated} réparateur(s) ont été désactivés`,
      });
      setSelectedIds([]);
      onRefresh();
    } catch (error) {
      console.error('❌ handleBulkSetInactive failed:', error);
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
      console.log('🗑️ confirmBulkDelete:', { count: selectedIds.length });
      
      const chunks = chunkArray(selectedIds, CHUNK_SIZE);
      let totalDeleted = 0;
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`📦 Deleting chunk ${i + 1}/${chunks.length} (${chunk.length} items)`);
        
        const { error } = await supabase
          .from('repairers')
          .delete()
          .in('id', chunk);
        
        if (error) throw error;
        totalDeleted += chunk.length;
      }
      
      toast({
        title: "Réparateurs supprimés",
        description: `${totalDeleted} réparateurs ont été supprimés`,
      });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      onRefresh();
    } catch (error) {
      console.error('❌ confirmBulkDelete failed:', error);
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
