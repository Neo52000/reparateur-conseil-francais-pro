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
    
    console.log(`🤖 Generating content for: ${fieldLabel} (${fieldType})`);

    // Construire le prompt système adapté
    let systemPrompt = systemContext || "Vous êtes un assistant de rédaction professionnel.";
    
    if (fieldType === 'short') {
      systemPrompt += " Générez un texte court, concis et impactant (maximum 160 caractères pour les meta descriptions, ou une ligne pour les titres).";
    } else {
      systemPrompt += " Générez un texte détaillé, engageant et professionnel (2-4 paragraphes).";
    }

    const userPrompt = `Contexte: ${fieldLabel}\n\nInstructions: ${prompt}\n\nGénère le contenu demandé en français, directement utilisable sans formatage markdown.`;
    const maxTokens = fieldType === 'short' ? 100 : 500;

    let generatedContent = null;
    let usedProvider = '';

    // Essayer Lovable AI en premier
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        console.log('🔹 Trying Lovable AI...');
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: maxTokens
          }),
        });

        if (response.ok) {
          const data = await response.json();
          generatedContent = data.choices?.[0]?.message?.content?.trim();
          if (generatedContent) {
            usedProvider = 'Lovable AI (Gemini)';
            console.log('✅ Lovable AI succeeded');
          }
        } else if (response.status === 402) {
          console.log('⚠️ Lovable AI: No credits, trying fallback...');
        } else if (response.status === 429) {
          console.log('⚠️ Lovable AI: Rate limited, trying fallback...');
        }
      } catch (error: unknown) {
        console.log('⚠️ Lovable AI failed:', (error as Error).message);
      }
    }

    // Fallback 1: OpenAI
    if (!generatedContent) {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        try {
          console.log('🔹 Trying OpenAI...');
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: maxTokens
            }),
          });

          if (response.ok) {
            const data = await response.json();
            generatedContent = data.choices?.[0]?.message?.content?.trim();
            if (generatedContent) {
              usedProvider = 'OpenAI (GPT-4o-mini)';
              console.log('✅ OpenAI succeeded');
            }
          }
        } catch (error: unknown) {
          console.log('⚠️ OpenAI failed:', (error as Error).message);
        }
      }
    }

    // Fallback 2: Mistral
    if (!generatedContent) {
      const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL');
      if (MISTRAL_API_KEY) {
        try {
          console.log('🔹 Trying Mistral...');
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${MISTRAL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: maxTokens
            }),
          });

          if (response.ok) {
            const data = await response.json();
            generatedContent = data.choices?.[0]?.message?.content?.trim();
            if (generatedContent) {
              usedProvider = 'Mistral';
              console.log('✅ Mistral succeeded');
            }
          }
        } catch (error: unknown) {
          console.log('⚠️ Mistral failed:', (error as Error).message);
        }
      }
    }

    if (!generatedContent) {
      throw new Error('Aucune API IA disponible. Vérifiez vos clés API.');
    }

    console.log(`✅ Content generated successfully with ${usedProvider} (${generatedContent.length} chars)`);

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      provider: usedProvider
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
