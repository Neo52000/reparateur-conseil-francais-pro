import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place";
const FIRECRAWL_API = "https://api.firecrawl.dev/v1";

// Principales villes par département pour un scraping exhaustif
const CITIES_BY_DEPARTMENT: Record<string, string[]> = {
  '75': [
    'Paris 1er', 'Paris 2ème', 'Paris 3ème', 'Paris 4ème', 'Paris 5ème',
    'Paris 6ème', 'Paris 7ème', 'Paris 8ème', 'Paris 9ème', 'Paris 10ème',
    'Paris 11ème', 'Paris 12ème', 'Paris 13ème', 'Paris 14ème', 'Paris 15ème',
    'Paris 16ème', 'Paris 17ème', 'Paris 18ème', 'Paris 19ème', 'Paris 20ème'
  ],
  '77': [
    'Meaux', 'Chelles', 'Melun', 'Pontault-Combault', 'Savigny-le-Temple',
    'Torcy', 'Bussy-Saint-Georges', 'Villeparisis', 'Roissy-en-Brie', 'Dammarie-les-Lys',
    'Lagny-sur-Marne', 'Ozoir-la-Ferrière', 'Combs-la-Ville', 'Montereau-Fault-Yonne', 'Noisiel',
    'Lognes', 'Moissy-Cramayel', 'Le Mée-sur-Seine', 'Champs-sur-Marne', 'Vaires-sur-Marne'
  ],
  '78': [
    'Versailles', 'Sartrouville', 'Mantes-la-Jolie', 'Saint-Germain-en-Laye', 'Poissy',
    'Conflans-Sainte-Honorine', 'Houilles', 'Plaisir', 'Chatou', 'Les Mureaux',
    'Trappes', 'Montigny-le-Bretonneux', 'Guyancourt', 'Élancourt', 'Rambouillet',
    'Maisons-Laffitte', 'Le Chesnay', 'Carrières-sous-Poissy', 'Maurepas', 'Vélizy-Villacoublay'
  ],
  '91': [
    'Évry-Courcouronnes', 'Corbeil-Essonnes', 'Massy', 'Savigny-sur-Orge', 'Palaiseau',
    'Athis-Mons', 'Sainte-Geneviève-des-Bois', 'Viry-Châtillon', 'Yerres', 'Brunoy',
    'Draveil', 'Ris-Orangis', 'Grigny', 'Les Ulis', 'Longjumeau',
    'Montgeron', 'Vigneux-sur-Seine', 'Étampes', 'Chilly-Mazarin', 'Brétigny-sur-Orge'
  ],
  '92': [
    'Boulogne-Billancourt', 'Nanterre', 'Asnières-sur-Seine', 'Colombes', 'Courbevoie',
    'Rueil-Malmaison', 'Issy-les-Moulineaux', 'Levallois-Perret', 'Antony', 'Neuilly-sur-Seine',
    'Clamart', 'Montrouge', 'Meudon', 'Puteaux', 'Gennevilliers',
    'Clichy', 'Malakoff', 'Fontenay-aux-Roses', 'Bagneux', 'Châtillon'
  ],
  '93': [
    'Saint-Denis', 'Montreuil', 'Aubervilliers', 'Aulnay-sous-Bois', 'Drancy',
    'Noisy-le-Grand', 'Pantin', 'Bondy', 'Épinay-sur-Seine', 'Sevran',
    'Bobigny', 'Rosny-sous-Bois', 'Saint-Ouen-sur-Seine', 'Livry-Gargan', 'Villepinte',
    'Le Blanc-Mesnil', 'Clichy-sous-Bois', 'Bagnolet', 'Gagny', 'La Courneuve'
  ],
  '94': [
    'Créteil', 'Vitry-sur-Seine', 'Saint-Maur-des-Fossés', 'Champigny-sur-Marne', 'Ivry-sur-Seine',
    'Maisons-Alfort', 'Fontenay-sous-Bois', 'Villejuif', 'Vincennes', 'Alfortville',
    'Choisy-le-Roi', 'Le Kremlin-Bicêtre', 'Thiais', 'L\'Haÿ-les-Roses', 'Charenton-le-Pont',
    'Villeneuve-Saint-Georges', 'Nogent-sur-Marne', 'Cachan', 'Orly', 'Bonneuil-sur-Marne'
  ],
  '95': [
    'Argenteuil', 'Cergy', 'Sarcelles', 'Garges-lès-Gonesse', 'Franconville',
    'Goussainville', 'Pontoise', 'Bezons', 'Ermont', 'Villiers-le-Bel',
    'Taverny', 'Saint-Ouen-l\'Aumône', 'Herblay-sur-Seine', 'Eaubonne', 'Montmorency',
    'Deuil-la-Barre', 'Domont', 'Cormeilles-en-Parisis', 'Soisy-sous-Montmorency', 'Osny'
  ],
  '13': [
    'Marseille 1er', 'Marseille 2ème', 'Marseille 3ème', 'Marseille 4ème', 'Marseille 5ème',
    'Marseille 6ème', 'Marseille 7ème', 'Marseille 8ème', 'Marseille 9ème', 'Marseille 10ème',
    'Marseille 11ème', 'Marseille 12ème', 'Marseille 13ème', 'Marseille 14ème', 'Marseille 15ème',
    'Marseille 16ème', 'Aix-en-Provence', 'Arles', 'Martigues', 'Aubagne',
    'Istres', 'Salon-de-Provence', 'Vitrolles', 'La Ciotat', 'Miramas'
  ],
  '69': [
    'Lyon 1er', 'Lyon 2ème', 'Lyon 3ème', 'Lyon 4ème', 'Lyon 5ème',
    'Lyon 6ème', 'Lyon 7ème', 'Lyon 8ème', 'Lyon 9ème', 'Villeurbanne',
    'Vénissieux', 'Vaulx-en-Velin', 'Saint-Priest', 'Caluire-et-Cuire', 'Bron',
    'Oullins', 'Rillieux-la-Pape', 'Meyzieu', 'Décines-Charpieu', 'Villefranche-sur-Saône'
  ],
  '31': [
    'Toulouse', 'Colomiers', 'Tournefeuille', 'Blagnac', 'Muret',
    'Plaisance-du-Touch', 'Cugnaux', 'Balma', 'L\'Union', 'Ramonville-Saint-Agne',
    'Saint-Orens-de-Gameville', 'Castanet-Tolosan', 'Portet-sur-Garonne', 'Labège', 'Aucamville',
    'Saint-Jean', 'Fonsorbes', 'Launaguet', 'Saint-Gaudens', 'Castelginest'
  ],
  '33': [
    'Bordeaux', 'Mérignac', 'Pessac', 'Talence', 'Villenave-d\'Ornon',
    'Bègles', 'Gradignan', 'Le Bouscat', 'Saint-Médard-en-Jalles', 'Cenon',
    'Lormont', 'Libourne', 'Eysines', 'Arcachon', 'Floirac',
    'Blanquefort', 'Bruges', 'La Teste-de-Buch', 'Ambarès-et-Lagrave', 'Gujan-Mestras'
  ],
  '59': [
    'Lille', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Villeneuve-d\'Ascq',
    'Valenciennes', 'Douai', 'Wattrelos', 'Marcq-en-Barœul', 'Maubeuge',
    'Cambrai', 'Lambersart', 'Armentières', 'Hem', 'Croix',
    'Hazebrouck', 'La Madeleine', 'Halluin', 'Sin-le-Noble', 'Loos'
  ],
  '44': [
    'Nantes', 'Saint-Nazaire', 'Saint-Herblain', 'Rezé', 'Orvault',
    'Vertou', 'Couëron', 'Carquefou', 'La Chapelle-sur-Erdre', 'Bouguenais',
    'Saint-Sébastien-sur-Loire', 'Sainte-Luce-sur-Loire', 'Châteaubriant', 'Guérande', 'Pornic',
    'Les Sorinières', 'Ancenis-Saint-Géréon', 'Treillières', 'La Baule-Escoublac', 'Pontchâteau'
  ],
  '06': [
    'Nice', 'Antibes', 'Cannes', 'Grasse', 'Cagnes-sur-Mer',
    'Le Cannet', 'Saint-Laurent-du-Var', 'Menton', 'Vallauris', 'Mandelieu-la-Napoule',
    'Mougins', 'Vence', 'Villeneuve-Loubet', 'Beausoleil', 'Carros',
    'Roquebrune-Cap-Martin', 'La Trinité', 'Biot', 'Valbonne', 'Mouans-Sartoux'
  ],
  '34': [
    'Montpellier', 'Béziers', 'Sète', 'Agde', 'Lunel',
    'Castelnau-le-Lez', 'Lattes', 'Frontignan', 'Mauguio', 'Saint-Jean-de-Védas',
    'Pérols', 'Jacou', 'Palavas-les-Flots', 'Grabels', 'Le Crès',
    'Villeneuve-lès-Maguelone', 'Juvignac', 'Clapiers', 'Saint-Gély-du-Fesc', 'Vendargues'
  ],
  '67': [
    'Strasbourg', 'Haguenau', 'Schiltigheim', 'Illkirch-Graffenstaden', 'Sélestat',
    'Lingolsheim', 'Bischwiller', 'Bischheim', 'Ostwald', 'Saverne',
    'Obernai', 'Molsheim', 'Hœnheim', 'Mundolsheim', 'Souffelweyersheim',
    'Wissembourg', 'Erstein', 'La Wantzenau', 'Reichshoffen', 'Brumath'
  ],
  '38': [
    'Grenoble', 'Saint-Martin-d\'Hères', 'Échirolles', 'Vienne', 'Voiron',
    'Fontaine', 'Meylan', 'Bourgoin-Jallieu', 'Villefontaine', 'L\'Isle-d\'Abeau',
    'Seyssinet-Pariset', 'Saint-Égrève', 'Le Pont-de-Claix', 'Eybens', 'Sassenage',
    'Crolles', 'La Tronche', 'Claix', 'Gières', 'Saint-Marcellin'
  ]
};

