
import { useState, useEffect } from 'react';
import { Repairer } from '@/types/repairer';
import { useDemoMode } from '@/hooks/useDemoMode';
import { DemoDataService } from '@/services/demoDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour gérer les réparateurs avec prise en compte du mode démo
 */
export const useRepairersWithDemo = () => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(false);
  const { demoModeEnabled } = useDemoMode();
  const { toast } = useToast();

  const fetchRepairers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des réparateurs - Mode démo:', demoModeEnabled);
      
      // Récupérer les données réelles
      const { data: realData, error } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des réparateurs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les réparateurs',
          variant: 'destructive',
        });
        return;
      }

      console.log('📊 Données réelles récupérées:', realData?.length || 0);

      // Transformer les données de la base pour correspondre au type Repairer
      const transformedRealData: Repairer[] = (realData || []).map(item => ({
        ...item,
        business_status: item.business_status || 'active',
        pappers_verified: item.pappers_verified || false,
        price_range: (['low', 'medium', 'high'].includes(item.price_range)) 
          ? item.price_range as 'low' | 'medium' | 'high'
          : 'medium',
        department: item.department || '',
        region: item.region || '',
        phone: item.phone || undefined,
        website: item.website || undefined,
        email: item.email || undefined,
        opening_hours: item.opening_hours ? 
          (typeof item.opening_hours === 'object' ? item.opening_hours as Record<string, string> : null) : 
          null,
        services: item.services || [],
        specialties: item.specialties || [],
        source: (['pages_jaunes', 'google_places', 'manual', 'demo'].includes(item.source)) 
          ? item.source as 'pages_jaunes' | 'google_places' | 'manual' | 'demo'
          : 'manual'
      }));

      // CORRECTION : Appliquer correctement la logique du mode démo
      let finalData: Repairer[];
      
      if (demoModeEnabled) {
        // Mode démo activé : données réelles (sans démo) + nouvelles données démo
        const demoData = DemoDataService.getDemoRepairers();
        finalData = DemoDataService.combineWithDemoData(
          transformedRealData,
          demoData,
          true
        );
      } else {
        // Mode démo désactivé : UNIQUEMENT données réelles (filtrer toute donnée de démo)
        finalData = transformedRealData.filter(item => item.source !== 'demo');
      }

      console.log('✅ Données finales:', finalData.length, 'réparateurs');
      setRepairers(finalData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réparateurs:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand le mode démo change
  useEffect(() => {
    console.log('🔄 Mode démo changé:', demoModeEnabled, '- Rechargement des données');
    fetchRepairers();
  }, [demoModeEnabled]);

  return {
    repairers,
    loading,
    refetch: fetchRepairers
  };
};
