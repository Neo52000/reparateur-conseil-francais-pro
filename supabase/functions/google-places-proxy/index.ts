import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, placeId, apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Google Places Proxy - Action: ${action}`);

    if (action === 'textSearch') {
      // Text Search API
      const url = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      console.log(`📍 Text Search: ${query}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ Text Search results: ${data.results?.length || 0} places found`);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'placeDetails') {
      // Place Details API
      const url = `${GOOGLE_PLACES_API}/details/json?place_id=${placeId}&fields=formatted_address,formatted_phone_number,name,rating,user_ratings_total,website&key=${apiKey}`;
      console.log(`📍 Place Details: ${placeId}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ Place Details: ${data.result?.name || 'N/A'}`);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use textSearch or placeDetails' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
