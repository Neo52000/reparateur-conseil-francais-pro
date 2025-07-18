import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { AddressExtractor } from '../_shared/address-extractor.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { withErrorHandling, EdgeErrorHandler } from '../_shared/error-handler.ts';

interface UnifiedScrapingOptions {
  searchTerm: string;
  location: string;
  sources: string[];
  maxResults?: number;
  enableAI?: boolean;
  enableGeocoding?: boolean;
  categoryId?: string;
  previewMode?: boolean;
  providedResults?: any[];
}

serve(withErrorHandling('unified-scraping', async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  EdgeErrorHandler.logInfo('🚀 Unified Scraping Service - Début');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Initialiser l'extracteur d'adresses
  const addressExtractor = new AddressExtractor();

  const options: UnifiedScrapingOptions = await req.json();
  EdgeErrorHandler.logInfo('📋 Options reçues:', options);

  // Validation des paramètres
  EdgeErrorHandler.validateRequiredParams(options, ['searchTerm', 'location']);

  const startTime = Date.now();
  const stats = {
    totalFound: 0,
    totalProcessed: 0,
    totalInserted: 0,
    sourceBreakdown: {} as Record<string, number>,
    processingTime: 0,
    errors: [] as string[]
  };

  let allResults: any[] = [];
  
  // Phase 1: Collecte depuis toutes les sources OU utilisation des résultats fournis
  if (options.providedResults && options.providedResults.length > 0) {
    EdgeErrorHandler.logInfo('📦 Utilisation des résultats fournis:', options.providedResults.length);
    allResults = options.providedResults;
    stats.totalFound = allResults.length;
  } else {
    allResults = await collectFromAllSources(supabase, options, stats);
    stats.totalFound = allResults.length;
  }

  if (allResults.length === 0) {
    EdgeErrorHandler.logWarning('⚠️ Aucun résultat trouvé');
    return EdgeErrorHandler.successResponse({
      success: true,
      stats,
      results: []
    }, 'Aucun résultat trouvé');
  }

  // Phase 2: Traitement et nettoyage avec extraction d'adresses améliorée
  const processedResults = await processWithPipelines(allResults, addressExtractor);
  stats.totalProcessed = processedResults.length;

  // Phase 3: Intégration en base (seulement si pas en mode preview)
  if (!options.previewMode && options.categoryId && processedResults.length > 0) {
    const insertedCount = await integrateToDatabase(supabase, processedResults, options.categoryId);
    stats.totalInserted = insertedCount;
  } else if (options.previewMode) {
    EdgeErrorHandler.logInfo('🔍 Mode preview - Pas d\'intégration en base');
  }

  stats.processingTime = Date.now() - startTime;
  EdgeErrorHandler.logInfo('✅ Unified Scraping terminé:', stats);

  return EdgeErrorHandler.successResponse({
    success: true,
    stats,
    results: processedResults.slice(0, 50) // Retourner un échantillon pour la preview
  }, 'Unified scraping terminé avec succès');
}));

