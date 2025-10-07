import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapingTarget {
  city: string;
  category: string;
  source: string;
  maxResults?: number;
}

interface ScrapingResult {
  name: string;
  business_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  website?: string;
  email?: string;
  rating?: number;
  review_count?: number;
  description?: string;
  services?: string[];
  lat?: number;
  lng?: number;
  source: string;
  quality_score: number;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    
    // Support both formats: direct params or targets array
    let city: string, category: string, source: string, maxResults: number;
    
    if (body.targets && Array.isArray(body.targets) && body.targets.length > 0) {
      // New format with targets array
      const target = body.targets[0];
      city = target.city;
      category = target.category;
      source = target.source;
      maxResults = target.maxResults || 20;
    } else {
      // Old format with direct params
      city = body.city;
      category = body.category;
      source = body.source;
      maxResults = body.maxResults || 20;
    }
    
    console.log('🚀 Starting real scraping:', { city, category, source, maxResults });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const serperApiKey = Deno.env.get('SERPER_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Log scraping start
    const { data: logData } = await supabase
      .from('scraping_logs')
      .insert({
        source,
        status: 'running',
        city,
        category,
        max_results: maxResults,
        items_scraped: 0
      })
      .select()
      .single()

    const logId = logData?.id

    let results: ScrapingResult[] = []

    if (source === 'google_maps' && serperApiKey) {
      results = await scrapeGoogleMaps(city, category, maxResults, serperApiKey)
    } else if (source === 'pages_jaunes') {
      results = await scrapePagesJaunes(city, category, maxResults)
    } else if (source === 'local_directories') {
      results = await scrapeLocalDirectories(city, category, maxResults)
    } else {
      throw new Error(`Source ${source} not supported or API keys missing`)
    }

    // Apply quality scoring and geocoding
    const enhancedResults = await enhanceResults(results)
    
    // Save to scraping_suggestions table
    if (enhancedResults.length > 0) {
      await supabase
        .from('scraping_suggestions')
        .insert(enhancedResults.map(result => ({
          name: result.name,
          business_name: result.business_name,
          address: result.address,
          city: result.city,
          postal_code: result.postal_code,
          phone: result.phone,
          website: result.website,
          email: result.email,
          rating: result.rating,
          review_count: result.review_count,
          description: result.description,
          services: result.services,
          lat: result.lat,
          lng: result.lng,
          source: result.source,
          quality_score: result.quality_score,
          ai_confidence: result.confidence,
          status: result.quality_score > 70 ? 'approved' : 'pending'
        })))
    }

    // Update log
    if (logId) {
      await supabase
        .from('scraping_logs')
        .update({
          status: 'completed',
          items_scraped: enhancedResults.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', logId)
    }

    console.log(`✅ Scraping completed: ${enhancedResults.length} results`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: enhancedResults,
        total: enhancedResults.length,
        source,
        city,
        category
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Scraping error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Scraping failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function scrapeGoogleMaps(city: string, category: string, maxResults: number, apiKey: string): Promise<ScrapingResult[]> {
  console.log('🗺️ Scraping Google Maps...')

  const query = `réparation ${category} ${city}`

  try {
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        location: city + ', France',
        gl: 'fr',
        hl: 'fr',
        num: Math.min(maxResults, 20)
      })
    })

    if (!response.ok) {
      console.error('Google Maps API error status:', response.status)
      // Fallback si le plan Serper ne permet pas l'endpoint Places (403)
      if (response.status === 403) {
        console.warn('⚠️ Places non autorisé par la clé Serper. Fallback vers recherche classique.')
        return await serperSearchFallback(query, city, maxResults)
      }
      throw new Error(`Google Maps API error: ${response.status}`)
    }

    const data = await response.json()
    const places = data.places || []

    if (places.length === 0) {
      console.warn('Aucun résultat Places. Fallback vers recherche classique.')
      return await serperSearchFallback(query, city, maxResults)
    }

    return places.map((place: any) => ({
      name: place.title || 'N/A',
      business_name: place.title || 'N/A',
      address: place.address || '',
      city: extractCity(place.address) || city,
      postal_code: extractPostalCode(place.address) || '',
      phone: place.phoneNumber || '',
      website: place.website || '',
      rating: place.rating || 0,
      review_count: place.reviews || 0,
      description: place.snippet || '',
      services: extractServices(place.snippet || ''),
      lat: place.gps?.lat,
      lng: place.gps?.lng,
      source: 'google_maps',
      quality_score: calculateQualityScore(place),
      confidence: 0.8
    }))

  } catch (error) {
    console.error('Google Maps scraping error:', error)
    try {
      // Dernier recours: fallback via recherche standard
      return await serperSearchFallback(query, city, maxResults)
    } catch (_) {
      return []
    }
  }
}

async function scrapePagesJaunes(city: string, category: string, maxResults: number): Promise<ScrapingResult[]> {
  console.log('📱 Scraping Pages Jaunes...')
  
  // Use search API or scraping library
  // For now, return empty array as this would require specific scraping setup
  return []
}

async function scrapeLocalDirectories(city: string, category: string, maxResults: number): Promise<ScrapingResult[]> {
  console.log('📋 Scraping local directories...')
  
  // Implementation for local directory scraping
  return []
}

async function enhanceResults(results: ScrapingResult[]): Promise<ScrapingResult[]> {
  console.log('🔧 Enhancing results with quality scoring and geocoding...')
  
  return results.map(result => {
    // Enhance quality score based on available data
    let qualityScore = result.quality_score || 0
    
    if (result.phone) qualityScore += 20
    if (result.website) qualityScore += 20
    if (result.rating && result.rating > 4) qualityScore += 15
    if (result.review_count && result.review_count > 10) qualityScore += 15
    if (result.lat && result.lng) qualityScore += 10
    if (result.description && result.description.length > 50) qualityScore += 10
    if (result.services && result.services.length > 0) qualityScore += 10
    
    return {
      ...result,
      quality_score: Math.min(100, qualityScore)
    }
  })
}

function extractCity(address: string): string | null {
  const cityMatch = address.match(/\d{5}\s+([A-Za-zÀ-ÿ\s-]+),?/)
  return cityMatch ? cityMatch[1].trim() : null
}

function extractPostalCode(address: string): string | null {
  const postalMatch = address.match(/(\d{5})/)
  return postalMatch ? postalMatch[1] : null
}

function extractServices(description: string): string[] {
  const services = []
  const keywords = ['réparation', 'dépannage', 'maintenance', 'diagnostic', 'service']
  
  keywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) {
      services.push(keyword)
    }
  })
  
  return services
}

