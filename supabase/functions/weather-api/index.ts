import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint = 'forecast' } = await req.json();
    const meteoApiKey = Deno.env.get('METEO_CONCEPT_API_KEY');
    
    if (!meteoApiKey) {
      throw new Error('METEO_CONCEPT_API_KEY not configured');
    }

    // Coordinates for Chaumont
    const lat = '48.1126';
    const lng = '5.1441';
    const insee = '52121';
    
    let apiUrl = '';
    
    switch (endpoint) {
      case 'current':
        apiUrl = `https://api.meteo-concept.com/api/observation/daily/0?latitude=${lat}&longitude=${lng}&insee=${insee}`;
        break;
      case 'forecast':
        apiUrl = `https://api.meteo-concept.com/api/forecast/daily/0/periods?latlng=${lat}%2C${lng}&insee=${insee}&world=false`;
        break;
      case 'hourly':
        apiUrl = `https://api.meteo-concept.com/api/forecast/hourly/0/periods?latlng=${lat}%2C${lng}&insee=${insee}&world=false`;
        break;
      case 'weekly':
        apiUrl = `https://api.meteo-concept.com/api/forecast/daily?latlng=${lat}%2C${lng}&insee=${insee}&world=false`;
        break;
      case 'alerts':
        apiUrl = `https://api.meteo-concept.com/api/vigilance?insee=${insee}`;
        break;
      default:
        throw new Error('Invalid endpoint');
    }

    console.log(`Calling Meteo Concept API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': meteoApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Weather data retrieved successfully');

    return new Response(JSON.stringify({
      success: true,
      data,
      station_id: '79e78da1-448e-4c43-84c7-e36b9cb317c4',
      location: 'Chaumont'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});