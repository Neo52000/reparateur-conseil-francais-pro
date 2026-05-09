import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withSentry } from "../_shared/sentry.ts";

async function geocodeAddress(address: string, city: string, postalCode: string): Promise<{ lat: number; lng: number } | null> {
  // Essayer plusieurs formats de requête pour améliorer la précision
  const queries = [
    // Format 1: Adresse complète avec code postal
    `${address}, ${postalCode} ${city}, France`,
    // Format 2: Juste code postal et ville (plus fiable si l'adresse est mal formatée)
    `${postalCode} ${city}, France`,
    // Format 3: Ville seule avec département
    `${city}, ${postalCode?.substring(0, 2) || ''}, France`,
  ];

  for (const queryStr of queries) {
    try {
      const query = encodeURIComponent(queryStr.replace(/\s+/g, ' ').trim());
      console.log(`🔍 Tentative géocodage: ${queryStr}`);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=fr`,
        {
          headers: {
            'User-Agent': 'TopReparateurs/1.0 (contact@topreparateurs.fr)'
          }
        }
      );
      
      if (!response.ok) {
        console.log(`⚠️ Nominatim error: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, 1100));
        continue;
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log(`✅ Trouvé: ${result.lat}, ${result.lng} pour "${queryStr}"`);
        return result;
      }
      
      // Pause avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (error) {
      console.log(`⚠️ Geocoding error for "${queryStr}":`, error);
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  
  return null;
}

serve(withSentry("geocode-repairers", async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  const limited = enforceRateLimit(req, { namespace: 'geocode-repairers', limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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
}));
