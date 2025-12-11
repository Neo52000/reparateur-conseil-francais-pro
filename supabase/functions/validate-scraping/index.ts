import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  log_id?: string;
  selected_ids: number[];
  results: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { log_id, selected_ids, results }: ValidateRequest = body;

    console.log('📥 Requête reçue:', {
      log_id: log_id || 'non fourni',
      selected_ids_count: selected_ids?.length || 0,
      results_count: results?.length || 0
    });

    if (!selected_ids || selected_ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucun réparateur sélectionné' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucun résultat fourni' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filtrer les résultats sélectionnés
    const selectedResults = selected_ids
      .map(id => results[id])
      .filter(Boolean);

    console.log(`✅ Validation de ${selectedResults.length} réparateurs`);

    let itemsAdded = 0;
    let itemsUpdated = 0;
    const errors: string[] = [];

    for (const repairer of selectedResults) {
      try {
        // Validation des données minimales
        if (!repairer.name || !repairer.postal_code) {
          console.log(`⚠️ Données incomplètes pour: ${repairer.name || 'inconnu'}`);
          errors.push(`Données incomplètes: ${repairer.name || 'inconnu'}`);
          continue;
        }

        // Vérifier si le réparateur existe déjà (par nom et code postal)
        const { data: existing, error: selectError } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', repairer.name.trim())
          .eq('postal_code', repairer.postal_code.trim())
          .maybeSingle();

        if (selectError) {
          console.log(`⚠️ Erreur SELECT pour ${repairer.name}:`, selectError.message);
          errors.push(`Erreur recherche: ${repairer.name}`);
          continue;
        }

        if (existing) {
          // Mettre à jour
          const { error: updateError } = await supabase
            .from('repairers')
            .update({
              address: repairer.address || null,
              city: repairer.city || null,
              phone: repairer.phone || null,
              email: repairer.email || null,
              website: repairer.website || null,
              logo_url: repairer.logo_url || null,
              latitude: repairer.latitude || null,
              longitude: repairer.longitude || null,
              description: repairer.description || null,
              services: repairer.services || [],
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            console.log(`⚠️ Erreur UPDATE pour ${repairer.name}:`, updateError.message);
            errors.push(`Erreur mise à jour: ${repairer.name}`);
          } else {
            itemsUpdated++;
            console.log(`🔄 Mis à jour: ${repairer.name}`);
          }
        } else {
          // Insérer nouveau
          const { error: insertError } = await supabase
            .from('repairers')
            .insert({
              name: repairer.name.trim(),
              address: repairer.address || null,
              city: repairer.city || null,
              postal_code: repairer.postal_code.trim(),
              phone: repairer.phone || null,
              email: repairer.email || null,
              website: repairer.website || null,
              logo_url: repairer.logo_url || null,
              latitude: repairer.latitude || null,
              longitude: repairer.longitude || null,
              description: repairer.description || null,
              services: repairer.services || [],
              source: repairer.source || 'ai_scraping',
              is_verified: false,
              is_active: true,
            });

          if (insertError) {
            console.log(`⚠️ Erreur INSERT pour ${repairer.name}:`, insertError.message);
            errors.push(`Erreur insertion: ${repairer.name} - ${insertError.message}`);
          } else {
            itemsAdded++;
            console.log(`✨ Ajouté: ${repairer.name}`);
          }
        }
      } catch (repairerError: any) {
        console.log(`⚠️ Exception pour ${repairer?.name}:`, repairerError.message);
        errors.push(`Exception: ${repairer?.name || 'inconnu'}`);
      }
    }

    // Mettre à jour le log si fourni
    if (log_id) {
      await supabase
        .from('scraping_logs')
        .update({
          status: 'completed',
          items_added: itemsAdded,
          items_updated: itemsUpdated,
          completed_at: new Date().toISOString(),
        })
        .eq('id', log_id);
    }

    console.log(`📊 Résultat final: ${itemsAdded} ajoutés, ${itemsUpdated} mis à jour, ${errors.length} erreurs`);

    return new Response(
      JSON.stringify({
        success: true,
        items_added: itemsAdded,
        items_updated: itemsUpdated,
        errors: errors.length > 0 ? errors : undefined,
        message: `${itemsAdded} réparateurs ajoutés, ${itemsUpdated} mis à jour`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
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
