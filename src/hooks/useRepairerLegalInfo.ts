import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RepairerLegalInfo {
  repairer_id: string;
  siret: string;
  siren?: string;
  tva_number?: string;
  invoice_prefix?: string;
  next_invoice_number?: number;
  company_name?: string;
  legal_address?: string;
}

export function useRepairerLegalInfo(repairerId: string | undefined) {
  return useQuery({
    queryKey: ['repairer-legal-info', repairerId],
    queryFn: async () => {
      if (!repairerId) return null;

      const { data, error } = await supabase
        .from('repairer_legal_info')
        .select('*')
        .eq('repairer_id', repairerId)
        .maybeSingle();

      if (error) throw error;
      
      // Si on a un SIRET, extraire le SIREN (9 premiers chiffres)
      if (data?.siret) {
        const siren = data.siret.substring(0, 9);
        return { ...data, siren } as RepairerLegalInfo;
      }
      
      return data as RepairerLegalInfo;
    },
    enabled: !!repairerId,
  });
}
