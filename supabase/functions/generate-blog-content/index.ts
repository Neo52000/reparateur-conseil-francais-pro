
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility functions
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'été';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}

function parseGeneratedContent(rawContent: string) {
  const titleMatch = rawContent.match(/TITRE:\s*(.+)/);
  const excerptMatch = rawContent.match(/EXTRAIT:\s*(.+?)(?=\nCONTENU:)/s);
  const contentMatch = rawContent.match(/CONTENU:\s*([\s\S]+)/);

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Article généré par IA',
    excerpt: excerptMatch ? excerptMatch[1].trim() : '',
    content: contentMatch ? contentMatch[1].trim() : rawContent
  };
}

// AI Generation functions
async function generateWithPerplexity(prompt: string): Promise<string> {
  if (!perplexityApiKey) {
    throw new Error('Clé API Perplexity non configurée');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert rédacteur pour un blog de réparation de smartphones. 
          Génère un article de blog professionnel en français avec des informations actualisées et précises.
          Structure ton article ainsi :
          1. Un titre accrocheur
          2. Un extrait de 2-3 phrases
          3. Un contenu détaillé et informatif (800-1200 mots)
          
          Format de réponse :
          TITRE: [titre ici]
          EXTRAIT: [extrait ici]
          CONTENU: [contenu ici]`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Perplexity API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithMistral(prompt: string): Promise<string> {
  if (!mistralApiKey) {
    throw new Error('Clé API Mistral non configurée');
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert rédacteur pour un blog de réparation de smartphones. 
          Génère un article de blog professionnel en français avec :
          1. Un titre accrocheur
          2. Un extrait de 2-3 phrases
          3. Un contenu détaillé et informatif (800-1200 mots)
          
          Format de réponse :
          TITRE: [titre ici]
          EXTRAIT: [extrait ici]
          CONTENU: [contenu ici]`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Mistral API error:', response.status, errorText);
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('Clé API OpenAI non configurée');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert rédacteur pour un blog de réparation de smartphones. 
          Génère un article de blog professionnel en français avec :
          1. Un titre accrocheur
          2. Un extrait de 2-3 phrases
          3. Un contenu détaillé et informatif (800-1200 mots)
          
          Format de réponse :
          TITRE: [titre ici]
          EXTRAIT: [extrait ici]
          CONTENU: [contenu ici]`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error:', response.status, errorText);
    
    // Parser l'erreur pour avoir plus de détails
    let errorDetail = `OpenAI API error: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorDetail = errorData.error.message;
      }
    } catch (e) {
      // Garder le message par défaut
    }
    
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template_id, prompt, ai_model, category_id, visibility, custom_variables } = await req.json();

    if (!template_id && !prompt) {
      console.error('❌ Template ID ou prompt requis');
      return new Response(JSON.stringify({ 
        error: 'Template ID ou prompt requis',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🚀 Generating blog content with:', { template_id, ai_model, visibility });

    let finalPrompt = prompt;
    let finalModel = ai_model || 'perplexity'; // Changer le défaut vers Perplexity
    let finalCategoryId = category_id;
    let finalVisibility = visibility || 'public';

    // Si un template_id est fourni, récupérer le template
    if (template_id) {
      console.log('📋 Fetching template:', template_id);
      const { data: template, error: templateError } = await supabase
        .from('blog_generation_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (templateError) {
        console.error('❌ Template error:', templateError);
        return new Response(JSON.stringify({ 
          error: `Impossible de récupérer le template: ${templateError.message}`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!template.prompt_template) {
        console.error('❌ Template has no prompt_template');
        return new Response(JSON.stringify({ 
          error: `Le template sélectionné n'a pas de contenu de prompt`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      finalPrompt = template.prompt_template;
      finalModel = ai_model || template.ai_model || 'perplexity';
      finalCategoryId = template.category_id;
      finalVisibility = template.visibility;
      console.log('✅ Template loaded successfully');
    }

    // Remplacer les variables dans le prompt
    if (custom_variables) {
      Object.entries(custom_variables).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), value as string);
      });
    }

    // Ajouter des variables par défaut
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentSeason = getCurrentSeason();
    finalPrompt = finalPrompt
      .replace(/{date}/g, currentDate)
      .replace(/{saison}/g, currentSeason);

    console.log('📝 Final prompt prepared, length:', finalPrompt.length);
    console.log('🤖 Using AI model:', finalModel);

    // Vérifier la disponibilité des clés API
    const availableAPIs = {
      perplexity: !!perplexityApiKey,
      openai: !!openAIApiKey,
      mistral: !!mistralApiKey
    };

    console.log('🔑 Available APIs:', availableAPIs);

    if (!availableAPIs.perplexity && !availableAPIs.openai && !availableAPIs.mistral) {
      console.error('❌ Aucune clé API disponible');
      return new Response(JSON.stringify({ 
        error: 'Aucune clé API configurée (OpenAI, Mistral ou Perplexity)',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer le contenu selon le modèle choisi avec fallback
    let usedModel = finalModel;

    // Essayer avec l'IA demandée, puis fallback sur les autres
    let result = '';
    try {
      if (finalModel === 'perplexity' && perplexityApiKey) {
        console.log('🔄 Attempting Perplexity generation...');
        result = await generateWithPerplexity(finalPrompt);
      } else if (finalModel === 'mistral' && mistralApiKey) {
        console.log('🔄 Attempting Mistral generation...');
        result = await generateWithMistral(finalPrompt);
      } else if (finalModel === 'openai' && openAIApiKey) {
        console.log('🔄 Attempting OpenAI generation...');
        result = await generateWithOpenAI(finalPrompt);
      } else {
        // Fallback sur la première IA disponible
        if (perplexityApiKey) {
          console.log('🔄 Falling back to Perplexity...');
          result = await generateWithPerplexity(finalPrompt);
          usedModel = 'perplexity';
        } else if (mistralApiKey) {
          console.log('🔄 Falling back to Mistral...');
          result = await generateWithMistral(finalPrompt);
          usedModel = 'mistral';
        } else if (openAIApiKey) {
          console.log('🔄 Falling back to OpenAI...');
          result = await generateWithOpenAI(finalPrompt);
          usedModel = 'openai';
        } else {
          throw new Error('Aucune clé API disponible pour la génération');
        }
      }
    } catch (apiError) {
      console.error(`❌ Error with ${finalModel}:`, apiError);
      
      // Essayer avec une autre IA en cas d'échec
      const alternatives = Object.entries(availableAPIs)
        .filter(([key, available]) => key !== finalModel && available)
        .map(([key]) => key);

      if (alternatives.length > 0) {
        console.log(`🔄 Trying fallback with ${alternatives[0]}...`);
        try {
          if (alternatives[0] === 'perplexity') {
            result = await generateWithPerplexity(finalPrompt);
            usedModel = 'perplexity';
          } else if (alternatives[0] === 'mistral') {
            result = await generateWithMistral(finalPrompt);
            usedModel = 'mistral';
          } else if (alternatives[0] === 'openai') {
            result = await generateWithOpenAI(finalPrompt);
            usedModel = 'openai';
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed:`, fallbackError);
          throw new Error(`Génération échouée avec ${finalModel} et ${alternatives[0]}. Vérifiez vos clés API.`);
        }
      } else {
        throw new Error(`Génération échouée avec ${finalModel}. ${apiError.message}`);
      }
    }

    // Parser le contenu généré
    const parsedContent = parseGeneratedContent(result);
    const { title, excerpt, content: generatedContent } = parsedContent;


    // Générer un slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();

    console.log('📝 Creating blog post in database...');

    // Créer l'article dans la base de données
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content: generatedContent,
        category_id: finalCategoryId,
        visibility: finalVisibility,
        status: 'draft',
        ai_generated: true,
        ai_model: usedModel,
        generation_prompt: finalPrompt,
        view_count: 0,
        comment_count: 0,
        share_count: 0
      })
      .select()
      .single();

    if (postError) {
      console.error('❌ Database error:', postError);
      return new Response(JSON.stringify({ 
        error: `Erreur base de données: ${postError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Blog post created successfully:', post.id);

    return new Response(JSON.stringify({ 
      success: true,
      post: post,
      ai_model: usedModel,
      message: `Article généré et créé avec succès via ${usedModel}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-blog-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur interne du serveur',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
