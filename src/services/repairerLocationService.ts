
import { supabase } from '@/integrations/supabase/client';
import { RepairerProfile } from '@/types/repairerProfile';

export const updateRepairerLocation = async (formData: RepairerProfile) => {
  if (!formData.geo_lat || !formData.geo_lng) {
    return;
  }

  console.log('Updating repairer coordinates:', {
    lat: formData.geo_lat,
    lng: formData.geo_lng
  });

  // Chercher le réparateur correspondant dans la table repairers
  const { data: existingRepairer } = await supabase
    .from('repairers')
    .select('id')
    .eq('email', formData.email)
    .maybeSingle();

  if (existingRepairer) {
    await supabase
      .from('repairers')
      .update({
        lat: formData.geo_lat,
        lng: formData.geo_lng,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code
      })
      .eq('id', existingRepairer.id);
  }
};
