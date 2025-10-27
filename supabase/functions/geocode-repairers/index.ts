import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { repairerId, address, city, postalCode, forceUpdate = false } = await req.json();

    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!MAPBOX_TOKEN) {
      throw new Error('Token Mapbox non configuré (MAPBOX_PUBLIC_TOKEN)');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let repairersToGeocode = [];

    if (repairerId) {
      // Géocoder un réparateur spécifique
      const { data: repairer, error } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .single();

      if (error) throw error;
      if (!repairer) throw new Error('Réparateur non trouvé');

      repairersToGeocode = [repairer];
    } else {
      // Géocoder tous les réparateurs sans coordonnées
      const query = supabase
        .from('repairers')
        .select('*');

      if (!forceUpdate) {
        query.is('latitude', null).is('longitude', null);
      }

      const { data: repairers, error } = await query;

      if (error) throw error;
      repairersToGeocode = repairers || [];
    }

    console.log(`🗺️ Géocodage de ${repairersToGeocode.length} réparateurs...`);

    const results = [];

    for (const repairer of repairersToGeocode) {
      try {
        // Construire l'adresse complète
        const fullAddress = address || 
          [repairer.address, repairer.postal_code, repairer.city]
            .filter(Boolean)
            .join(', ');

        if (!fullAddress || fullAddress.length < 5) {
          throw new Error('Adresse insuffisante pour le géocodage');
        }

        // Appel à l'API Mapbox Geocoding
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&country=FR&limit=1`;
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Erreur Mapbox API: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
          throw new Error('Aucune coordonnée trouvée pour cette adresse');
        }

        const [longitude, latitude] = data.features[0].center;

        // Mettre à jour le réparateur avec les coordonnées
        const { error: updateError } = await supabase
          .from('repairers')
          .update({
            latitude,
            longitude,
            geocoded_at: new Date().toISOString()
          })
          .eq('id', repairer.id);

        if (updateError) throw updateError;

        results.push({
          repairerId: repairer.id,
          name: repairer.name,
          success: true,
          latitude,
          longitude
        });

        console.log(`✅ ${repairer.name}: ${latitude}, ${longitude}`);

        // Rate limiting : 600 requêtes/min pour Mapbox = 1 req / 100ms
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Erreur géocodage ${repairer.name}:`, error);
        results.push({
          repairerId: repairer.id,
          name: repairer.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📊 Géocodage terminé: ${successCount} succès, ${failureCount} échecs`);

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: repairersToGeocode.length,
        success: successCount,
        failure: failureCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur geocode-repairers:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
