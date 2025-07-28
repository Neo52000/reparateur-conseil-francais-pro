import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QualiReparDossier, DossierCreationData } from '@/types/qualirepar';
import { toast } from 'sonner';

export const useQualiReparDossiers = () => {
  const [dossiers, setDossiers] = useState<QualiReparDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDossiers = async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDossiers((data || []) as QualiReparDossier[]);
    } catch (error) {
      console.error('Error loading dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  const createDossier = async (data: DossierCreationData): Promise<QualiReparDossier | null> => {
    setSaving(true);
    try {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: newDossier, error } = await supabase
        .from('qualirepar_dossiers')
        .insert({
          repairer_id: user.id,
          repair_order_id: data.repairOrderId,
          pos_transaction_id: data.posTransactionId,
          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: data.clientPhone,
          client_address: data.clientAddress,
          client_postal_code: data.clientPostalCode,
          client_city: data.clientCity,
          product_category: data.productCategory,
          product_brand: data.productBrand,
          product_model: data.productModel,
          product_serial_number: data.productSerialNumber,
          repair_description: data.repairDescription,
          repair_cost: data.repairCost,
          repair_date: data.repairDate,
          requested_bonus_amount: data.requestedBonusAmount,
          eco_organism: 'Ecosystem'
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Dossier QualiRépar créé avec succès');
      await loadDossiers(); // Recharger la liste
      return newDossier as QualiReparDossier;
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast.error('Erreur lors de la création du dossier');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateDossier = async (id: string, updates: Partial<QualiReparDossier>): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('qualirepar_dossiers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Dossier mis à jour');
      await loadDossiers();
      return true;
    } catch (error) {
      console.error('Error updating dossier:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteDossier = async (id: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('qualirepar_dossiers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Dossier supprimé');
      await loadDossiers();
      return true;
    } catch (error) {
      console.error('Error deleting dossier:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getDossiersByStatus = (status: QualiReparDossier['status']): QualiReparDossier[] => {
    return dossiers.filter(dossier => dossier.status === status);
  };

  const getDossierStats = () => {
    const stats = {
      total: dossiers.length,
      draft: 0,
      submitted: 0,
      approved: 0,
      paid: 0,
      rejected: 0,
      totalRequested: 0,
      totalApproved: 0
    };

    dossiers.forEach(dossier => {
      stats[dossier.status as keyof typeof stats]++;
      stats.totalRequested += dossier.requested_bonus_amount;
      if (dossier.status === 'approved' || dossier.status === 'paid') {
        stats.totalApproved += dossier.requested_bonus_amount;
      }
    });

    return stats;
  };

  useEffect(() => {
    loadDossiers();
  }, []);

  return {
    dossiers,
    loading,
    saving,
    createDossier,
    updateDossier,
    deleteDossier,
    getDossiersByStatus,
    getDossierStats,
    reload: loadDossiers
  };
};