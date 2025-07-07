import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { withErrorHandling, EdgeErrorHandler } from '../_shared/error-handler.ts'

const APIFY_API_BASE = 'https://api.apify.com/v2';

interface ApifyInput {
  searchTerm: string;
  location: string;
  maxResults: number;
  includeReviews?: boolean;
  includePhotos?: boolean;
  [key: string]: any;
}

serve(withErrorHandling('apify-scraping', async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { action, actorId, input, jobId } = await req.json();
  
  // Validation des paramètres
  EdgeErrorHandler.validateRequiredParams({ action }, ['action']);
  
  const apifyToken = Deno.env.get('APIFY_API_TOKEN');
  EdgeErrorHandler.validateApiKey(apifyToken, 'Apify');

  EdgeErrorHandler.logInfo(`Action demandée: ${action}`, { actorId, jobId });

  switch (action) {
    case 'start':
      EdgeErrorHandler.validateRequiredParams({ actorId, input }, ['actorId', 'input']);
      return await startApifyJob(actorId, input, apifyToken!);
    
    case 'status':
      EdgeErrorHandler.validateRequiredParams({ jobId }, ['jobId']);
      return await getJobStatus(jobId, apifyToken!);
    
    case 'results':
      EdgeErrorHandler.validateRequiredParams({ jobId }, ['jobId']);
      return await getJobResults(jobId, apifyToken!);
    
    default:
      throw new Error(`Action non supportée: ${action}`);
  }
}));

async function startApifyJob(actorId: string, input: ApifyInput, token: string): Promise<Response> {
  EdgeErrorHandler.logInfo(`Démarrage job Apify - Acteur: ${actorId}`, { input });
  
  // Adapter l'input selon l'acteur
  const adaptedInput = adaptInputForActor(actorId, input);
  EdgeErrorHandler.logDebug('Input adapté pour l\'acteur', adaptedInput);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const response = await fetch(`${APIFY_API_BASE}/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adaptedInput),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      EdgeErrorHandler.logWarning(`Erreur API Apify ${response.status}`, errorText);
      throw new Error(`Erreur Apify API (${response.status}): ${errorText}`);
    }

    const jobData = await response.json();
    EdgeErrorHandler.logInfo('Job Apify créé avec succès', { jobId: jobData.id });

    return EdgeErrorHandler.successResponse(
      { jobId: jobData.id },
      'Job Apify démarré avec succès'
    );
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout lors du démarrage du job Apify');
    }
    throw error;
  }
}

async function getJobStatus(jobId: string, token: string): Promise<Response> {
  EdgeErrorHandler.logDebug(`Récupération statut job: ${jobId}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(`${APIFY_API_BASE}/actor-runs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      EdgeErrorHandler.logWarning(`Erreur statut job ${response.status}`, errorText);
      throw new Error(`Erreur API statut job (${response.status}): ${errorText}`);
    }

    const jobData = await response.json();
    EdgeErrorHandler.logDebug('Statut job récupéré', { 
      jobId: jobData.id, 
      status: jobData.status,
      statusMessage: jobData.statusMessage 
    });
    
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

    return EdgeErrorHandler.successResponse(result, 'Statut job récupéré');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout lors de la récupération du statut job');
    }
    throw error;
  }
}

async function getJobResults(jobId: string, token: string): Promise<Response> {
  EdgeErrorHandler.logDebug(`Récupération résultats job: ${jobId}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout pour les résultats
  
  try {
    // Récupérer d'abord les infos du job pour obtenir l'ID du dataset
    const jobResponse = await fetch(`${APIFY_API_BASE}/actor-runs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal
    });

    if (!jobResponse.ok) {
      const errorText = await jobResponse.text();
      EdgeErrorHandler.logWarning(`Erreur récupération job ${jobResponse.status}`, errorText);
      throw new Error(`Erreur API récupération job (${jobResponse.status}): ${errorText}`);
    }

    const jobData = await jobResponse.json();
    const datasetId = jobData.defaultDatasetId;

    if (!datasetId) {
      EdgeErrorHandler.logWarning('Pas de dataset pour ce job', { jobId, jobStatus: jobData.status });
      return EdgeErrorHandler.successResponse({ results: [] }, 'Aucun dataset disponible pour ce job');
    }

    EdgeErrorHandler.logDebug('Dataset trouvé', { datasetId });

    // Récupérer les résultats du dataset
    const resultsResponse = await fetch(`${APIFY_API_BASE}/datasets/${datasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal
    });

    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      EdgeErrorHandler.logWarning(`Erreur récupération résultats ${resultsResponse.status}`, errorText);
      throw new Error(`Erreur API récupération résultats (${resultsResponse.status}): ${errorText}`);
    }

    const results = await resultsResponse.json();
    EdgeErrorHandler.logInfo(`Résultats récupérés avec succès`, { 
      count: results.length,
      datasetId 
    });

    clearTimeout(timeoutId);
    return EdgeErrorHandler.successResponse({ results }, `${results.length} résultats récupérés`);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout lors de la récupération des résultats');
    }
    throw error;
  }
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