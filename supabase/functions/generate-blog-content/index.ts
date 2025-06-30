
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
    let finalModel = ai_model || 'openai'; // Utiliser le modèle passé en paramètre ou OpenAI par défaut
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

      finalPrompt = template.prompt_template;
      // Utiliser le modèle passé en paramètre, sinon celui du template, sinon OpenAI par défaut
      finalModel = ai_model || template.ai_model || 'openai';
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

    // Vérifier qu'on a au moins une clé API
    if (!openAIApiKey && !mistralApiKey && !perplexityApiKey) {
      console.error('❌ Aucune clé API disponible');
      return new Response(JSON.stringify({ 
        error: 'Aucune clé API configurée (OpenAI, Mistral ou Perplexity)',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer le contenu selon le modèle choisi
    let generatedContent = '';
    let title = '';
    let excerpt = '';

    try {
      if (finalModel === 'perplexity' && perplexityApiKey) {
        console.log('🔄 Attempting Perplexity generation...');
        await generateWithPerplexity();
      } else if (finalModel === 'mistral' && mistralApiKey) {
        console.log('🔄 Attempting Mistral generation...');
        await generateWithMistral();
      } else if (finalModel === 'openai' && openAIApiKey) {
        console.log('🔄 Attempting OpenAI generation...');
        await generateWithOpenAI();
      } else {
        // Fallback sur la première IA disponible
        if (openAIApiKey) {
          console.log('🔄 Falling back to OpenAI...');
          await generateWithOpenAI();
        } else if (mistralApiKey) {
          console.log('🔄 Falling back to Mistral...');
          await generateWithMistral();
        } else if (perplexityApiKey) {
          console.log('🔄 Falling back to Perplexity...');
          await generateWithPerplexity();
        } else {
          throw new Error('Aucune clé API disponible pour la génération');
        }
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      return new Response(JSON.stringify({ 
        error: `Génération IA échouée: ${error.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    async function generateWithOpenAI() {
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
              content: finalPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      parseGeneratedContent(rawContent);
      console.log('✅ OpenAI generation successful');
    }

    async function generateWithMistral() {
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
              content: finalPrompt
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
      const rawContent = data.choices[0].message.content;
      
      parseGeneratedContent(rawContent);
      console.log('✅ Mistral generation successful');
    }

    async function generateWithPerplexity() {
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
              content: finalPrompt
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
      const rawContent = data.choices[0].message.content;
      
      parseGeneratedContent(rawContent);
      console.log('✅ Perplexity generation successful');
    }

    function parseGeneratedContent(rawContent: string) {
      const titleMatch = rawContent.match(/TITRE:\s*(.+)/);
      const excerptMatch = rawContent.match(/EXTRAIT:\s*(.+?)(?=\nCONTENU:)/s);
      const contentMatch = rawContent.match(/CONTENU:\s*([\s\S]+)/);

      title = titleMatch ? titleMatch[1].trim() : 'Article généré par IA';
      excerpt = excerptMatch ? excerptMatch[1].trim() : '';
      generatedContent = contentMatch ? contentMatch[1].trim() : rawContent;
    }

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
        ai_model: finalModel,
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
      ai_model: finalModel,
      message: `Article généré et créé avec succès via ${finalModel}`
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

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'été';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
}
