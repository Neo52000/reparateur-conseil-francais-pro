import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place";
const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    
    console.log(`🔍 Proxy - Action: ${action}`);

    // ==================== FIRECRAWL ACTIONS ====================
    if (action === 'firecrawlSearch') {
      const { query, options } = body;
      
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
      if (!apiKey) {
        console.error('FIRECRAWL_API_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please enable the Firecrawl connector in Settings.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('🔥 Firecrawl Search:', query);

      const response = await fetch(`${FIRECRAWL_API}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: options?.limit || 10,
          lang: options?.lang || 'fr',
          country: options?.country || 'FR',
          scrapeOptions: options?.scrapeOptions || { formats: ['markdown'] },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Firecrawl API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Firecrawl Search successful, found', data.data?.length || 0, 'results');
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'firecrawlScrape') {
      const { url, options } = body;
      
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
      if (!apiKey) {
        console.error('FIRECRAWL_API_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please enable the Firecrawl connector in Settings.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Format URL
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      console.log('🔥 Firecrawl Scrape:', formattedUrl);

      const response = await fetch(`${FIRECRAWL_API}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: options?.formats || ['markdown'],
          onlyMainContent: options?.onlyMainContent ?? true,
          waitFor: options?.waitFor,
          location: options?.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Firecrawl API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Firecrawl Scrape successful');
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== GOOGLE PLACES ACTIONS ====================
    const { query, placeId, apiKey } = body;
    
    if (!apiKey && (action === 'textSearch' || action === 'placeDetails')) {
      return new Response(
        JSON.stringify({ error: 'API key is required for Google Places' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      JSON.stringify({ error: 'Invalid action. Use textSearch, placeDetails, firecrawlSearch, or firecrawlScrape' }),
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
