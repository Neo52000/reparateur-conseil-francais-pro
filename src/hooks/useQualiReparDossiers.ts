import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QualiReparDossier, DossierCreationData } from '@/types/qualirepar';
import { toast } from 'sonner';

export const useQualiReparDossiers = () => {
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDossiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDossiers(data || []);
    } catch (error) {
      console.error('Error loading dossiers:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  // Add reload alias for backward compatibility
  const reload = loadDossiers;

  const createDossier = async (dossierData: Partial<QualiReparDossier> | DossierCreationData) => {
    setSaving(true);
    try {
      // Map creation data to database format
      const dbData: any = {
        ...dossierData,
        // Handle client name mapping
        client_first_name: (dossierData as any).clientFirstName || (dossierData as any).client_first_name || (dossierData as any).clientName?.split(' ')[0] || '',
        client_last_name: (dossierData as any).clientLastName || (dossierData as any).client_last_name || (dossierData as any).clientName?.split(' ').slice(1).join(' ') || '',
        client_email: (dossierData as any).clientEmail || (dossierData as any).client_email,
        client_phone: (dossierData as any).clientPhone || (dossierData as any).client_phone,
        client_address: (dossierData as any).clientAddress || (dossierData as any).client_address || '',
        client_postal_code: (dossierData as any).clientPostalCode || (dossierData as any).client_postal_code || '',
        client_city: (dossierData as any).clientCity || (dossierData as any).client_city || '',
        client_country: (dossierData as any).clientCountry || (dossierData as any).client_country || 'FR',
        
        // Handle product mapping
        product_category: (dossierData as any).productCategory || (dossierData as any).product_category || '',
        product_brand: (dossierData as any).productBrand || (dossierData as any).product_brand || '',
        product_model: (dossierData as any).productModel || (dossierData as any).product_model || '',
        product_serial_number: (dossierData as any).productSerialNumber || (dossierData as any).product_serial_number,
        
        // Handle repair info
        repair_description: (dossierData as any).repairDescription || (dossierData as any).repair_description || '',
        repair_cost: (dossierData as any).repairCost || (dossierData as any).repair_cost || 0,
        repair_date: (dossierData as any).repairDate || (dossierData as any).repair_date,
        requested_bonus_amount: (dossierData as any).requestedBonusAmount || (dossierData as any).requested_bonus_amount || 0,
        
        // Handle ID mapping for v3 compatibility
        reimbursement_claim_id: (dossierData as any).reimbursement_claim_id || (dossierData as any).temporary_claim_id,
        
        // Set defaults
        eco_organism: (dossierData as any).eco_organism || 'ecosystem',
        status: (dossierData as any).status || 'draft',
      };

      const { data: newDossier, error } = await supabase
        .from('qualirepar_dossiers')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Dossier QualiRépar créé avec succès');
      await loadDossiers();
      return newDossier;
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast.error('Erreur lors de la création du dossier');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateDossier = async (id: string, updates: Partial<QualiReparDossier>) => {
    setSaving(true);
    try {
      // Map v3 fields if they exist
      const dbUpdates: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('qualirepar_dossiers')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Dossier mis à jour avec succès');
      await loadDossiers();
      return true;
    } catch (error) {
      console.error('Error updating dossier:', error);
      toast.error('Erreur lors de la mise à jour du dossier');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteDossier = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('qualirepar_dossiers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Dossier supprimé avec succès');
      await loadDossiers();
      return true;
    } catch (error) {
      console.error('Error deleting dossier:', error);
      toast.error('Erreur lors de la suppression du dossier');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Helper function to map database data to component-friendly format
  const mapDossierForComponent = (dossier: any): QualiReparDossier => {
    return {
      ...dossier,
      // Ensure backward compatibility
      client_name: dossier.client_name || `${dossier.client_first_name || ''} ${dossier.client_last_name || ''}`.trim(),
      temporary_claim_id: dossier.temporary_claim_id || dossier.reimbursement_claim_id,
    } as QualiReparDossier;
  };

  const getDossierById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return mapDossierForComponent(data);
    } catch (error) {
      console.error('Error fetching dossier:', error);
      return null;
    }
  };

  const getRecentActivity = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map(mapDossierForComponent) || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  const getStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        draft: data?.filter(d => d.status === 'draft').length || 0,
        submitted: data?.filter(d => d.status === 'submitted').length || 0,
        approved: data?.filter(d => d.status === 'approved').length || 0,
        rejected: data?.filter(d => d.status === 'rejected').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0 };
    }
  };

  // Add getDossierStats alias for backward compatibility
  const getDossierStats = getStatistics;

  return {
    dossiers: dossiers.map(mapDossierForComponent),
    loading,
    saving,
    loadDossiers,
    reload, // Alias for loadDossiers
    createDossier,
    updateDossier,
    deleteDossier,
    getDossierById,
    getRecentActivity,
    getStatistics,
    getDossierStats, // Alias for getStatistics
  };
};