
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
      throw new Error('Template ID ou prompt requis');
    }

    console.log('Generating blog content with:', { template_id, ai_model, visibility });

    let finalPrompt = prompt;
    let finalModel = ai_model || 'mistral';
    let finalCategoryId = category_id;
    let finalVisibility = visibility || 'public';

    // Si un template_id est fourni, récupérer le template
    if (template_id) {
      const { data: template, error: templateError } = await supabase
        .from('blog_generation_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (templateError) throw templateError;

      finalPrompt = template.prompt_template;
      finalModel = template.ai_model;
      finalCategoryId = template.category_id;
      finalVisibility = template.visibility;
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

    // Générer le contenu selon le modèle choisi
    let generatedContent = '';
    let title = '';
    let excerpt = '';

    if (finalModel === 'mistral' && mistralApiKey) {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
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
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      // Parser le contenu généré
      const titleMatch = rawContent.match(/TITRE:\s*(.+)/);
      const excerptMatch = rawContent.match(/EXTRAIT:\s*(.+?)(?=\nCONTENU:)/s);
      const contentMatch = rawContent.match(/CONTENU:\s*([\s\S]+)/);

      title = titleMatch ? titleMatch[1].trim() : 'Article généré par IA';
      excerpt = excerptMatch ? excerptMatch[1].trim() : '';
      generatedContent = contentMatch ? contentMatch[1].trim() : rawContent;

    } else if (finalModel === 'openai' && openAIApiKey) {
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
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      // Parser le contenu généré
      const titleMatch = rawContent.match(/TITRE:\s*(.+)/);
      const excerptMatch = rawContent.match(/EXTRAIT:\s*(.+?)(?=\nCONTENU:)/s);
      const contentMatch = rawContent.match(/CONTENU:\s*([\s\S]+)/);

      title = titleMatch ? titleMatch[1].trim() : 'Article généré par IA';
      excerpt = excerptMatch ? excerptMatch[1].trim() : '';
      generatedContent = contentMatch ? contentMatch[1].trim() : rawContent;
    } else {
      throw new Error('Modèle IA non supporté ou clé API manquante');
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
      .replace(/(^-|-$)/g, '');

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

    if (postError) throw postError;

    console.log('Blog post created successfully:', post.id);

    return new Response(JSON.stringify({ 
      success: true,
      post: post,
      message: 'Article généré et créé avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
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
