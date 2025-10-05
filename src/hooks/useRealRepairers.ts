import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealRepairer {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  services?: string[];
  specialties?: string[];
  rating?: number;
  lat?: number;
  lng?: number;
  is_verified?: boolean;
  data_quality_score?: number;
  created_at: string;
  updated_at: string;
}

export const useRealRepairers = () => {
  const [repairers, setRepairers] = useState<RealRepairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRepairers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer d'abord les suggestions de scraping
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('scraping_suggestions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (suggestionsError) {
        console.error('❌ Erreur lors du chargement des suggestions:', suggestionsError);
      }

      // Récupérer les réparateurs existants
      const { data: existingRepairers, error: repairersError} = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (repairersError) {
        console.error('❌ Erreur lors du chargement des réparateurs:', repairersError);
        throw repairersError;
      }

      // Combiner les données avec priorité aux réparateurs existants
      const allRepairers: RealRepairer[] = [];
      
      // Ajouter les réparateurs existants
      if (existingRepairers) {
        allRepairers.push(...existingRepairers.map(repairer => ({
          id: repairer.id,
          name: repairer.name,
          address: repairer.address,
          city: repairer.city,
          postal_code: repairer.postal_code,
          phone: repairer.phone,
          email: repairer.email,
          website: repairer.website,
          description: repairer.description,
          services: repairer.services || [],
          specialties: repairer.specialties || [],
          rating: repairer.rating,
          lat: repairer.lat,
          lng: repairer.lng,
          is_verified: repairer.is_verified,
          data_quality_score: repairer.data_quality_score,
          created_at: repairer.created_at,
          updated_at: repairer.updated_at
        })));
      }

      // Ajouter les suggestions non encore intégrées
      if (suggestions) {
        const existingNames = new Set(allRepairers.map(r => r.name.toLowerCase()));
        
        suggestions.forEach(suggestion => {
          // Extraire les données du JSON scraped_data
          const data = suggestion.scraped_data as any;
          const businessName = data?.name || data?.business_name || `Business ${suggestion.id}`;
          
          if (!existingNames.has(businessName.toLowerCase())) {
            allRepairers.push({
              id: `suggestion_${suggestion.id}`,
              name: businessName,
              address: data?.address || '',
              city: data?.city || '',
              postal_code: data?.postal_code,
              phone: data?.phone,
              email: data?.email,
              website: data?.website,
              description: data?.description,
              services: data?.services || [],
              specialties: [],
              rating: data?.rating,
              lat: data?.lat || data?.latitude,
              lng: data?.lng || data?.longitude,
              is_verified: false,
              data_quality_score: suggestion.quality_score,
              created_at: suggestion.created_at,
              updated_at: suggestion.created_at
            });
          }
        });
      }

      setRepairers(allRepairers);
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des réparateurs:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const addRepairer = async (repairerData: Partial<RealRepairer>) => {
    try {
      const { data, error } = await supabase
        .from('repairers')
        .insert([{
          name: repairerData.name || '',
          address: repairerData.address || '',
          city: repairerData.city || '',
          postal_code: repairerData.postal_code || '',
          source: 'manual_add'
        }])
        .select()
        .single();

      if (error) throw error;

      // Recharger la liste
      await loadRepairers();
      
      return data;
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'ajout du réparateur:', err);
      throw err;
    }
  };

  const approveRepairer = async (suggestionId: string, repairerData: Partial<RealRepairer>) => {
    try {
      // Ajouter le réparateur
      const addedRepairer = await addRepairer(repairerData);
      
      // Marquer la suggestion comme approuvée
      const { error: updateError } = await supabase
        .from('scraping_suggestions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de la suggestion:', updateError);
      }

      return addedRepairer;
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'approbation:', err);
      throw err;
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('scraping_suggestions')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;

      // Recharger la liste
      await loadRepairers();
    } catch (err: any) {
      console.error('❌ Erreur lors du rejet:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadRepairers();
  }, []);

  return {
    repairers,
    loading,
    error,
    loadRepairers,
    addRepairer,
    approveRepairer,
    rejectSuggestion
  };
};