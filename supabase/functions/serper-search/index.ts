import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SerperSearchParams {
  query: string;
  type?: string;
  location?: string;
  country?: string;
  lang?: string;
  num?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY not configured');
    }

    const { query, type = 'search', location, country = 'fr', lang = 'fr', num = 10 }: SerperSearchParams = await req.json();

    if (!query) {
      throw new Error('Query parameter is required');
    }

    console.log('🔍 Serper search request:', { query, type, location, country, lang, num });

    // Préparer les paramètres de la requête Serper
    const searchParams: any = {
      q: query,
      gl: country,
      hl: lang,
      num: Math.min(num, 100) // Limite Serper
    };

    // Ajouter la localisation si fournie
    if (location) {
      searchParams.location = location;
    }

    // Déterminer l'endpoint en fonction du type de recherche
    let endpoint = 'https://google.serper.dev/search';
    switch (type) {
      case 'images':
        endpoint = 'https://google.serper.dev/images';
        break;
      case 'news':
        endpoint = 'https://google.serper.dev/news';
        break;
      case 'shopping':
        endpoint = 'https://google.serper.dev/shopping';
        break;
      case 'videos':
        endpoint = 'https://google.serper.dev/videos';
        break;
      case 'places':
        endpoint = 'https://google.serper.dev/places';
        break;
      default:
        endpoint = 'https://google.serper.dev/search';
    }

    console.log('📡 Calling Serper API:', { endpoint, searchParams });

    // Appel à l'API Serper
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Serper API error:', response.status, errorText);
      throw new Error(`Serper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Serper API response received:', { resultsCount: data.organic?.length || 0 });

    // Traitement des résultats selon le type de recherche
    let processedResults = [];

    switch (type) {
      case 'images':
        processedResults = (data.images || []).map((item: any, index: number) => ({
          position: index + 1,
          title: item.title || 'Sans titre',
          link: item.link || item.imageUrl,
          snippet: item.source || '',
          thumbnail: item.imageUrl,
          date: item.date
        }));
        break;

      case 'news':
        processedResults = (data.news || []).map((item: any, index: number) => ({
          position: index + 1,
          title: item.title || 'Sans titre',
          link: item.link,
          snippet: item.snippet || '',
          date: item.date,
          thumbnail: item.imageUrl
        }));
        break;

      case 'shopping':
        processedResults = (data.shopping || []).map((item: any, index: number) => ({
          position: index + 1,
          title: item.title || 'Sans titre',
          link: item.link,
          snippet: `Prix: ${item.price || 'N/A'} - ${item.source || ''}`,
          thumbnail: item.imageUrl,
          price: item.price
        }));
        break;

      case 'videos':
        processedResults = (data.videos || []).map((item: any, index: number) => ({
          position: index + 1,
          title: item.title || 'Sans titre',
          link: item.link,
          snippet: item.snippet || '',
          date: item.date,
          thumbnail: item.imageUrl,
          duration: item.duration
        }));
        break;

      case 'places':
        processedResults = (data.places || []).map((item: any, index: number) => ({
          position: index + 1,
          title: item.title || 'Sans titre',
          link: item.link || '#',
          snippet: `${item.address || ''} - Rating: ${item.rating || 'N/A'}`,
          address: item.address,
          rating: item.rating,
          phone: item.phoneNumber
        }));
        break;

      default: // search
        processedResults = (data.organic || []).map((item: any, index: number) => ({
          position: item.position || index + 1,
          title: item.title || 'Sans titre',
          link: item.link,
          snippet: item.snippet || '',
          date: item.date
        }));
    }

    console.log('🔄 Processed results:', processedResults.length);

    // Log de l'activité pour audit
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('analytics_events').insert({
          event_type: 'serper_search',
          event_data: {
            query,
            type,
            location,
            country,
            lang,
            results_count: processedResults.length
          }
        });
      } catch (logError) {
        console.warn('⚠️ Failed to log analytics event:', logError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results: processedResults,
      metadata: {
        query,
        type,
        total_results: processedResults.length,
        search_information: data.searchInformation
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Serper search error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});