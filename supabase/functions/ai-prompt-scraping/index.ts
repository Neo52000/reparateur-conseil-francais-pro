
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
    const mockResults = generateEnhancedMockResults(analysis);
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

function generateEnhancedMockResults(analysis: PromptAnalysis): any[] {
  const mockData = [];
  const businessTypes = analysis.business_types || ['réparateur'];
  const location = analysis.location || 'France';
  const department = analysis.department || '01';

  // Réparateurs spécialisés avec micro-soudure
  const specializedRepairers = [
    {
      nom: "Docteur IT / Acta Micro",
      adresse: "123 Avenue de la Réparation",
      city: "Bourg-en-Bresse",
      services: "Réparation smartphones, tablettes, ordinateurs",
      specialites: "Micro-soudure, réparation high-tech",
      telephone: "04 74 XX XX XX",
      website: "www.docteur-it.fr",
      email: "contact@docteur-it.fr",
      department: department,
      verified: true,
      category: "specialise"
    },
    {
      nom: "CHRONOPHONE",
      adresse: "45 Rue du Commerce",
      city: "Bourg-en-Bresse",
      services: "Réparation smartphones et tablettes",
      specialites: "Magasin spécialisé",
      telephone: "04 74 XX XX XX",
      website: "chronophone01.fr",
      email: "info@chronophone01.fr",
      department: department,
      verified: true,
      category: "specialise"
    },
    {
      nom: "Bresse Media Phone",
      adresse: "67 Boulevard Principal",
      city: "Bourg-en-Bresse",
      services: "Réparation téléphones portables",
      specialites: "+20 ans d'expérience",
      telephone: "04 74 XX XX XX",
      website: null,
      email: "contact@bresse-media-phone.fr",
      department: department,
      verified: true,
      category: "specialise"
    },
    {
      nom: "Ain Point Phone",
      adresse: "89 Place du Marché",
      city: "Bourg-en-Bresse",
      services: "Réparation iPhone, iPad, iPod, smartphones",
      specialites: "Pièces détachées et accessoires",
      telephone: "04 74 XX XX XX",
      website: "ain-point-phone.fr",
      email: "service@ain-point-phone.fr",
      department: department,
      verified: true,
      category: "specialise"
    },
    {
      nom: "Cash and Repair",
      adresse: "12 Rue de la Technologie",
      city: "Bourg-en-Bresse",
      services: "Réparation smartphones et tablettes",
      specialites: "Micro-soudure disponible",
      telephone: "04 74 XX XX XX",
      website: "ateliers.cashandrepair.fr",
      email: "bourg@cashandrepair.fr",
      department: department,
      verified: true,
      category: "specialise"
    }
  ];

  // Grandes enseignes avec corners
  const chainStores = [
    {
      nom: "Save (Corner Fnac)",
      adresse: "Magasin Fnac, Centre Commercial",
      city: "Viriat",
      services: "Réparation smartphones et tablettes",
      specialites: "Réparation en 40 min (80% des cas), garantie 1 an",
      telephone: "04 74 XX XX XX",
      website: "magasin.save.co",
      email: "viriat@save.co",
      department: department,
      verified: true,
      category: "enseigne"
    },
    {
      nom: "Mister Minit",
      adresse: "Centre Commercial Carrefour",
      city: "Bourg-en-Bresse",
      services: "Réparation smartphones",
      specialites: "Remplacement écrans, batteries, protections",
      telephone: "04 74 XX XX XX",
      website: "misterminit.eu",
      email: "bourg@misterminit.eu",
      department: department,
      verified: true,
      category: "enseigne"
    },
    {
      nom: "WeFix",
      adresse: "Plusieurs emplacements",
      city: `Département ${department}`,
      services: "Réparation smartphones et tablettes",
      specialites: "Réseau national spécialisé",
      telephone: "Service client national",
      website: "boutique.wefix.net",
      email: "contact@wefix.net",
      department: department,
      verified: true,
      category: "enseigne"
    }
  ];

  // Boutiques opérateurs
  const operatorStores = [
    {
      nom: "Orange",
      adresse: "1 Rue Montaigne",
      city: "Oyonnax (01100)",
      services: "Vente smartphones, tablettes, montres connectées",
      specialites: "Boutique officielle",
      telephone: "Tél. disponible sur place",
      website: "orange.fr",
      email: "oyonnax@orange.fr",
      department: department,
      verified: true,
      category: "operateur"
    },
    {
      nom: "SFR",
      adresse: "93 rue Anatole France",
      city: "Oyonnax (01100)",
      services: "Vente smartphones, tablettes, montres connectées",
      specialites: "Boutique officielle",
      telephone: "04 74 XX XX XX",
      website: "sfr.fr",
      email: "oyonnax@sfr.fr",
      department: department,
      verified: true,
      category: "operateur"
    },
    {
      nom: "Free",
      adresse: "22 rue Gambetta",
      city: "Bourg-en-Bresse (01000)",
      services: "Vente smartphones, tablettes",
      specialites: "Free Center",
      telephone: "10 44",
      website: "free.fr",
      email: "bourg@free.fr",
      department: department,
      verified: true,
      category: "operateur"
    },
    {
      nom: "Orange",
      adresse: "Centre commercial",
      city: "Bourg-en-Bresse",
      services: "Vente smartphones, tablettes, montres connectées",
      specialites: "Boutique/Corner",
      telephone: "04 74 XX XX XX",
      website: "orange.fr",
      email: "bourg@orange.fr",
      department: department,
      verified: true,
      category: "operateur"
    }
  ];

  // Combinaison de toutes les catégories
  mockData.push(...specializedRepairers, ...chainStores, ...operatorStores);

  return mockData.slice(0, analysis.max_results || 20);
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
