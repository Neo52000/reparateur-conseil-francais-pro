import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function geocodeAddress(address: string, city: string, postalCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address || ''} ${postalCode} ${city}, France`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TopReparateurs/1.0'
        }
      }
    );
    
    if (!response.ok) {
      console.log(`⚠️ Nominatim error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.log(`⚠️ Geocoding error:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 50;

    // Récupérer les réparateurs sans coordonnées
    const { data: repairers, error: selectError } = await supabase
      .from('repairers')
      .select('id, name, address, city, postal_code')
      .is('lat', null)
      .limit(limit);

    if (selectError) {
      throw selectError;
    }

    if (!repairers || repairers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun réparateur à géocoder',
          geocoded: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗺️ Géocodage de ${repairers.length} réparateurs...`);

    let geocoded = 0;
    let failed = 0;

    for (const repairer of repairers) {
      const coords = await geocodeAddress(
        repairer.address || '',
        repairer.city || '',
        repairer.postal_code || ''
      );

      if (coords) {
        const { error: updateError } = await supabase
          .from('repairers')
          .update({ lat: coords.lat, lng: coords.lng })
          .eq('id', repairer.id);

        if (!updateError) {
          geocoded++;
          console.log(`📍 ${repairer.name}: ${coords.lat}, ${coords.lng}`);
        } else {
          failed++;
          console.log(`⚠️ Erreur update ${repairer.name}:`, updateError.message);
        }
      } else {
        failed++;
        console.log(`⚠️ Pas de coordonnées pour ${repairer.name}`);
      }

      // Pause pour respecter le rate limit de Nominatim (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    console.log(`✅ Terminé: ${geocoded} géocodés, ${failed} échecs`);

    return new Response(
      JSON.stringify({
        success: true,
        geocoded,
        failed,
        remaining: repairers.length - geocoded - failed,
        message: `${geocoded} réparateurs géocodés`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
