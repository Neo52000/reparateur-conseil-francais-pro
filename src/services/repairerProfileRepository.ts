
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

export const findExistingProfile = async (userId: string) => {
  const { data: existingProfile } = await supabase
    .from('repairer_profiles')
    .select('id, user_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  return existingProfile;
};

export const updateExistingProfile = async (profileId: string, supabaseData: any) => {
  const result = await supabase
    .from('repairer_profiles')
    .update(supabaseData)
    .eq('id', profileId)
    .select()
    .single();
  
  return result;
};

export const createNewProfile = async (supabaseData: any) => {
  const result = await supabase
    .from('repairer_profiles')
    .upsert(supabaseData, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();
  
  return result;
};
