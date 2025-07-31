import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingTarget {
  city: string;
  category: string;
  source: 'google_maps' | 'pages_jaunes' | 'local_directories';
  maxResults?: number;
}

interface ScrapingResult {
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  place_id?: string;
  rating?: number;
  review_count?: number;
  description?: string;
  category?: string;
  opening_hours?: string[];
  source: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, category, source, maxResults = 10, coordinates, aiModel }: { 
      city: string; 
      category: string; 
      source: string; 
      maxResults?: number; 
      coordinates?: { lat: number; lng: number };
      aiModel?: string;
    } = await req.json();
    
    console.log('🎯 Starting intelligent scraping:', { city, category, source, maxResults, coordinates, aiModel });
    
    // Log scraping start - utilise une table existante
    const { data: logData } = await supabase
      .from('scraping_logs')
      .insert({
        source: source,
        status: 'running',
        items_scraped: 0,
        items_added: 0,
        items_updated: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    const startTime = Date.now();
    let results: ScrapingResult[] = [];
    
    try {
      // Choose scraping strategy based on source
      const target = { city, category, source, maxResults };
      switch (source) {
        case 'google_maps':
          results = await scrapeGoogleMaps(target);
          break;
        case 'pages_jaunes':
          results = await scrapePagesJaunes(target);
          break;
        case 'local_directories':
          results = await scrapeLocalDirectories(target);
          break;
        default:
          throw new Error(`Unsupported source: ${source}`);
      }

      const executionTime = Date.now() - startTime;
      
      // Update log with success
      if (logData) {
        await supabase
          .from('scraping_logs')
          .update({
            status: 'completed',
            items_scraped: results.length,
            items_added: results.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', logData.id);
      }

      console.log(`✅ Scraping completed: ${results.length} results in ${executionTime}ms`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: results,
        stats: {
          scraped: results.length,
          classified: 0, // Classification sera ajoutée dans une version future
          city,
          category,
          source
        },
        execution_time_ms: executionTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (scrapingError) {
      console.error('❌ Scraping error:', scrapingError);
      
      // Update log with error
      if (logData) {
        await supabase
          .from('scraping_logs')
          .update({
            status: 'failed',
            error_message: scrapingError.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', logData.id);
      }
      
      throw scrapingError;
    }

  } catch (error) {
    console.error('🚨 Function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scrapeGoogleMaps(target: ScrapingTarget): Promise<ScrapingResult[]> {
  console.log(`🗺️ Scraping Google Maps for "${target.category}" in "${target.city}"`);
  
  // Simulate scraping with realistic data for demo
  // In production, this would use actual Google Maps API or web scraping
  const mockResults: ScrapingResult[] = [
    {
      name: `iReparation ${target.city}`,
      address: `123 Rue de la République, ${target.city}`,
      city: target.city,
      postal_code: target.city === 'Paris' ? '75001' : '69000',
      phone: '01 42 33 44 55',
      website: 'https://ireparation-example.fr',
      place_id: 'ChIJ123456789',
      rating: 4.2,
      review_count: 127,
      description: `Spécialiste en réparation de smartphones et tablettes à ${target.city}. Service rapide et garantie.`,
      category: 'Réparation de téléphones mobiles',
      opening_hours: ['Lun-Ven: 9h-18h', 'Sam: 10h-17h'],
      source: 'google_maps'
    },
    {
      name: `Mobile Service ${target.city}`,
      address: `45 Avenue des Champs, ${target.city}`,
      city: target.city,
      postal_code: target.city === 'Paris' ? '75008' : '69001',
      phone: '01 55 66 77 88',
      rating: 4.5,
      review_count: 89,
      description: `Réparation express de smartphones, tablettes et ordinateurs portables.`,
      category: 'Service de réparation électronique',
      opening_hours: ['Lun-Sam: 8h30-19h'],
      source: 'google_maps'
    }
  ];

  // Add some variation based on city
  const results = mockResults.map(result => ({
    ...result,
    name: result.name.replace('Paris', target.city).replace('Lyon', target.city),
    address: result.address.replace('Paris', target.city).replace('Lyon', target.city),
    description: result.description?.replace('Paris', target.city).replace('Lyon', target.city)
  }));

  // Limit results based on maxResults
  return results.slice(0, target.maxResults || 20);
}

async function scrapePagesJaunes(target: ScrapingTarget): Promise<ScrapingResult[]> {
  console.log(`📞 Scraping Pages Jaunes for "${target.category}" in "${target.city}"`);
  
  // Simulate Pages Jaunes scraping
  const mockResults: ScrapingResult[] = [
    {
      name: `Docteur Smartphone ${target.city}`,
      address: `78 Rue du Commerce, ${target.city}`,
      city: target.city,
      postal_code: target.city === 'Paris' ? '75015' : '69003',
      phone: '01 44 55 66 77',
      website: 'https://docteur-smartphone.fr',
      description: `Réparation de smartphones toutes marques. Intervention rapide et prix compétitifs à ${target.city}.`,
      category: 'Réparation téléphone mobile',
      source: 'pages_jaunes'
    },
    {
      name: `TechFix ${target.city}`,
      address: `12 Place de la Mairie, ${target.city}`,
      city: target.city,
      postal_code: target.city === 'Paris' ? '75020' : '69005',
      phone: '01 77 88 99 00',
      description: `Spécialiste réparation écrans cassés, batteries, et déblocage de téléphones.`,
      category: 'Dépannage informatique et téléphonie',
      source: 'pages_jaunes'
    }
  ];

  return mockResults.slice(0, target.maxResults || 20);
}

async function scrapeLocalDirectories(target: ScrapingTarget): Promise<ScrapingResult[]> {
  console.log(`📚 Scraping local directories for "${target.category}" in "${target.city}"`);
  
  // Simulate local directory scraping
  const mockResults: ScrapingResult[] = [
    {
      name: `${target.city} Phone Repair`,
      address: `89 Boulevard Central, ${target.city}`,
      city: target.city,
      postal_code: target.city === 'Paris' ? '75011' : '69002',
      phone: '01 88 99 00 11',
      email: 'contact@phonerepair.fr',
      description: `Service de réparation mobile et sur place pour smartphones et tablettes.`,
      category: 'Réparation électronique',
      source: 'local_directories'
    }
  ];

  return mockResults.slice(0, target.maxResults || 20);
}

// Helper function to normalize city names for better matching
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}