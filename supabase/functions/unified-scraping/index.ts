import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnifiedScrapingOptions {
  searchTerm: string;
  location: string;
  sources: string[];
  maxResults?: number;
  enableAI?: boolean;
  enableGeocoding?: boolean;
  categoryId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Unified Scraping Service - Début');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const options: UnifiedScrapingOptions = await req.json();
    console.log('📋 Options reçues:', options);

    const startTime = Date.now();
    const stats = {
      totalFound: 0,
      totalProcessed: 0,
      totalInserted: 0,
      sourceBreakdown: {} as Record<string, number>,
      processingTime: 0,
      errors: [] as string[]
    };

    // Phase 1: Collecte depuis toutes les sources
    const allResults = await collectFromAllSources(supabase, options, stats);
    stats.totalFound = allResults.length;

    if (allResults.length === 0) {
      console.warn('⚠️ Aucun résultat trouvé');
      return new Response(JSON.stringify({
        success: true,
        stats,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Phase 2: Traitement et nettoyage
    const processedResults = await processWithPipelines(allResults);
    stats.totalProcessed = processedResults.length;

    // Phase 3: Intégration en base
    if (options.categoryId && processedResults.length > 0) {
      const insertedCount = await integrateToDatabase(supabase, processedResults, options.categoryId);
      stats.totalInserted = insertedCount;
    }

    stats.processingTime = Date.now() - startTime;
    console.log('✅ Unified Scraping terminé:', stats);

    return new Response(JSON.stringify({
      success: true,
      stats,
      results: processedResults.slice(0, 50) // Retourner un échantillon pour la preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur Unified Scraping:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectFromAllSources(supabase: any, options: UnifiedScrapingOptions, stats: any) {
  const allResults: any[] = [];
  const maxResultsPerSource = Math.ceil((options.maxResults || 50) / options.sources.length);

  for (const source of options.sources) {
    try {
      console.log(`📡 Collecte depuis: ${source}`);
      let sourceResults: any[] = [];

      switch (source) {
        case 'google_maps':
          sourceResults = await collectFromGoogleMaps(options, maxResultsPerSource);
          break;
        case 'serper':
          sourceResults = await collectFromSerper(supabase, options, maxResultsPerSource);
          break;
        case 'multi_ai':
          sourceResults = await collectFromMultiAI(supabase, options, maxResultsPerSource);
          break;
      }

      stats.sourceBreakdown[source] = sourceResults.length;
      allResults.push(...sourceResults);
      console.log(`✅ ${source}: ${sourceResults.length} résultats`);

    } catch (error) {
      console.error(`❌ Erreur source ${source}:`, error);
      stats.errors.push(`${source}: ${error.message}`);
      stats.sourceBreakdown[source] = 0;
    }
  }

  return allResults;
}

async function collectFromSerper(supabase: any, options: UnifiedScrapingOptions, maxResults: number) {
  const query = `${options.searchTerm} ${options.location}`;
  
  const { data, error } = await supabase.functions.invoke('serper-search', {
    body: {
      query,
      type: 'search',
      location: options.location,
      num: maxResults
    }
  });

  if (error) throw new Error(`Serper error: ${error.message}`);

  return (data.results || []).map((result: any) => ({
    name: result.title || '',
    address: extractAddressFromSnippet(result.snippet || ''),
    city: options.location,
    postal_code: '00000',
    website: result.link,
    description: result.snippet,
    source: 'serper'
  }));
}

async function collectFromMultiAI(supabase: any, options: UnifiedScrapingOptions, maxResults: number) {
  const { data, error } = await supabase.functions.invoke('multi-ai-pipeline', {
    body: {
      searchTerm: options.searchTerm,
      location: options.location,
      maxResults,
      testMode: false
    }
  });

  if (error) throw new Error(`Multi-AI error: ${error.message}`);
  return data.results || [];
}

async function collectFromGoogleMaps(options: UnifiedScrapingOptions, maxResults: number) {
  // Simulation - dans un vrai environnement, on utiliserait Playwright ici
  console.log('🗺️ Google Maps collecte (simulé)');
  return [];
}

function extractAddressFromSnippet(snippet: string): string {
  const addressPatterns = [
    /(\d+[\w\s,.-]+(?:\d{5})?[^.!?]*)/,
    /([A-Z][a-z\s]+(?:\d+[^.!?]*)?)/
  ];

  for (const pattern of addressPatterns) {
    const match = snippet.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }
  return '';
}

async function processWithPipelines(items: any[]) {
  console.log('🔄 Application des pipelines de traitement...');
  
  const processed: any[] = [];
  const seenFingerprints = new Set<string>();

  for (const item of items) {
    try {
      // Pipeline 1: Nettoyage
      const cleaned = cleanItem(item);
      
      // Pipeline 2: Filtrage des doublons
      const fingerprint = generateFingerprint(cleaned);
      if (seenFingerprints.has(fingerprint)) {
        continue; // Skip doublon
      }
      seenFingerprints.add(fingerprint);
      
      // Pipeline 3: Enrichissement
      const enriched = await enrichItem(cleaned);
      
      processed.push(enriched);
      
    } catch (error) {
      console.warn('Erreur traitement item:', error);
    }
  }

  console.log(`✨ ${processed.length} éléments traités`);
  return processed;
}

function cleanItem(item: any) {
  return {
    ...item,
    name: cleanText(item.name),
    address: cleanText(item.address),
    phone: cleanPhone(item.phone),
    email: cleanEmail(item.email),
    website: cleanWebsite(item.website)
  };
}

function cleanText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ').substring(0, 200);
}

function cleanPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d\+]/g, '');
  return cleaned.match(/^(\+33|0)[1-9]\d{8}$/) ? cleaned : '';
}

function cleanEmail(email: string): string {
  if (!email) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase()) ? email.toLowerCase() : '';
}

function cleanWebsite(website: string): string {
  if (!website) return '';
  try {
    const url = new URL(website);
    return url.toString();
  } catch {
    if (website.includes('.') && !website.includes(' ')) {
      return `https://${website}`;
    }
    return '';
  }
}

function generateFingerprint(item: any): string {
  const name = item.name?.toLowerCase().replace(/\s/g, '') || '';
  const address = item.address?.toLowerCase().replace(/\s/g, '') || '';
  const phone = item.phone?.replace(/[^\d]/g, '') || '';
  return `${name}:${address}:${phone}`;
}

async function enrichItem(item: any) {
  // Géocodage simple si pas de coordonnées
  if (!item.lat && !item.lng && item.address) {
    const geoData = await geocodeAddress(item);
    if (geoData.lat && geoData.lng) {
      item.lat = geoData.lat;
      item.lng = geoData.lng;
    }
  }
  
  // Score de qualité
  item.quality_score = calculateQualityScore(item);
  
  return item;
}

async function geocodeAddress(item: any) {
  try {
    const fullAddress = `${item.address}, ${item.city || ''}, France`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    );
    
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.warn('Erreur géocodage:', error);
  }
  return {};
}

function calculateQualityScore(item: any): number {
  let score = 0;
  if (item.name && item.name.length > 3) score += 25;
  if (item.address && item.address.length > 5) score += 20;
  if (item.phone) score += 15;
  if (item.email) score += 15;
  if (item.website) score += 15;
  if (item.lat && item.lng) score += 10;
  return Math.min(100, score);
}

async function integrateToDatabase(supabase: any, results: any[], categoryId: string) {
  console.log(`💾 Intégration de ${results.length} résultats...`);
  
  let insertedCount = 0;
  const batchSize = 25;

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    
    try {
      const processedBatch = batch.map(result => ({
        ...result,
        business_category_id: categoryId,
        unique_id: generateUniqueId(result.name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: false,
        data_quality_score: result.quality_score || 0
      }));

      const { data, error } = await supabase
        .from('repairers')
        .insert(processedBatch)
        .select('id');

      if (error) {
        console.error(`Erreur insertion lot ${i}:`, error);
        continue;
      }

      insertedCount += data?.length || 0;
      console.log(`✅ Lot ${i + 1}-${i + batchSize}: ${data?.length || 0} éléments`);

    } catch (error) {
      console.error(`Erreur lot ${i}:`, error);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return insertedCount;
}

function generateUniqueId(name: string): string {
  const timestamp = Date.now();
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  const random = Math.random().toString(36).substring(2, 4);
  return `UNI_${nameSlug}_${timestamp}_${random}`;
}