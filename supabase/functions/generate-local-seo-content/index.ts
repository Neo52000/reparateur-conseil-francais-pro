import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEOGenerationRequest {
  city: string;
  serviceType: string;
  repairerCount: number;
  averageRating: number;
  existingContent?: string;
  regenerate?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { city, serviceType, repairerCount, averageRating, existingContent, regenerate } = await req.json() as SEOGenerationRequest;

    // Prompts spécialisés par type de service
    const servicePrompts = {
      smartphone: {
        expertise: "réparation de smartphones (écrans, batteries, connecteurs, problèmes logiciels)",
        problems: "écran cassé, batterie qui ne tient plus, problème de charge, dysfonctionnements",
        devices: "iPhone, Samsung Galaxy, Huawei, Xiaomi et toutes marques"
      },
      tablette: {
        expertise: "réparation de tablettes tactiles (écrans, connecteurs, haut-parleurs)",
        problems: "écran fissuré, problème tactile, connecteur de charge défaillant",
        devices: "iPad, Samsung Galaxy Tab, Lenovo Tab et toutes marques"
      },
      ordinateur: {
        expertise: "réparation d'ordinateurs (portables, fixes, composants)",
        problems: "écran noir, surchauffe, virus, lenteurs système",
        devices: "PC portables, ordinateurs de bureau, MacBook"
      }
    };

    const currentService = servicePrompts[serviceType as keyof typeof servicePrompts] || servicePrompts.smartphone;

    const prompt = `Tu es un expert en rédaction SEO local pour une marketplace de réparateurs. Génère un contenu unique et engageant pour une page dédiée à la ${currentService.expertise} à ${city}.

CONTEXTE:
- Ville: ${city}  
- Service: ${serviceType}
- Nombre de réparateurs: ${repairerCount}
- Note moyenne: ${averageRating}/5
- Appareils concernés: ${currentService.devices}
- Problèmes courants: ${currentService.problems}

INSTRUCTIONS:
1. Génère 2 paragraphes distincts (150-200 mots chacun)
2. Utilise un ton professionnel mais accessible
3. Intègre naturellement les mots-clés locaux
4. Mentionne les avantages concrets (proximité, rapidité, garantie)
5. Évite les répétitions et reste authentique
6. ${regenerate ? 'IMPORTANT: Génère un contenu totalement différent du précédent' : ''}

${existingContent && regenerate ? `CONTENU EXISTANT À ÉVITER: ${existingContent}` : ''}

FORMAT ATTENDU:
{
  "paragraph1": "Premier paragraphe...",
  "paragraph2": "Deuxième paragraphe...",
  "title": "Titre SEO optimisé avec ville",
  "metaDescription": "Meta description 140-160 caractères avec émojis",
  "h1": "H1 avec nom de ville"
}`;

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');

    let generatedContent;
    
    if (mistralKey) {
      // Utiliser Mistral en priorité
      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: 'Tu es un expert en rédaction SEO local spécialisé dans les services de réparation. Réponds uniquement en JSON valide.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      const mistralData = await mistralResponse.json();
      const content = mistralData.choices?.[0]?.message?.content;
      
      try {
        generatedContent = JSON.parse(content);
      } catch {
        throw new Error('Format de réponse invalide de Mistral');
      }
    } else if (openAIKey) {
      // Fallback sur OpenAI
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Tu es un expert en rédaction SEO local. Réponds uniquement en JSON valide.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      const openAIData = await openAIResponse.json();
      const content = openAIData.choices?.[0]?.message?.content;
      
      try {
        generatedContent = JSON.parse(content);
      } catch {
        throw new Error('Format de réponse invalide d\'OpenAI');
      }
    } else {
      throw new Error('Aucune clé API IA configurée');
    }

    // Validation du contenu généré
    if (!generatedContent.paragraph1 || !generatedContent.paragraph2 || !generatedContent.title) {
      throw new Error('Contenu généré incomplet');
    }

    // Limitation des caractères
    if (generatedContent.metaDescription && generatedContent.metaDescription.length > 160) {
      generatedContent.metaDescription = generatedContent.metaDescription.substring(0, 157) + '...';
    }

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      model: mistralKey ? 'mistral-large-latest' : 'gpt-4o-mini',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération SEO:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});