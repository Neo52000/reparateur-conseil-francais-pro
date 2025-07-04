import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PipelineResult {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  lat?: number;
  lng?: number;
  confidence_score?: number;
  ai_enriched?: boolean;
  source: string;
}

class MultiAIPipeline {
  private supabase: any;
  private serperApiKey: string;
  private deepseekApiKey: string;
  private mistralApiKey: string;
  private perplexityApiKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.serperApiKey = Deno.env.get('SERPER_API_KEY') || '';
    this.deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') || '';
    this.mistralApiKey = Deno.env.get('MISTRAL_API_KEY') || '';
    this.perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY') || '';
  }

  // Étape 1: Recherche initiale avec Serper
  async searchWithSerper(searchTerm: string, location: string): Promise<any[]> {
    console.log('🔍 Étape 1: Recherche Serper');
    
    if (!this.serperApiKey) {
      throw new Error('SERPER_API_KEY manquante');
    }

    const query = `${searchTerm} ${location}`;
    const searchParams = {
      q: query,
      gl: 'fr',
      hl: 'fr',
      num: 20,
      location: location
    };

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Serper: ${data.organic?.length || 0} résultats trouvés`);
    
    return data.organic || [];
  }

  // Étape 2: Classification avec DeepSeek
  async classifyWithDeepSeek(rawResults: any[]): Promise<PipelineResult[]> {
    console.log('🧠 Étape 2: Classification DeepSeek');
    
    if (!this.deepseekApiKey) {
      console.log('⚠️ DEEPSEEK_API_KEY manquante, classification basique');
      return this.basicClassification(rawResults);
    }

    const results: PipelineResult[] = [];

    for (const result of rawResults) {
      try {
        const prompt = `
Analyse ce résultat de recherche et extrait les informations de réparateur de smartphones:

Titre: ${result.title}
Description: ${result.snippet}
URL: ${result.link}

Réponds EXCLUSIVEMENT au format JSON:
{
  "isRepairer": boolean,
  "name": "nom extrait",
  "address": "adresse extraite",
  "city": "ville extraite", 
  "postal_code": "code postal extrait",
  "phone": "téléphone extrait",
  "email": "email extrait",
  "website": "site web",
  "confidence": number (0-1)
}

Critères pour isRepairer=true:
- Mots-clés: réparation, téléphone, smartphone, mobile, iPhone, Samsung, écran, batterie
- Exclure: vente uniquement, accessoires, opérateurs
`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deepseekApiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 500
          })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) continue;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.isRepairer && parsed.confidence > 0.5) {
          results.push({
            name: parsed.name || result.title,
            address: parsed.address || 'Adresse à préciser',
            city: parsed.city || location,
            postal_code: parsed.postal_code || '00000',
            phone: parsed.phone,
            email: parsed.email,
            website: parsed.website || result.link,
            description: result.snippet,
            confidence_score: parsed.confidence,
            ai_enriched: true,
            source: 'deepseek_classification'
          });
        }
      } catch (error) {
        console.error('Erreur DeepSeek:', error);
        continue;
      }
    }

    console.log(`✅ DeepSeek: ${results.length} réparateurs classifiés`);
    return results;
  }

  // Étape 3: Enrichissement avec Mistral
  async enrichWithMistral(results: PipelineResult[]): Promise<PipelineResult[]> {
    console.log('🎯 Étape 3: Enrichissement Mistral');
    
    if (!this.mistralApiKey) {
      console.log('⚠️ MISTRAL_API_KEY manquante, enrichissement ignoré');
      return results;
    }

    const enrichedResults: PipelineResult[] = [];

    for (const result of results) {
      try {
        const prompt = `
Enrichis ces informations de réparateur avec des détails supplémentaires:

Nom: ${result.name}
Adresse: ${result.address}
Ville: ${result.city}
Description: ${result.description}

Améliore et complète au format JSON:
{
  "enhanced_description": "description enrichie",
  "services": ["service1", "service2"],
  "specialties": ["marque1", "marque2"],
  "price_range": "low|medium|high",
  "quality_score": number (0-10)
}
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
            temperature: 0.3,
            max_tokens: 400
          })
        });

        if (!response.ok) {
          enrichedResults.push(result);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
          enrichedResults.push(result);
          continue;
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          enrichedResults.push(result);
          continue;
        }

        const enrichment = JSON.parse(jsonMatch[0]);
        
        enrichedResults.push({
          ...result,
          description: enrichment.enhanced_description || result.description,
          confidence_score: (result.confidence_score || 0.5) + (enrichment.quality_score || 5) / 20
        });

      } catch (error) {
        console.error('Erreur Mistral:', error);
        enrichedResults.push(result);
      }
    }

    console.log(`✅ Mistral: ${enrichedResults.length} résultats enrichis`);
    return enrichedResults;
  }

  // Étape 4: Validation avec Perplexity
  async validateWithPerplexity(results: PipelineResult[]): Promise<PipelineResult[]> {
    console.log('🔍 Étape 4: Validation Perplexity');
    
    if (!this.perplexityApiKey) {
      console.log('⚠️ PERPLEXITY_API_KEY manquante, validation ignorée');
      return results;
    }

    const validatedResults: PipelineResult[] = [];

    for (const result of results.slice(0, 10)) { // Limite pour éviter les coûts
      try {
        const prompt = `Vérifie si "${result.name}" à "${result.city}" est vraiment un réparateur de smartphones actif. Réponds par "VALIDE" ou "INVALIDE" avec un score de confiance.`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 200
          })
        });

        if (!response.ok) {
          validatedResults.push(result);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        if (content.includes('VALIDE')) {
          validatedResults.push({
            ...result,
            confidence_score: Math.min((result.confidence_score || 0.5) + 0.2, 1.0)
          });
        } else if (!content.includes('INVALIDE')) {
          // Si pas clair, on garde avec score inchangé
          validatedResults.push(result);
        }
        // Si INVALIDE, on ne l'ajoute pas

      } catch (error) {
        console.error('Erreur Perplexity:', error);
        validatedResults.push(result);
      }
    }

    // Ajouter les résultats non validés (après les 10 premiers)
    validatedResults.push(...results.slice(10));

    console.log(`✅ Perplexity: ${validatedResults.length} résultats validés`);
    return validatedResults;
  }

  // Étape 5: Géocodage
  async geocodeResults(results: PipelineResult[]): Promise<PipelineResult[]> {
    console.log('📍 Étape 5: Géocodage');
    
    const geocodedResults: PipelineResult[] = [];

    for (const result of results) {
      try {
        const fullAddress = `${result.address}, ${result.postal_code} ${result.city}, France`;
        
        const params = new URLSearchParams({
          q: fullAddress,
          format: 'json',
          limit: '1',
          countrycodes: 'fr',
          addressdetails: '1'
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: {
            'User-Agent': 'MultiAI-Pipeline/2.0'
          }
        });

        if (!response.ok) {
          geocodedResults.push(result);
          continue;
        }

        const geoResults = await response.json();
        
        if (geoResults && geoResults.length > 0) {
          const geoResult = geoResults[0];
          const lat = parseFloat(geoResult.lat);
          const lng = parseFloat(geoResult.lon);

          if (!isNaN(lat) && !isNaN(lng)) {
            geocodedResults.push({
              ...result,
              lat: Math.round(lat * 1000000) / 1000000,
              lng: Math.round(lng * 1000000) / 1000000
            });
          } else {
            geocodedResults.push(result);
          }
        } else {
          geocodedResults.push(result);
        }

        // Pause pour respecter les limites de Nominatim
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Erreur géocodage:', error);
        geocodedResults.push(result);
      }
    }

    console.log(`✅ Géocodage: ${geocodedResults.length} résultats géocodés`);
    return geocodedResults;
  }

  private basicClassification(rawResults: any[]): PipelineResult[] {
    return rawResults
      .filter(result => {
        const text = (result.title + ' ' + result.snippet).toLowerCase();
        const hasRepairKeywords = ['réparation', 'réparer', 'téléphone', 'smartphone', 'mobile', 'iphone', 'samsung'].some(keyword => text.includes(keyword));
        const hasExcludeKeywords = ['vente', 'boutique', 'magasin', 'opérateur'].some(keyword => text.includes(keyword));
        return hasRepairKeywords && !hasExcludeKeywords;
      })
      .map(result => ({
        name: result.title,
        address: 'Adresse à préciser',
        city: 'Ville à préciser',
        postal_code: '00000',
        website: result.link,
        description: result.snippet,
        confidence_score: 0.7,
        ai_enriched: false,
        source: 'basic_classification'
      }));
  }

  async runPipeline(searchTerm: string, location: string): Promise<PipelineResult[]> {
    console.log(`🚀 Démarrage pipeline Multi-IA: ${searchTerm} à ${location}`);

    // Étape 1: Recherche
    const serperResults = await this.searchWithSerper(searchTerm, location);
    
    // Étape 2: Classification
    const classifiedResults = await this.classifyWithDeepSeek(serperResults);
    
    // Étape 3: Enrichissement
    const enrichedResults = await this.enrichWithMistral(classifiedResults);
    
    // Étape 4: Validation
    const validatedResults = await this.validateWithPerplexity(enrichedResults);
    
    // Étape 5: Géocodage
    const finalResults = await this.geocodeResults(validatedResults);

    console.log(`🎉 Pipeline terminé: ${finalResults.length} résultats finaux`);
    return finalResults;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm, location, testMode } = await req.json();

    console.log(`🚀 Multi-AI Pipeline: ${searchTerm} à ${location}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const pipeline = new MultiAIPipeline(supabaseUrl, supabaseKey);
    const results = await pipeline.runPipeline(searchTerm, location);

    // Sauvegarde en base si pas en mode test
    if (!testMode && results.length > 0) {
      console.log('💾 Sauvegarde en base de données');
      
      for (const result of results) {
        try {
          const { error } = await pipeline.supabase
            .from('repairers')
            .upsert({
              name: result.name,
              address: result.address,
              city: result.city,
              postal_code: result.postal_code,
              phone: result.phone,
              email: result.email,
              website: result.website,
              description: result.description,
              lat: result.lat,
              lng: result.lng,
              deepseek_confidence: result.confidence_score,
              scraped_at: new Date().toISOString(),
              source: 'multi_ai_pipeline'
            }, {
              onConflict: 'name,postal_code'
            });

          if (error) {
            console.error('Erreur sauvegarde:', error);
          }
        } catch (error) {
          console.error('Erreur sauvegarde individuelle:', error);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results: results,
      metadata: {
        pipeline_steps: ['serper', 'deepseek', 'mistral', 'perplexity', 'geocoding'],
        total_results: results.length,
        test_mode: testMode || false,
        ai_apis_used: {
          serper: !!Deno.env.get('SERPER_API_KEY'),
          deepseek: !!Deno.env.get('DEEPSEEK_API_KEY'),
          mistral: !!Deno.env.get('MISTRAL_API_KEY'),
          perplexity: !!Deno.env.get('PERPLEXITY_API_KEY')
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Erreur Pipeline Multi-IA:', error);
    
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