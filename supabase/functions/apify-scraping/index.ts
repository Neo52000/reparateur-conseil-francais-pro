import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const APIFY_API_BASE = 'https://api.apify.com/v2';

interface ApifyInput {
  searchTerm: string;
  location: string;
  maxResults: number;
  includeReviews?: boolean;
  includePhotos?: boolean;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, actorId, input, jobId } = await req.json();
    const apifyToken = Deno.env.get('APIFY_API_TOKEN');

    if (!apifyToken) {
      console.error('❌ Clé API Apify manquante');
      return new Response(
        JSON.stringify({ 
          error: 'Clé API Apify non configurée. Veuillez l\'ajouter dans les secrets Supabase.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🎯 Action Apify: ${action}`);

    switch (action) {
      case 'start':
        return await startApifyJob(actorId, input, apifyToken);
      
      case 'status':
        return await getJobStatus(jobId, apifyToken);
      
      case 'results':
        return await getJobResults(jobId, apifyToken);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action non supportée' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('❌ Erreur Apify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function startApifyJob(actorId: string, input: ApifyInput, token: string): Promise<Response> {
  console.log(`🚀 Démarrage job Apify - Acteur: ${actorId}`);
  
  // Adapter l'input selon l'acteur
  const adaptedInput = adaptInputForActor(actorId, input);
  
  const response = await fetch(`${APIFY_API_BASE}/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adaptedInput),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Erreur démarrage job:', error);
    throw new Error(`Erreur Apify: ${response.status} - ${error}`);
  }

  const jobData = await response.json();
  console.log('✅ Job Apify créé:', jobData.id);

  return new Response(
    JSON.stringify({ jobId: jobData.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJobStatus(jobId: string, token: string): Promise<Response> {
  const response = await fetch(`${APIFY_API_BASE}/actor-runs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur statut job: ${response.status} - ${error}`);
  }

  const jobData = await response.json();
  
  const result = {
    id: jobData.id,
    status: jobData.status,
    data: [],
    usage: {
      computeUnits: jobData.usage?.COMPUTE_UNITS || 0,
      datasetWrites: jobData.usage?.DATASET_WRITES || 0,
      proxyUsage: jobData.usage?.PROXY_RESIDENTIAL_TRANSFER_BYTES || 0,
    },
    error: jobData.statusMessage
  };

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJobResults(jobId: string, token: string): Promise<Response> {
  // Récupérer d'abord les infos du job pour obtenir l'ID du dataset
  const jobResponse = await fetch(`${APIFY_API_BASE}/actor-runs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!jobResponse.ok) {
    const error = await jobResponse.text();
    throw new Error(`Erreur récupération job: ${jobResponse.status} - ${error}`);
  }

  const jobData = await jobResponse.json();
  const datasetId = jobData.defaultDatasetId;

  if (!datasetId) {
    console.log('⚠️ Pas de dataset pour ce job');
    return new Response(
      JSON.stringify({ results: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Récupérer les résultats du dataset
  const resultsResponse = await fetch(`${APIFY_API_BASE}/datasets/${datasetId}/items`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!resultsResponse.ok) {
    const error = await resultsResponse.text();
    throw new Error(`Erreur récupération résultats: ${resultsResponse.status} - ${error}`);
  }

  const results = await resultsResponse.json();
  console.log(`✅ Récupéré ${results.length} résultats du dataset`);

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function adaptInputForActor(actorId: string, input: ApifyInput): any {
  const baseInput = {
    searchStringsArray: [`${input.searchTerm} ${input.location}`],
    locationQuery: input.location,
    maxCrawledPlaces: input.maxResults,
    language: 'fr',
    countryCode: 'FR',
  };

  // Adaptations spécifiques par acteur
  switch (actorId) {
    case 'compass/google-maps-scraper':
      return {
        ...baseInput,
        includeHistogram: false,
        includeOpeningHours: true,
        includePeopleAlsoSearch: false,
        maxReviews: input.includeReviews ? 10 : 0,
        maxImages: input.includePhotos ? 5 : 0,
        exportPlaceUrls: false,
        additionalInfo: false,
        reviewsSort: 'newest',
      };

    case 'drobnikj/pages-jaunes-scraper':
      return {
        query: input.searchTerm,
        location: input.location,
        maxResults: input.maxResults,
        includeDetails: true,
      };

    case 'compass/yelp-scraper':
      return {
        ...baseInput,
        searchTerm: input.searchTerm,
        locationQuery: input.location,
        maxResults: input.maxResults,
        includeReviews: input.includeReviews,
        includePhotos: input.includePhotos,
      };

    default:
      return baseInput;
  }
}