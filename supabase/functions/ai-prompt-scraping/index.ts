
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromptAnalysis {
  business_types: string[];
  services: string[];
  location: string;
  department?: string;
  output_format: string;
  strategy: string;
  keywords: string[];
  max_results?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI Prompt Scraping function called');
    
    // Vérifier la requête
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Format de requête invalide',
          details: 'Le body de la requête doit être du JSON valide'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const { action, prompt, ai_model, output_format, analysis } = requestBody;

    console.log(`📝 Détails de la requête:`, { 
      action, 
      ai_model, 
      promptLength: prompt?.length || 0,
      output_format 
    });

    // Validation des paramètres
    if (!action || !['analyze', 'execute'].includes(action)) {
      console.error('❌ Action invalide:', action);
      return new Response(
        JSON.stringify({ 
          error: 'Action invalide',
          details: 'L\'action doit être "analyze" ou "execute"'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    if (action === 'analyze') {
      if (!prompt || !prompt.trim()) {
        console.error('❌ Prompt manquant pour l\'analyse');
        return new Response(
          JSON.stringify({ 
            error: 'Prompt requis',
            details: 'Un prompt est nécessaire pour l\'analyse'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }

      return await analyzePrompt(prompt, ai_model || 'deepseek', output_format || 'tableau');
    } 
    
    if (action === 'execute') {
      if (!analysis) {
        console.error('❌ Analyse manquante pour l\'exécution');
        return new Response(
          JSON.stringify({ 
            error: 'Analyse requise',
            details: 'Une analyse est nécessaire avant l\'exécution'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }

      return await executeScraping(prompt, ai_model || 'deepseek', output_format || 'tableau', analysis);
    }

  } catch (error) {
    console.error('❌ Erreur générale dans AI Prompt Scraping:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message || 'Une erreur inattendue s\'est produite',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

async function analyzePrompt(prompt: string, aiModel: string, outputFormat: string) {
  console.log('🧠 Début analyse du prompt avec', aiModel);

  try {
    // Pour le moment, on fait une analyse simulée pour éviter les erreurs d'API
    console.log('📝 Analyse simulée du prompt (longueur:', prompt.length, 'caractères)');
    
    // Analyse basique du prompt pour extraire des informations
    const lowerPrompt = prompt.toLowerCase();
    
    // Détection des types d'entreprises
    const businessTypes = [];
    if (lowerPrompt.includes('réparateur') || lowerPrompt.includes('reparateur')) businessTypes.push('réparateur');
    if (lowerPrompt.includes('smartphone') || lowerPrompt.includes('téléphone')) businessTypes.push('réparateur téléphone');
    if (lowerPrompt.includes('ordinateur') || lowerPrompt.includes('informatique')) businessTypes.push('réparateur informatique');
    if (lowerPrompt.includes('boutique') || lowerPrompt.includes('magasin')) businessTypes.push('boutique');
    if (businessTypes.length === 0) businessTypes.push('réparateur général');

    // Détection des services
    const services = [];
    if (lowerPrompt.includes('réparation')) services.push('réparation');
    if (lowerPrompt.includes('vente') || lowerPrompt.includes('vendent')) services.push('vente');
    if (lowerPrompt.includes('soudure')) services.push('micro-soudure');
    if (lowerPrompt.includes('écran')) services.push('réparation écran');
    if (services.length === 0) services.push('réparation générale');

    // Détection de la localisation
    let location = 'France';
    let department = null;
    const deptMatch = prompt.match(/département\s+(\d{2,3})/i) || prompt.match(/\b(\d{2})\b/);
    if (deptMatch) {
      department = deptMatch[1].padStart(2, '0');
      location = `Département ${department}`;
    }

    // Détection du format
    let detectedFormat = outputFormat;
    if (lowerPrompt.includes('tableau')) detectedFormat = 'tableau';
    if (lowerPrompt.includes('csv')) detectedFormat = 'csv';
    if (lowerPrompt.includes('liste')) detectedFormat = 'liste';

    // Génération des mots-clés
    const keywords = [...businessTypes, ...services];
    if (department) keywords.push(`département ${department}`);

    const analysisResult: PromptAnalysis = {
      business_types: businessTypes,
      services: services,
      location: location,
      department: department,
      output_format: detectedFormat,
      strategy: `Recherche de ${businessTypes.join(', ')} dans ${location} avec focus sur ${services.join(', ')}`,
      keywords: keywords,
      max_results: 50
    };

    console.log('✅ Analyse terminée:', analysisResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult,
        original_prompt: prompt,
        method: 'analysis_simulée'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur d\'analyse',
        details: error.message || 'Impossible d\'analyser le prompt',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}

async function executeScraping(prompt: string, aiModel: string, outputFormat: string, analysis: PromptAnalysis) {
  console.log('🚀 Exécution du scraping simulé');

  try {
    // Génération de données de test basées sur l'analyse
    const mockResults = generateMockResults(analysis);
    const formattedResults = formatResults(mockResults, analysis.output_format);

    console.log(`✅ Scraping simulé terminé: ${formattedResults.length} résultats générés`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: formattedResults,
        analysis: analysis,
        total_count: formattedResults.length,
        method: 'scraping_simulé',
        note: "Résultats simulés - intégration du vrai scraping en cours"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors du scraping:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur de scraping',
        details: error.message || 'Impossible d\'exécuter le scraping',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}

function generateMockResults(analysis: PromptAnalysis): any[] {
  const mockData = [];
  const businessTypes = analysis.business_types || ['réparateur'];
  const location = analysis.location || 'France';
  const department = analysis.department || '01';

  const resultCount = Math.min(analysis.max_results || 20, 25);

  for (let i = 0; i < resultCount; i++) {
    const businessType = businessTypes[i % businessTypes.length];
    mockData.push({
      nom: `${businessType} ${i + 1}`,
      adresse: `${10 + i} rue de la Réparation, ${location}`,
      telephone: `0${Math.floor(Math.random() * 9) + 1}${Math.random().toString().slice(2, 10)}`,
      services: analysis.services?.slice(0, 2).join(', ') || 'Réparation générale',
      department: department,
      verified: Math.random() > 0.3,
      email: `contact@${businessType.replace(/\s+/g, '')}${i + 1}.fr`,
      website: Math.random() > 0.5 ? `www.${businessType.replace(/\s+/g, '')}${i + 1}.fr` : null,
      specialites: analysis.keywords?.slice(0, 3).join(', ') || 'Smartphone, Tablette',
      created_at: new Date().toISOString()
    });
  }

  return mockData;
}

function formatResults(results: any[], format: string): any[] {
  switch (format) {
    case 'tableau':
      return results;
    case 'liste':
      return results.map(r => ({ 
        nom: r.nom, 
        adresse: r.adresse, 
        telephone: r.telephone 
      }));
    case 'json':
      return results;
    case 'csv':
      return results; // Le frontend se chargera de la conversion CSV
    default:
      return results;
  }
}
