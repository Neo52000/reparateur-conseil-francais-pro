import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  log_id: string;
  selected_ids: number[]; // indices des résultats à insérer
  results: any[]; // résultats du scraping
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { log_id, selected_ids, results }: ValidateRequest = await req.json();

    console.log(`✅ Validation de ${selected_ids.length} réparateurs sur ${results.length}`);

    // Filtrer les résultats sélectionnés
    const selectedResults = selected_ids.map(id => results[id]).filter(Boolean);

    let itemsAdded = 0;
    let itemsUpdated = 0;

    for (const repairer of selectedResults) {
      // Vérifier si le réparateur existe déjà (par nom et code postal)
      const { data: existing } = await supabase
        .from('repairers')
        .select('id')
        .eq('name', repairer.name)
        .eq('postal_code', repairer.postal_code)
        .single();

      if (existing) {
        // Mettre à jour
        const { error: updateError } = await supabase
          .from('repairers')
          .update({
            address: repairer.address,
            city: repairer.city,
            phone: repairer.phone,
            email: repairer.email,
            website: repairer.website,
            logo_url: repairer.logo_url,
            latitude: repairer.latitude,
            longitude: repairer.longitude,
            description: repairer.description,
            services: repairer.services,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (!updateError) itemsUpdated++;
      } else {
        // Insérer nouveau
        const { error: insertError } = await supabase
          .from('repairers')
          .insert({
            name: repairer.name,
            address: repairer.address,
            city: repairer.city,
            postal_code: repairer.postal_code,
            phone: repairer.phone,
            email: repairer.email,
            website: repairer.website,
            logo_url: repairer.logo_url,
            latitude: repairer.latitude,
            longitude: repairer.longitude,
            description: repairer.description,
            services: repairer.services,
            source: repairer.source,
            is_verified: false,
            is_active: true,
          });

        if (!insertError) itemsAdded++;
      }
    }

    // Mettre à jour le log
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        completed_at: new Date().toISOString(),
      })
      .eq('id', log_id);

    console.log(`📊 Résultat: ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        message: `${itemsAdded} réparateurs ajoutés, ${itemsUpdated} mis à jour`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erreur validation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
