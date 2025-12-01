import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, fieldType, fieldLabel, systemContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`🤖 Generating content for: ${fieldLabel} (${fieldType})`);

    // Construire le prompt système adapté
    let systemPrompt = systemContext || "Vous êtes un assistant de rédaction professionnel.";
    
    if (fieldType === 'short') {
      systemPrompt += " Générez un texte court, concis et impactant (maximum 160 caractères pour les meta descriptions, ou une ligne pour les titres).";
    } else {
      systemPrompt += " Générez un texte détaillé, engageant et professionnel (2-4 paragraphes).";
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Contexte: ${fieldLabel}\n\nInstructions: ${prompt}\n\nGénère le contenu demandé en français, directement utilisable sans formatage markdown.`
          }
        ],
        temperature: 0.7,
        max_tokens: fieldType === 'short' ? 100 : 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requêtes atteinte. Réessayez dans quelques instants.');
      }
      if (response.status === 402) {
        throw new Error('Crédits insuffisants. Veuillez ajouter des crédits à votre workspace.');
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('Erreur lors de la génération du contenu');
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error('Aucun contenu généré');
    }

    console.log(`✅ Content generated successfully (${generatedContent.length} chars)`);

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-helper:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
