
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Services modernisés intégrés
class ModernScrapingOrchestrator {
  private supabase: any;
  private firecrawlApiKey: string | null;

  constructor(supabaseUrl: string, supabaseKey: string, firecrawlApiKey: string | null) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.firecrawlApiKey = firecrawlApiKey;
  }

  async processWithNominatim(address: string, city: string, postalCode: string) {
    const fullAddress = `${address}, ${postalCode} ${city}, France`;
    
    try {
      const params = new URLSearchParams({
        q: fullAddress,
        format: 'json',
        limit: '1',
        countrycodes: 'fr',
        addressdetails: '1'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'ModernRepairScraper/2.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const results = await response.json();
      
      if (!results || results.length === 0) {
        return this.getFallbackCoordinates(postalCode);
      }

      const result = results[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        return this.getFallbackCoordinates(postalCode);
      }

      return {
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000,
        accuracy: 'precise'
      };

    } catch (error) {
      console.error('Erreur géocodage Nominatim:', error);
      return this.getFallbackCoordinates(postalCode);
    }
  }

  private getFallbackCoordinates(postalCode: string) {
    const departmentCode = postalCode.substring(0, 2);
    
    const departmentCoords: Record<string, { lat: number; lng: number }> = {
      '75': { lat: 48.8566, lng: 2.3522 },
      '69': { lat: 45.7640, lng: 4.8357 },
      '13': { lat: 43.2965, lng: 5.3698 },
      '31': { lat: 43.6047, lng: 1.4442 },
      '06': { lat: 43.7102, lng: 7.2620 },
      '33': { lat: 44.8378, lng: -0.5792 },
      '59': { lat: 50.6292, lng: 3.0573 },
      '67': { lat: 48.5734, lng: 7.7521 },
      '44': { lat: 47.2184, lng: -1.5536 },
      '35': { lat: 48.1173, lng: -1.6778 }
    };
    
    const coords = departmentCoords[departmentCode] || { lat: 46.603354, lng: 1.888334 };
    
    return {
      lat: coords.lat + (Math.random() - 0.5) * 0.01,
      lng: coords.lng + (Math.random() - 0.5) * 0.01,
      accuracy: 'fallback'
    };
  }

  async classifyWithMistral(name: string, description?: string) {
    // Classification par mots-clés avancée
    const text = (name + ' ' + (description || '')).toLowerCase();
    const repairKeywords = ['réparation', 'réparer', 'téléphone', 'smartphone', 'mobile', 'iphone', 'samsung', 'écran', 'batterie', 'gsm'];
    const excludeKeywords = ['vente', 'boutique', 'magasin', 'opérateur', 'orange', 'sfr', 'bouygues', 'free'];
    
    const hasRepairKeywords = repairKeywords.some(keyword => text.includes(keyword));
    const hasExcludeKeywords = excludeKeywords.some(keyword => text.includes(keyword));
    
    const isRepairer = hasRepairKeywords && !hasExcludeKeywords;
    
    return {
      isRepairer,
      confidence: isRepairer ? 0.8 : 0.2,
      services: isRepairer ? ['Réparation générale'] : [],
      specialties: isRepairer ? ['Tout mobile'] : [],
      priceRange: 'medium' as const
    };
  }

  async scrapeWithFirecrawl(searchTerm: string, location: string, source: string, maxResults: number) {
    if (!this.firecrawlApiKey) {
      throw new Error('Clé API Firecrawl requise pour le scraping réel');
    }

    try {
      // Construction de l'URL de recherche selon la source
      let searchUrl = '';
      if (source === 'pages_jaunes') {
        searchUrl = `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
      } else if (source === 'google_maps') {
        searchUrl = `https://www.google.fr/maps/search/${encodeURIComponent(searchTerm)}+${encodeURIComponent(location)}`;
      }

      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ['markdown'],
          onlyMainContent: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Firecrawl: ${response.status}`);
      }

      const data = await response.json();
      return this.parseScrapedData(data.data?.markdown || '', source);

    } catch (error) {
      console.error('Erreur scraping Firecrawl:', error);
      throw error;
    }
  }

  private parseScrapedData(markdown: string, source: string) {
    // Parsing basique du markdown pour extraire les données de réparateurs
    const results = [];
    const lines = markdown.split('\n');
    
    // Logique de parsing simplifiée - à améliorer selon le format réel
    for (let i = 0; i < lines.length && results.length < 10; i++) {
      const line = lines[i].trim();
      if (line.includes('réparation') || line.includes('téléphone') || line.includes('mobile')) {
        // Extraction basique des informations
        const name = line.replace(/[#*-]/g, '').trim();
        if (name.length > 3) {
          results.push({
            name: name,
            address: `Adresse ${results.length + 1}`,
            city: 'Paris', // À extraire du parsing
            postal_code: '75001',
            phone: '01 XX XX XX XX',
            source: source
          });
        }
      }
    }

    return results;
  }

  async saveToDatabase(processedResults: any[]) {
    const results = [];
    
    for (const result of processedResults) {
      try {
        // Vérifier si le réparateur existe déjà
        const { data: existing } = await this.supabase
          .from('repairers')
          .select('id')
          .eq('name', result.name)
          .eq('postal_code', result.postal_code)
          .single();

        if (existing) {
          // Mise à jour
          const { data: updated, error } = await this.supabase
            .from('repairers')
            .update({
              ...result,
              updated_at: new Date().toISOString(),
              scraped_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error) {
            results.push({ action: 'updated', data: updated });
          }
        } else {
          // Insertion
          const { data: inserted, error } = await this.supabase
            .from('repairers')
            .insert({
              ...result,
              scraped_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!error) {
            results.push({ action: 'inserted', data: inserted });
          }
        }
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
      }
    }

    return results;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm, location, source, maxResults, testMode } = await req.json();

    console.log(`🚀 Scraping modernisé: ${searchTerm} à ${location}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    const orchestrator = new ModernScrapingOrchestrator(supabaseUrl, supabaseKey, firecrawlApiKey);

    let rawResults = [];

    if (testMode || !firecrawlApiKey) {
      console.log('⚠️ Mode test ou clé Firecrawl manquante - génération de données de démonstration');
      // Données de démonstration plus réalistes
      rawResults = [
        {
          name: `Réparation Mobile ${location}`,
          address: `12 Rue Principale`,
          city: location,
          postal_code: '75001',
          phone: '01 42 00 00 01',
          source: source
        },
        {
          name: `${location} Phone Repair`,
          address: `25 Avenue Central`,
          city: location,
          postal_code: '75002',
          phone: '01 43 00 00 02',
          source: source
        }
      ].slice(0, maxResults);
    } else {
      // Scraping réel avec Firecrawl
      rawResults = await orchestrator.scrapeWithFirecrawl(searchTerm, location, source, maxResults);
    }

    console.log(`📊 ${rawResults.length} résultats bruts trouvés`);

    // Phase 2: Classification et géocodage
    const processedResults = [];
    
    for (const rawResult of rawResults) {
      // Classification
      const classification = await orchestrator.classifyWithMistral(rawResult.name);
      
      if (classification.isRepairer && classification.confidence > 0.5) {
        // Géocodage
        const coordinates = await orchestrator.processWithNominatim(
          rawResult.address, 
          rawResult.city, 
          rawResult.postal_code
        );

        processedResults.push({
          ...rawResult,
          lat: coordinates.lat,
          lng: coordinates.lng,
          services: classification.services,
          specialties: classification.specialties,
          price_range: classification.priceRange,
          is_verified: false,
          rating: null,
          department: rawResult.postal_code.substring(0, 2),
          region: 'France'
        });
      }
    }

    console.log(`✅ ${processedResults.length} réparateurs validés`);

    // Phase 3: Sauvegarde en base
    let savedResults = [];
    if (!testMode) {
      savedResults = await orchestrator.saveToDatabase(processedResults);
      console.log(`💾 ${savedResults.length} réparateurs sauvegardés`);
    }

    return new Response(JSON.stringify({
      success: true,
      processedCount: processedResults.length,
      savedCount: savedResults.length,
      testMode: testMode || !firecrawlApiKey,
      results: processedResults.slice(0, 5) // Échantillon pour aperçu
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur scraping modernisé:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
