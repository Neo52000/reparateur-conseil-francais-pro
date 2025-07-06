import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PageSpeedResult {
  mobile: number;
  desktop: number;
  opportunities: string[];
  diagnostics: string[];
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Pour cette implémentation, nous retournons des données simulées
    // En production, vous devriez utiliser l'API PageSpeed Insights réelle
    const mockResult: PageSpeedResult = {
      mobile: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
      desktop: Math.floor(Math.random() * 20) + 80, // Score entre 80-100
      opportunities: generateOpportunities(),
      diagnostics: generateDiagnostics(),
      timestamp: new Date().toISOString()
    };

    console.log(`PageSpeed analysis for ${url}:`, mockResult);

    return new Response(
      JSON.stringify(mockResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in pagespeed-analysis:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateOpportunities(): string[] {
  const opportunities = [
    'Éliminer les ressources qui bloquent le rendu',
    'Supprimer le CSS inutilisé',
    'Diffuser des images au format WebP',
    'Supprimer le JavaScript inutilisé',
    'Précharger les demandes de clés',
    'Réduire l\'impact du code tiers',
    'Éviter d\'énormes décalages de mise en page',
    'Optimiser les images',
    'Activer la compression de texte',
    'Réduire les temps de réponse du serveur (TTFB)'
  ];
  
  // Retourner 3-5 recommandations aléatoires
  const shuffled = opportunities.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
}

function generateDiagnostics(): string[] {
  const diagnostics = [
    'Le DOM contient de nombreux nœuds',
    'Les images ont des dimensions correctes',
    'Les polices Web se chargent pendant l\'affichage du texte',
    'Les éléments ayant un aspect [width] ou [height] ont un ratio d\'aspect explicite',
    'La page évite les API obsolètes',
    'Les métas de viewport sont correctement configurées',
    'L\'arbre DOM a une profondeur raisonnable',
    'Les ressources critiques utilisent un préchargement approprié'
  ];
  
  // Retourner 2-4 diagnostics aléatoires
  const shuffled = diagnostics.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
}