import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { city, serviceType, title } = await req.json();

    if (!city || !serviceType) {
      throw new Error('Paramètres city et serviceType requis');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('Clé Lovable API non configurée');
    }

    console.log(`🎨 Génération OG image pour ${city} - ${serviceType}`);

    // Prompt pour générer l'image OG
    const prompt = `Create a professional Open Graph image for smartphone repair services in ${city}. 
Modern minimalist design with:
- Blue and orange color scheme
- City name "${city}" prominently displayed
- Icon of a smartphone being repaired
- Clean, professional look
- Text: "Réparation ${serviceType} ${city}"
- Dimensions: 1200x630px (Open Graph standard)
Style: flat design, technology-focused, trustworthy`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024
      })
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limits exceeded',
        message: 'Trop de requêtes, veuillez réessayer plus tard.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment required',
        message: 'Crédits Lovable AI épuisés.'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      throw new Error(`Erreur API Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    
    // Extraire l'URL de l'image générée
    // Note: Le format exact dépend de la réponse de l'API Gemini Image
    const imageUrl = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      throw new Error('Aucune image générée');
    }

    console.log('✅ Image OG générée avec succès');

    return new Response(JSON.stringify({
      success: true,
      imageUrl,
      model: 'google/gemini-2.5-flash-image-preview'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur génération OG image:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