async function collectFromAllSources(supabase: any, options: UnifiedScrapingOptions, stats: any) {
  const allResults: any[] = [];
  const maxResultsPerSource = Math.ceil((options.maxResults || 50) / options.sources.length);

  for (const source of options.sources) {
    try {
      EdgeErrorHandler.logInfo(`📡 Collecte depuis: ${source}`);
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
      EdgeErrorHandler.logInfo(`✅ ${source}: ${sourceResults.length} résultats`);

    } catch (error) {
      EdgeErrorHandler.logWarning(`❌ Erreur source ${source}:`, error);
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

  return (data.results || []).map((result: any) => {
    // Utiliser l'extracteur d'adresses amélioré
    const addressExtractor = new AddressExtractor();
    const addressResult = addressExtractor.getBestAddress(result);
    
    return {
      name: result.title || '',
      address: addressResult.address || options.location,
      city: options.location,
      postal_code: '00000',
      website: result.link,
      description: result.snippet,
      source: 'serper',
      address_confidence: addressResult.confidence,
      address_extraction_source: addressResult.source
    };
  });
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

// L'ancienne fonction extractAddressFromSnippet est remplacée par AddressExtractor
// qui offre une extraction beaucoup plus robuste et multi-sources

async function processWithPipelines(items: any[], addressExtractor: AddressExtractor) {
  console.log('🔄 Application des pipelines de traitement avec extraction d\'adresses améliorée...');
  
  const processed: any[] = [];
  const seenFingerprints = new Set<string>();
  let addressExtractionStats = {
    improved: 0,
    failed: 0,
    already_good: 0
  };

  for (const item of items) {
    try {
      // Pipeline 1: Nettoyage de base
      const cleaned = cleanItem(item);
      
      // Pipeline 1.5: Amélioration de l'extraction d'adresses
      if (!cleaned.address || cleaned.address.length < 10) {
        console.log(`🔍 [Address] Tentative amélioration adresse pour: ${cleaned.name}`);
        const addressResult = addressExtractor.getBestAddress(cleaned);
        
        if (addressResult.confidence > 0.4 && addressResult.address.length > 5) {
          console.log(`✅ [Address] Adresse améliorée: "${addressResult.address}" (conf: ${addressResult.confidence})`);
          cleaned.address = addressResult.address;
          cleaned.address_confidence = addressResult.confidence;
          cleaned.address_extraction_source = addressResult.source;
          addressExtractionStats.improved++;
        } else {
          console.log(`❌ [Address] Échec amélioration adresse pour: ${cleaned.name}`);
          addressExtractionStats.failed++;
        }
      } else {
        addressExtractionStats.already_good++;
      }
      
      // Pipeline 2: Filtrage des doublons
      const fingerprint = generateFingerprint(cleaned);
      if (seenFingerprints.has(fingerprint)) {
        continue; // Skip doublon
      }
      seenFingerprints.add(fingerprint);
      
      // Pipeline 3: Enrichissement (géocodage, etc.)
      const enriched = await enrichItem(cleaned);
      
      processed.push(enriched);
      
    } catch (error) {
      console.warn('❌ [Pipeline] Erreur traitement item:', error);
    }
  }

  console.log(`✅ [Pipeline] ${processed.length} éléments traités`);
  console.log(`📊 [Address] Stats extraction: ${addressExtractionStats.improved} améliorées, ${addressExtractionStats.already_good} déjà bonnes, ${addressExtractionStats.failed} échecs`);
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
  const batchSize = 5; // Réduire encore plus la taille des lots

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    
    try {
      const processedBatch = batch.map((result, index) => {
        // Normaliser les données pour assurer la cohérence
        const normalized = {
          name: cleanText(result.name || result.title || 'Sans nom'),
          address: cleanText(result.address || ''),
          city: cleanText(result.city || ''),
          postal_code: result.postal_code || '00000',
          phone: cleanPhone(result.phone || ''),
          email: cleanEmail(result.email || ''),
          website: cleanWebsite(result.website || result.link || ''),
          description: cleanText(result.description || result.snippet || ''),
          lat: result.lat || null,
          lng: result.lng || null,
          business_category_id: categoryId,
          unique_id: generateUniqueId(result.name || result.title || `unknown_${Date.now()}_${index}`),
          source: result.source || 'unified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: false,
          data_quality_score: result.quality_score || calculateQualityScore(result),
          // Champs optionnels enrichis par IA
          services: result.services || null,
          specialties: result.specialties || null,
          deepseek_confidence: result.confidence || null
        };

        console.log(`📋 Normalisation résultat ${i + index + 1}:`, {
          original: result.name || result.title,
          normalized: normalized.name,
          quality: normalized.data_quality_score
        });

        return normalized;
      });

      console.log(`🔍 Tentative d'insertion lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(results.length/batchSize)}`);

      const { data, error } = await supabase
        .from('repairers')
        .insert(processedBatch)
        .select('id, name');

      if (error) {
        console.error(`❌ Erreur insertion lot ${Math.floor(i/batchSize) + 1}:`, error);
        console.error('Code erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Hint:', error.hint);
        
        // Log des données problématiques
        console.error('Données problématiques:', JSON.stringify(processedBatch, null, 2));
        continue;
      }

      insertedCount += data?.length || 0;
      console.log(`✅ Lot ${Math.floor(i/batchSize) + 1}: ${data?.length || 0} éléments insérés`);
      if (data?.length > 0) {
        console.log('IDs insérés:', data.map(d => `${d.id}: ${d.name}`));
      }

    } catch (error) {
      console.error(`💥 Erreur traitement lot ${Math.floor(i/batchSize) + 1}:`, error);
    }

    // Pause plus longue entre les lots
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`🎉 Total inséré: ${insertedCount}/${results.length} réparateurs`);
  return insertedCount;
}

function generateUniqueId(name: string): string {
  const timestamp = Date.now();
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  const random = Math.random().toString(36).substring(2, 4);
  return `UNI_${nameSlug}_${timestamp}_${random}`;
}