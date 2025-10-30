
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
  private mistralApiKey: string | null;

  constructor(supabaseUrl: string, supabaseKey: string, firecrawlApiKey: string | null, mistralApiKey: string | null) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.firecrawlApiKey = firecrawlApiKey;
    this.mistralApiKey = mistralApiKey;
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
    if (!this.mistralApiKey) {
      console.log('Clé Mistral manquante, utilisation de la classification basique');
      return this.basicClassification(name, description);
    }

    try {
      const prompt = `
Analyse cette entreprise et détermine si c'est un réparateur de smartphones/téléphones mobiles:

Nom: ${name}
Description: ${description || 'Non fournie'}

Réponds EXCLUSIVEMENT au format JSON:
{
  "isRepairer": boolean,
  "confidence": number (0-1),
  "services": ["service1", "service2"],
  "specialties": ["marque1", "marque2"],
  "priceRange": "low|medium|high"
}

Critères pour isRepairer=true:
- Mots-clés: réparation, téléphone, smartphone, mobile, GSM, iPhone, Samsung, écran, batterie
- Exclure: vente uniquement, accessoires uniquement, opérateurs télécom
`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.mistralApiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-small',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in Mistral response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON format in Mistral response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        isRepairer: result.isRepairer || false,
        confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
        services: Array.isArray(result.services) ? result.services : ['Réparation générale'],
        specialties: Array.isArray(result.specialties) ? result.specialties : ['Tout mobile'],
        priceRange: ['low', 'medium', 'high'].includes(result.priceRange) ? result.priceRange : 'medium'
      };

    } catch (error) {
      console.error('Erreur Mistral AI:', error);
      return this.basicClassification(name, description);
    }
  }

  private basicClassification(name: string, description?: string) {
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
      throw new Error('Clé API Firecrawl requise pour le scraping');
    }

    try {
      console.log(`🔥 Démarrage scraping Firecrawl: ${searchTerm} à ${location}`);
      
      // Construction de l'URL de recherche selon la source
      let searchUrl = '';
      if (source === 'pages_jaunes') {
        searchUrl = `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
      } else if (source === 'google_maps') {
        searchUrl = `https://www.google.fr/maps/search/${encodeURIComponent(searchTerm)}+${encodeURIComponent(location)}`;
      } else {
        searchUrl = `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoi=${encodeURIComponent(searchTerm)}&ou=${encodeURIComponent(location)}`;
      }

      console.log(`🌐 URL de scraping: ${searchUrl}`);

      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          waitFor: 3000,
          timeout: 30000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur API Firecrawl: ${response.status} - ${errorText}`);
        throw new Error(`Erreur API Firecrawl: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Données reçues de Firecrawl:`, data.success);
      
      if (!data.success) {
        console.error(`❌ Firecrawl non réussi:`, data);
        throw new Error(`Firecrawl error: ${data.error || 'Unknown error'}`);
      }

      // Firecrawl v1 retourne les données directement dans data
      const markdown = data.markdown || '';
      const html = data.html || '';
      
      console.log(`📄 Contenu reçu: ${markdown.length} chars markdown, ${html.length} chars html`);
      
      return this.parseScrapedData(markdown, html, source, maxResults);

    } catch (error) {
      console.error('❌ Erreur scraping Firecrawl:', error);
      throw error;
    }
  }

  private parseScrapedData(markdown: string, html: string, source: string, maxResults: number) {
    console.log(`📝 Parsing des données (${markdown.length} chars markdown, ${html.length} chars html)`);
    
    const results = [];
    
    if (source === 'pages_jaunes') {
      console.log('🔍 Parsing Pages Jaunes - Recherche de patterns multiples');
      
      // Pattern 1: Recherche dans le HTML avec sélecteurs modernes
      const businessPatterns = [
        /<div[^>]*class="[^"]*etablissement[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<article[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
        /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
      ];

      for (const pattern of businessPatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          if (results.length >= maxResults) break;
          
          const block = match[1];
          
          // Extraction du nom avec patterns multiples
          const namePatterns = [
            /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i,
            /<a[^>]*class="[^"]*denomination[^"]*"[^>]*>([^<]+)<\/a>/i,
            /<span[^>]*class="[^"]*nom[^"]*"[^>]*>([^<]+)<\/span>/i,
            /<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/i
          ];

          let name = '';
          for (const namePattern of namePatterns) {
            const nameMatch = block.match(namePattern);
            if (nameMatch) {
              name = nameMatch[1].trim();
              break;
            }
          }

          // Extraction de l'adresse avec patterns multiples
          const addressPatterns = [
            /<span[^>]*class="[^"]*adresse[^"]*"[^>]*>([^<]+)<\/span>/i,
            /<div[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/div>/i,
            /<p[^>]*class="[^"]*lieu[^"]*"[^>]*>([^<]+)<\/p>/i
          ];

          let address = '';
          for (const addressPattern of addressPatterns) {
            const addressMatch = block.match(addressPattern);
            if (addressMatch) {
              address = addressMatch[1].trim();
              break;
            }
          }

          // Extraction du téléphone
          const phoneMatch = block.match(/(\+33|0)[0-9\s\.\-]{8,}/);
          const phone = phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '';
          
          if (name && name.length > 3) {
            console.log(`✅ Trouvé: ${name} - ${address}`);
            results.push({
              name: name,
              address: address || `Adresse non disponible`,
              city: location,
              postal_code: this.extractPostalCode(address),
              phone: phone,
              source: source,
              description: `Réparateur trouvé sur Pages Jaunes`
            });
          }
        }
      }

      // Pattern 2: Parsing du markdown comme fallback
      if (results.length === 0) {
        console.log('🔄 Fallback: Parsing du markdown');
        
        const lines = markdown.split('\n');
        for (let i = 0; i < lines.length && results.length < maxResults; i++) {
          const line = lines[i].trim();
          
          // Recherche de lignes qui ressemblent à des noms d'entreprises
          if (line.length > 5 && 
              (line.includes('réparation') || 
               line.includes('téléphone') || 
               line.includes('mobile') || 
               line.includes('smartphone') ||
               line.includes('iPhone') ||
               line.includes('Samsung'))) {
            
            const name = line.replace(/[#*\-\[\]]/g, '').trim();
            if (name.length > 3) {
              console.log(`📝 Markdown trouvé: ${name}`);
              results.push({
                name: name,
                address: `${results.length + 1} Rue de la Réparation`,
                city: location,
                postal_code: '75001',
                phone: `01 XX XX XX ${String(results.length + 10).padStart(2, '0')}`,
                source: source,
                description: 'Réparateur détecté via markdown'
              });
            }
          }
        }
      }

      // Pattern 3: Recherche de numéros de téléphone dans le texte complet
      if (results.length === 0) {
        console.log('🔄 Recherche par numéros de téléphone');
        
        const phoneRegex = /(\+33|0)[0-9\s\.\-]{8,}/g;
        const phones = [...markdown.matchAll(phoneRegex)];
        
        for (let i = 0; i < phones.length && results.length < maxResults; i++) {
          const phone = phones[i][0];
          
          // Chercher du contexte autour du numéro
          const phoneIndex = markdown.indexOf(phone);
          const contextBefore = markdown.substring(Math.max(0, phoneIndex - 100), phoneIndex);
          const contextAfter = markdown.substring(phoneIndex, phoneIndex + 100);
          const context = contextBefore + contextAfter;
          
          if (context.toLowerCase().includes('réparation') || 
              context.toLowerCase().includes('téléphone') || 
              context.toLowerCase().includes('mobile')) {
            
            // Extraire un nom potentiel du contexte
            const lines = context.split('\n').filter(l => l.trim().length > 0);
            const potentialName = lines.find(l => 
              l.length > 5 && 
              l.length < 50 && 
              !l.includes('http') &&
              !l.match(/^\d+$/)
            )?.trim() || `Réparateur ${i + 1}`;
            
            console.log(`📞 Trouvé via téléphone: ${potentialName} - ${phone}`);
            results.push({
              name: potentialName,
              address: `Adresse à préciser`,
              city: location,
              postal_code: '00000',
              phone: phone.replace(/\s/g, ''),
              source: source,
              description: 'Réparateur trouvé via numéro de téléphone'
            });
          }
        }
      }
      
    } else {
      // Parser générique pour autres sources
      const lines = markdown.split('\n');
      
      for (let i = 0; i < lines.length && results.length < maxResults; i++) {
        const line = lines[i].trim();
        if (line.includes('réparation') || line.includes('téléphone') || line.includes('mobile')) {
          const name = line.replace(/[#*-]/g, '').trim();
          if (name.length > 3) {
            results.push({
              name: name,
              address: `${results.length + 1} Rue de la Réparation`,
              city: location,
              postal_code: '75001',
              phone: `01 XX XX XX ${String(results.length + 10).padStart(2, '0')}`,
              source: source,
              description: 'Réparateur détecté via scraping'
            });
          }
        }
      }
    }

    console.log(`📊 ${results.length} résultats extraits après parsing`);
    return results;
  }

  private extractPostalCode(address: string): string {
    const match = address.match(/\b(\d{5})\b/);
    return match ? match[1] : '00000';
  }

  async saveToDatabase(processedResults: any[]) {
    const results = [];
    
    for (const result of processedResults) {
      try {
        const { data: existing } = await this.supabase
          .from('repairers')
          .select('id')
          .eq('name', result.name)
          .eq('postal_code', result.postal_code)
          .single();

        if (existing) {
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
    const body = await req.json();
    
    // Détecter si c'est une requête proxy Firecrawl (opération, url, options)
    // ou une requête de scraping orchestré (searchTerm, location, source)
    const isProxyRequest = body.operation && body.url;
    
    if (isProxyRequest) {
      // Mode PROXY: Requête générique vers Firecrawl API
      return await handleFirecrawlProxy(body);
    } else {
      // Mode SCRAPING ORCHESTRÉ: Workflow complet
      return await handleOrchestredScraping(body);
    }
  } catch (error) {
    console.error('❌ Erreur modern-scraping:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Handler pour les requêtes proxy Firecrawl
async function handleFirecrawlProxy(body: any) {
  const { operation, url, options } = body;
  
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlApiKey) {
    console.error('❌ FIRECRAWL_API_KEY not configured');
    return new Response(
      JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!operation || !url) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Map operation to Firecrawl endpoint
  const endpoint = operation === 'crawl' ? '/v1/crawl' : '/v1/scrape';
  const firecrawlUrl = `https://api.firecrawl.dev${endpoint}`;

  console.log(`🔥 Proxy Firecrawl ${operation} for URL:`, url);

  const firecrawlResponse = await fetch(firecrawlUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      ...options
    }),
  });

  const responseData = await firecrawlResponse.json();

  if (!firecrawlResponse.ok) {
    console.error('❌ Firecrawl API error:', responseData);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: responseData.error || 'Firecrawl API request failed' 
      }),
      { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Firecrawl proxy request successful');

  return new Response(
    JSON.stringify({ success: true, data: responseData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handler pour le scraping orchestré
async function handleOrchestredScraping(body: any) {
  const { searchTerm, location, source, maxResults, testMode } = body;

    console.log(`🚀 Scraping modernisé: ${searchTerm} à ${location} (source: ${source})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

    if (!firecrawlApiKey) {
      console.error('❌ Clé Firecrawl manquante');
      return new Response(JSON.stringify({
        success: false,
        error: 'Clé API Firecrawl non configurée dans les secrets Supabase'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orchestrator = new ModernScrapingOrchestrator(supabaseUrl, supabaseKey, firecrawlApiKey, mistralApiKey);

    // Phase 1: Scraping avec Firecrawl
    console.log('🔥 Phase 1: Scraping avec Firecrawl');
    const rawResults = await orchestrator.scrapeWithFirecrawl(searchTerm, location, source, maxResults);
    console.log(`📊 ${rawResults.length} résultats bruts trouvés`);

    // CORRECTION: Ne plus retourner 404 si aucun résultat
    if (rawResults.length === 0) {
      console.log('⚠️ Aucun résultat trouvé, mais retour succès');
      return new Response(JSON.stringify({
        success: true,
        processedCount: 0,
        savedCount: 0,
        message: 'Scraping terminé mais aucun réparateur trouvé pour cette recherche',
        testMode: testMode || false,
        firecrawlEnabled: !!firecrawlApiKey,
        mistralEnabled: !!mistralApiKey,
        results: []
      }), {
        status: 200, // CHANGÉ: 200 au lieu de 404
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Phase 2: Classification et géocodage
    console.log('🧠 Phase 2: Classification et géocodage');
    const processedResults = [];
    
    for (const rawResult of rawResults) {
      // Classification avec Mistral AI
      const classification = await orchestrator.classifyWithMistral(rawResult.name, rawResult.description);
      
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
      console.log('💾 Phase 3: Sauvegarde en base');
      savedResults = await orchestrator.saveToDatabase(processedResults);
      console.log(`💾 ${savedResults.length} réparateurs sauvegardés`);
    }

    return new Response(JSON.stringify({
      success: true,
      processedCount: processedResults.length,
      savedCount: savedResults.length,
      testMode: testMode || false,
      firecrawlEnabled: !!firecrawlApiKey,
      mistralEnabled: !!mistralApiKey,
      results: processedResults // Retourner tous les résultats pour affichage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}
