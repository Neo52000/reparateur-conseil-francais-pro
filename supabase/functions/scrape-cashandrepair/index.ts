import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashAndRepairLocation {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
  business_hours?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Démarrage du scraping Cash & Repair...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY non configurée dans les secrets Supabase');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Utiliser Firecrawl pour scraper le site Cash & Repair
    console.log('📡 Scraping du site Cash & Repair avec Firecrawl...');
    
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://ateliers.cashandrepair.fr/cashandrepair/fr',
        limit: 50,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'p', 'div', 'span', 'h1', 'h2', 'h3'],
          excludeTags: ['script', 'style', 'nav', 'footer'],
          onlyMainContent: true
        }
      })
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const crawlData = await firecrawlResponse.json();
    console.log('📊 Données Firecrawl reçues:', crawlData.jobId ? 'Job créé' : 'Données directes');

    let scrapedLocations: CashAndRepairLocation[] = [];

    // Si Firecrawl retourne un job ID, attendre la completion
    if (crawlData.jobId) {
      console.log('⏳ Attente de la completion du job Firecrawl...', crawlData.jobId);
      
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3 secondes
        
        const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlData.jobId}`, {
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
          }
        });
        
        const statusData = await statusResponse.json();
        console.log(`🔄 Status du job (tentative ${attempts + 1}):`, statusData.status);
        
        if (statusData.status === 'completed' && statusData.data) {
          scrapedLocations = parseFirecrawlData(statusData.data);
          break;
        } else if (statusData.status === 'failed') {
          throw new Error('Le job Firecrawl a échoué');
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Timeout lors de l\'attente du job Firecrawl');
      }
    } else if (crawlData.data) {
      // Données directes disponibles
      scrapedLocations = parseFirecrawlData(crawlData.data);
    }

    console.log(`📍 ${scrapedLocations.length} locations Cash & Repair trouvées`);

    // Insérer les réparateurs dans Supabase
    let insertedCount = 0;
    let errorCount = 0;

    for (const location of scrapedLocations) {
      try {
        // Vérifier si le réparateur existe déjà
        const { data: existing } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', location.name)
          .eq('city', location.city)
          .single();

        if (existing) {
          console.log(`⏭️ Réparateur déjà existant: ${location.name} - ${location.city}`);
          continue;
        }

        // Insérer le nouveau réparateur
        const { error } = await supabase
          .from('repairers')
          .insert({
            name: location.name,
            business_name: location.name,
            address: location.address,
            city: location.city,
            postal_code: location.postal_code,
            phone: location.phone,
            email: location.email,
            lat: location.latitude,
            lng: location.longitude,
            rating: 4.2, // Rating par défaut pour Cash & Repair
            verified: true,
            source: 'cashandrepair_scraping',
            services: location.services,
            business_hours: location.business_hours,
            website: 'https://ateliers.cashandrepair.fr',
            description: `Atelier Cash & Repair - Réparation de smartphones et appareils électroniques. Services professionnels avec garantie.`,
            specialties: location.services || ['Réparation smartphone', 'Réparation tablette'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ Erreur insertion ${location.name}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Réparateur ajouté: ${location.name} - ${location.city}`);
          insertedCount++;
        }
      } catch (err) {
        console.error(`❌ Erreur traitement ${location.name}:`, err);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Scraping Cash & Repair terminé`,
      stats: {
        locationsFound: scrapedLocations.length,
        inserted: insertedCount,
        errors: errorCount,
        source: 'cashandrepair'
      },
      locations: scrapedLocations.slice(0, 5) // Échantillon des premières locations
    };

    console.log('🎯 Résultat final:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur lors du scraping Cash & Repair:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur inconnue lors du scraping',
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Parse les données Firecrawl pour extraire les informations des ateliers
 */
function parseFirecrawlData(data: any[]): CashAndRepairLocation[] {
  const locations: CashAndRepairLocation[] = [];
  
  console.log('🔍 Parsing des données Firecrawl...');
  
  for (const page of data) {
    try {
      const markdown = page.markdown || '';
      const html = page.html || '';
      const url = page.metadata?.sourceURL || '';
      
      // Extraire les informations d'ateliers depuis le contenu
      const locationData = extractLocationFromContent(markdown, html, url);
      
      if (locationData) {
        locations.push(locationData);
      }
    } catch (err) {
      console.error('Erreur parsing page:', err);
    }
  }
  
  return locations;
}

/**
 * Extrait les données d'un atelier depuis le contenu de la page
 */
function extractLocationFromContent(markdown: string, html: string, url: string): CashAndRepairLocation | null {
  try {
    // Patterns pour extraire les informations
    const patterns = {
      name: [
        /Cash\s*&\s*Repair\s*-?\s*([^,\n]+)/i,
        /Atelier\s*([^,\n]+)/i,
        /<h[1-3][^>]*>([^<]*Cash[^<]*)<\/h[1-3]>/i
      ],
      address: [
        /(\d+[^,\n]*(?:rue|avenue|boulevard|place|allée)[^,\n]*)/i,
        /Adresse\s*:?\s*([^\n]+)/i
      ],
      phone: [
        /(?:tél|téléphone|phone)\s*:?\s*((?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})/i,
        /((?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})/
      ],
      email: [
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      ],
      city: [
        /(\d{5})\s+([A-Za-z][A-Za-z\s-]+)/,
        /ville\s*:?\s*([A-Za-z][A-Za-z\s-]+)/i
      ]
    };

    const content = markdown + ' ' + html;
    
    // Extraction du nom
    let name = 'Cash & Repair';
    for (const pattern of patterns.name) {
      const match = content.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    // Extraction de l'adresse
    let address = '';
    for (const pattern of patterns.address) {
      const match = content.match(pattern);
      if (match && match[1]) {
        address = match[1].trim();
        break;
      }
    }

    // Extraction du téléphone
    let phone = '';
    for (const pattern of patterns.phone) {
      const match = content.match(pattern);
      if (match && match[1]) {
        phone = match[1].replace(/[\s.-]/g, '');
        break;
      }
    }

    // Extraction de l'email
    let email = '';
    for (const pattern of patterns.email) {
      const match = content.match(pattern);
      if (match && match[1]) {
        email = match[1].trim();
        break;
      }
    }

    // Extraction ville et code postal
    let city = '';
    let postal_code = '';
    const cityMatch = content.match(patterns.city[0]);
    if (cityMatch) {
      postal_code = cityMatch[1];
      city = cityMatch[2].trim();
    }

    // Si pas d'adresse trouvée, utiliser l'URL ou d'autres indices
    if (!address && !city) {
      // Essayer d'extraire depuis l'URL ou d'autres sources
      return null;
    }

    const location: CashAndRepairLocation = {
      name: name || 'Cash & Repair',
      address: address || 'Adresse non spécifiée',
      city: city || 'Ville non spécifiée',
      postal_code: postal_code || '',
      phone: phone || undefined,
      email: email || undefined,
      services: [
        'Réparation smartphone',
        'Réparation tablette', 
        'Remplacement écran',
        'Changement batterie',
        'Réparation connecteur'
      ],
      business_hours: 'Lun-Sam 10h-19h'
    };

    console.log('📍 Location extraite:', location);
    return location;
    
  } catch (err) {
    console.error('Erreur extraction location:', err);
    return null;
  }
}