// Fonction pour obtenir les villes d'un département (avec fallback générique)
function getCitiesForDepartment(deptCode: string): string[] {
  if (CITIES_BY_DEPARTMENT[deptCode]) {
    return CITIES_BY_DEPARTMENT[deptCode];
  }
  
  // Fallback: retourner juste le code département pour une recherche générique
  return [`département ${deptCode}`];
}

// Délai entre les requêtes pour éviter le rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    
    console.log(`🔍 Proxy - Action: ${action}`);

    // ==================== BATCH SEARCH ACTION ====================
    if (action === 'batchSearch') {
      const { queries, searchTerm, apiKey, delayMs = 1000 } = body;
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key is required for Google Places batch search' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!queries || !Array.isArray(queries) || queries.length === 0) {
        return new Response(
          JSON.stringify({ error: 'queries array is required and must not be empty' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`📦 Batch Search: ${queries.length} queries to process`);
      
      const allResults: any[] = [];
      const errors: any[] = [];
      let processedCount = 0;

      for (const queryItem of queries) {
        try {
          const query = typeof queryItem === 'string' 
            ? `${searchTerm} ${queryItem}`
            : `${searchTerm} ${queryItem.city || queryItem.location}`;
          
          console.log(`🔍 Processing query ${processedCount + 1}/${queries.length}: ${query}`);
          
          // Première requête
          let url = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=fr`;
          let response = await fetch(url);
          let data = await response.json();
          
          if (data.results) {
            allResults.push(...data.results.map((r: any) => ({
              ...r,
              _searchQuery: query,
              _queryIndex: processedCount
            })));
          }

          // Pagination automatique - récupérer les pages suivantes
          let pageCount = 1;
          while (data.next_page_token && pageCount < 3) { // Max 3 pages (60 résultats) par query
            console.log(`📄 Fetching page ${pageCount + 1} for: ${query}`);
            await delay(2000); // Google nécessite un délai avant d'utiliser next_page_token
            
            url = `${GOOGLE_PLACES_API}/textsearch/json?pagetoken=${data.next_page_token}&key=${apiKey}`;
            response = await fetch(url);
            data = await response.json();
            
            if (data.results) {
              allResults.push(...data.results.map((r: any) => ({
                ...r,
                _searchQuery: query,
                _queryIndex: processedCount,
                _page: pageCount + 1
              })));
            }
            pageCount++;
          }

          processedCount++;
          
          // Délai entre les requêtes pour éviter le rate limiting
          if (processedCount < queries.length) {
            await delay(delayMs);
          }
          
        } catch (error: any) {
          console.error(`❌ Error processing query:`, error);
          errors.push({ query: queryItem, error: error.message });
        }
      }

      // Dédupliquer par place_id
      const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.place_id, r])).values()
      );

      console.log(`✅ Batch Search complete: ${uniqueResults.length} unique results from ${processedCount} queries`);
      
      return new Response(
        JSON.stringify({
          success: true,
          results: uniqueResults,
          totalQueries: queries.length,
          processedQueries: processedCount,
          totalResults: uniqueResults.length,
          errors: errors.length > 0 ? errors : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== DEPARTMENT SEARCH (exhaustive) ====================
    if (action === 'departmentSearch') {
      const { departmentCode, searchTerm, apiKey, delayMs = 1500 } = body;
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!departmentCode) {
        return new Response(
          JSON.stringify({ error: 'departmentCode is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cities = getCitiesForDepartment(departmentCode);
      console.log(`🏙️ Department ${departmentCode} Search: ${cities.length} cities to process`);

      const allResults: any[] = [];
      const errors: any[] = [];
      let processedCount = 0;

      for (const city of cities) {
        try {
          const query = `${searchTerm} ${city}`;
          console.log(`🔍 [${processedCount + 1}/${cities.length}] Searching: ${query}`);
          
          // Première page
          let url = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=fr`;
          let response = await fetch(url);
          let data = await response.json();
          
          if (data.results) {
            allResults.push(...data.results.map((r: any) => ({
              ...r,
              _city: city,
              _department: departmentCode
            })));
          }

          // Pagination
          let pageCount = 1;
          while (data.next_page_token && pageCount < 3) {
            await delay(2000);
            url = `${GOOGLE_PLACES_API}/textsearch/json?pagetoken=${data.next_page_token}&key=${apiKey}`;
            response = await fetch(url);
            data = await response.json();
            
            if (data.results) {
              allResults.push(...data.results.map((r: any) => ({
                ...r,
                _city: city,
                _department: departmentCode,
                _page: pageCount + 1
              })));
            }
            pageCount++;
          }

          processedCount++;
          
          if (processedCount < cities.length) {
            await delay(delayMs);
          }
          
        } catch (error: any) {
          console.error(`❌ Error for city ${city}:`, error);
          errors.push({ city, error: error.message });
        }
      }

      // Dédupliquer
      const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.place_id, r])).values()
      );

      console.log(`✅ Department Search complete: ${uniqueResults.length} unique results`);
      
      return new Response(
        JSON.stringify({
          success: true,
          results: uniqueResults,
          department: departmentCode,
          citiesSearched: processedCount,
          totalCities: cities.length,
          totalResults: uniqueResults.length,
          errors: errors.length > 0 ? errors : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== REGION SEARCH ====================
    if (action === 'regionSearch') {
      const { departments, searchTerm, apiKey, delayMs = 2000 } = body;
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!departments || !Array.isArray(departments) || departments.length === 0) {
        return new Response(
          JSON.stringify({ error: 'departments array is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`🗺️ Region Search: ${departments.length} departments to process`);
      
      const allResults: any[] = [];
      const departmentStats: any[] = [];
      let totalCitiesSearched = 0;

      for (const deptCode of departments) {
        const cities = getCitiesForDepartment(deptCode);
        console.log(`📍 Department ${deptCode}: ${cities.length} cities`);
        
        let deptResults = 0;
        
        for (const city of cities) {
          try {
            const query = `${searchTerm} ${city}`;
            
            let url = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=fr`;
            let response = await fetch(url);
            let data = await response.json();
            
            if (data.results) {
              allResults.push(...data.results.map((r: any) => ({
                ...r,
                _city: city,
                _department: deptCode
              })));
              deptResults += data.results.length;
            }

            // Une seule page de pagination pour les recherches par région (pour limiter le temps)
            if (data.next_page_token) {
              await delay(2000);
              url = `${GOOGLE_PLACES_API}/textsearch/json?pagetoken=${data.next_page_token}&key=${apiKey}`;
              response = await fetch(url);
              data = await response.json();
              
              if (data.results) {
                allResults.push(...data.results.map((r: any) => ({
                  ...r,
                  _city: city,
                  _department: deptCode,
                  _page: 2
                })));
                deptResults += data.results.length;
              }
            }

            totalCitiesSearched++;
            await delay(delayMs);
            
          } catch (error: any) {
            console.error(`❌ Error for ${city} in ${deptCode}:`, error);
          }
        }
        
        departmentStats.push({
          code: deptCode,
          citiesSearched: cities.length,
          resultsFound: deptResults
        });
      }

      // Dédupliquer
      const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.place_id, r])).values()
      );

      console.log(`✅ Region Search complete: ${uniqueResults.length} unique results from ${totalCitiesSearched} cities`);
      
      return new Response(
        JSON.stringify({
          success: true,
          results: uniqueResults,
          departmentStats,
          totalDepartments: departments.length,
          totalCitiesSearched,
          totalResults: uniqueResults.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== GET CITIES FOR DEPARTMENT ====================
    if (action === 'getCities') {
      const { departmentCode } = body;
      
      if (!departmentCode) {
        return new Response(
          JSON.stringify({ error: 'departmentCode is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cities = getCitiesForDepartment(departmentCode);
      
      return new Response(
        JSON.stringify({
          success: true,
          departmentCode,
          cities,
          count: cities.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== FIRECRAWL ACTIONS ====================
    if (action === 'firecrawlSearch') {
      const { query, options } = body;
      
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
      if (!apiKey) {
        console.error('FIRECRAWL_API_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please enable the Firecrawl connector in Settings.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('🔥 Firecrawl Search:', query);

      const response = await fetch(`${FIRECRAWL_API}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: options?.limit || 10,
          lang: options?.lang || 'fr',
          country: options?.country || 'FR',
          scrapeOptions: options?.scrapeOptions || { formats: ['markdown'] },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Firecrawl API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Firecrawl Search successful, found', data.data?.length || 0, 'results');
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'firecrawlScrape') {
      const { url, options } = body;
      
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
      if (!apiKey) {
        console.error('FIRECRAWL_API_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please enable the Firecrawl connector in Settings.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Format URL
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      console.log('🔥 Firecrawl Scrape:', formattedUrl);

      const response = await fetch(`${FIRECRAWL_API}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: options?.formats || ['markdown'],
          onlyMainContent: options?.onlyMainContent ?? true,
          waitFor: options?.waitFor,
          location: options?.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Firecrawl API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Firecrawl Scrape successful');
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== GOOGLE PLACES ACTIONS ====================
    const { query, placeId, apiKey } = body;
    
    if (!apiKey && (action === 'textSearch' || action === 'placeDetails')) {
      return new Response(
        JSON.stringify({ error: 'API key is required for Google Places' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'textSearch') {
      // Text Search API
      const url = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      console.log(`📍 Text Search: ${query}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ Text Search results: ${data.results?.length || 0} places found`);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'placeDetails') {
      // Place Details API
      const url = `${GOOGLE_PLACES_API}/details/json?place_id=${placeId}&fields=formatted_address,formatted_phone_number,name,rating,user_ratings_total,website&key=${apiKey}`;
      console.log(`📍 Place Details: ${placeId}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`✅ Place Details: ${data.result?.name || 'N/A'}`);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use textSearch, placeDetails, batchSearch, departmentSearch, regionSearch, getCities, firecrawlSearch, or firecrawlScrape' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