// Fallback lorsque l'API Serper Places renvoie 403 ou aucun résultat
async function serperSearchFallback(query: string, city: string, maxResults: number): Promise<ScrapingResult[]> {
  console.log('🔁 Fallback Serper search (organic results)...')
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.functions.invoke('serper-search', {
      body: {
        query,
        type: 'search',
        country: 'fr',
        lang: 'fr',
        num: Math.min(maxResults, 20),
        location: city + ', France'
      }
    })

    if (error || !data?.success) {
      console.warn('Fallback search failed:', error || data)
      return []
    }

    const items = (data.results || data.organic || []) as Array<any>

    return items.map((item: any) => ({
      name: item.title || 'N/A',
      business_name: item.title || 'N/A',
      address: '',
      city,
      postal_code: '',
      phone: '',
      website: item.link || '',
      rating: undefined,
      review_count: undefined,
      description: item.snippet || '',
      services: extractServices(item.snippet || ''),
      lat: undefined,
      lng: undefined,
      source: 'google_search_fallback',
      quality_score: Math.min(100, (item.link ? 35 : 20) + (item.snippet ? 10 : 0)),
      confidence: 0.4,
    }))
  } catch (e) {
    console.error('Fallback search error:', e)
    return []
  }
}

function calculateQualityScore(place: any): number {
  let score = 0
  
  if (place.title) score += 20
  if (place.address) score += 20
  if (place.phoneNumber) score += 20
  if (place.website) score += 15
  if (place.rating > 4) score += 15
  if (place.reviews > 10) score += 10
  
  return Math.min(100, score)
}