import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const contentPrompts = {
  proximite: {
    ad_title: "Créez un titre publicitaire chaleureux et local pour {item_name}. Mettez l'accent sur la proximité, la confiance et le service de quartier. Maximum 60 caractères.",
    ad_description: "Rédigez une description publicitaire conviviale pour {item_name}. Insistez sur l'expertise locale, la rapidité et la relation de confiance. Maximum 160 caractères.",
    image: "Image professionnelle de {item_name} dans un atelier de réparation local et accueillant, avec des mains expertes au travail",
    video: "Vidéo courte montrant la réparation de {item_name} par un expert local, ambiance chaleureuse et professionnelle"
  },
  technique: {
    ad_title: "Créez un titre publicitaire technique et précis pour {item_name}. Mettez l'accent sur l'expertise, la précision et la qualité professionnelle. Maximum 60 caractères.",
    ad_description: "Rédigez une description technique détaillée pour {item_name}. Insistez sur les compétences spécialisées, les outils professionnels et la garantie. Maximum 160 caractères.",
    image: "Image technique détaillée de {item_name} avec outils de précision, microscopes et équipements professionnels",
    video: "Vidéo technique montrant les étapes précises de réparation de {item_name} avec équipements spécialisés"
  },
  urgence: {
    ad_title: "Créez un titre publicitaire urgent pour {item_name}. Mettez l'accent sur la rapidité, l'efficacité et la disponibilité immédiate. Maximum 60 caractères.",
    ad_description: "Rédigez une description urgente pour {item_name}. Insistez sur la réparation express, les délais courts et la disponibilité. Maximum 160 caractères.",
    image: "Image dynamique de {item_name} en cours de réparation rapide, chronomètre visible, atmosphère d'urgence contrôlée",
    video: "Vidéo en accéléré de la réparation express de {item_name}, montrant l'efficacité et la rapidité"
  },
  humour: {
    ad_title: "Créez un titre publicitaire léger et sympathique pour {item_name}. Utilisez un ton amical avec une pointe d'humour, sans être déplacé. Maximum 60 caractères.",
    ad_description: "Rédigez une description amusante pour {item_name}. Ton décontracté et sympathique, avec une approche humaine et accessible. Maximum 160 caractères.",
    image: "Image créative et sympathique de {item_name} avec une mise en scène amusante mais professionnelle",
    video: "Vidéo légère montrant la réparation de {item_name} avec des éléments visuels amusants et sympathiques"
  },
  premium: {
    ad_title: "Créez un titre publicitaire haut de gamme pour {item_name}. Mettez l'accent sur l'excellence, le luxe et la qualité supérieure. Maximum 60 caractères.",
    ad_description: "Rédigez une description premium pour {item_name}. Insistez sur l'expertise d'exception, la qualité supérieure et le service exclusif. Maximum 160 caractères.",
    image: "Image premium de {item_name} dans un environnement luxueux, éclairage parfait, finitions haut de gamme",
    video: "Vidéo premium montrant la réparation minutieuse de {item_name} avec des gestes d'expert et finitions parfaites"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content_type, source_item, style, target_audience, additional_context } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Préparer le prompt selon le type de contenu et le style
    const promptTemplate = contentPrompts[style]?.[content_type] || contentPrompts.proximite[content_type];
    const basePrompt = promptTemplate.replace('{item_name}', source_item.name);
    
    let fullPrompt = basePrompt;
    if (additional_context) {
      fullPrompt += `\n\nContexte supplémentaire: ${additional_context}`;
    }
    if (target_audience) {
      fullPrompt += `\n\nAudience cible: ${target_audience}`;
    }
    if (source_item.description) {
      fullPrompt += `\n\nDescription du produit/service: ${source_item.description}`;
    }
    if (source_item.price) {
      fullPrompt += `\n\nPrix: ${source_item.price}€`;
    }

    let generatedContent;
    let aiModel;
    let qualityScore = 8.5;

    if (content_type === 'image') {
      // Génération d'image avec un placeholder pour l'instant
      generatedContent = {
        image_url: `https://placehold.co/800x600/6366f1/white?text=${encodeURIComponent(source_item.name)}`,
        alt_text: `Image générée pour ${source_item.name}`,
        style_applied: style
      };
      aiModel = 'DALL-E 3 (placeholder)';
    } else {
      // Génération de texte avec OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en rédaction publicitaire spécialisé dans la réparation de smartphones et accessoires. Tu crées du contenu adapté au style demandé : ${style}. Reste professionnel, persuasif et respecte les limites de caractères.`
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          max_tokens: content_type === 'ad_title' ? 100 : 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content.trim();
      
      generatedContent = {
        text: generatedText,
        style_applied: style,
        character_count: generatedText.length
      };
      aiModel = 'GPT-4';
      
      // Calculer un score de qualité basé sur la longueur et les mots-clés
      const hasKeywords = source_item.name.toLowerCase().split(' ').some(word => 
        generatedText.toLowerCase().includes(word)
      );
      const isWithinLimit = content_type === 'ad_title' ? 
        generatedText.length <= 60 : generatedText.length <= 160;
      
      qualityScore = hasKeywords && isWithinLimit ? 9.2 : 7.8;
    }

    // Calculer le coût (simulation)
    const generationCost = content_type === 'image' ? 0.04 : 0.02;

    // Sauvegarder dans la base de données
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_generated_content')
      .insert({
        repairer_id: req.headers.get('user-id') || 'system',
        content_type,
        source_item_id: source_item.id,
        ai_model: aiModel,
        generation_prompt: fullPrompt,
        generated_content: generatedContent,
        style_used: style,
        generation_cost: generationCost,
        quality_score: qualityScore,
        usage_count: 0
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erreur sauvegarde:', saveError);
      // Continue même en cas d'erreur de sauvegarde
    }

    return new Response(JSON.stringify({
      id: savedContent?.id || 'temp-id',
      content_type,
      generated_content: generatedContent,
      ai_model: aiModel,
      generation_prompt: fullPrompt,
      quality_score: qualityScore,
      style_used: style,
      generation_cost: generationCost,
      created_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération contenu IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur lors de la génération',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});