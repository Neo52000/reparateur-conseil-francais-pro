import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRequest {
  auto_publish?: boolean;
  test_mode?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: AutomationRequest = await req.json().catch(() => ({}));
    const { auto_publish = false, test_mode = false } = requestData;

    console.log('📅 Weekly blog automation started', { auto_publish, test_mode });

    // Récupérer la configuration de l'automatisation
    const { data: config } = await supabase
      .from('blog_automation_config')
      .select('*')
      .eq('enabled', true)
      .single();

    if (!config && !test_mode) {
      console.log('⚠️ Automation disabled or not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Automation disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Étape 1: Récupérer les actualités de la semaine
    console.log('📰 Fetching weekly news...');
    
    const newsPrompt = `Quelles sont les 5 actualités les plus importantes de la semaine dernière (7 derniers jours) concernant :
- Les smartphones et la téléphonie mobile
- La réparation de smartphones et électronique
- Les innovations technologiques mobiles
- Les réglementations sur la réparation et le droit à la réparation
- L'impact environnemental et l'économie circulaire

Focus sur ce qui intéresse les consommateurs français et les réparateurs professionnels.
Date actuelle : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Fournis un résumé concis de chaque actualité avec la source et la date.`;

    const newsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Tu es un journaliste spécialisé en technologie mobile et réparation. Tu fournis des actualités récentes, vérifiées et pertinentes.' 
          },
          { role: 'user', content: newsPrompt }
        ],
      }),
    });

    if (!newsResponse.ok) {
      throw new Error(`News fetch failed: ${newsResponse.status}`);
    }

    const newsData = await newsResponse.json();
    const newsContent = newsData.choices[0].message.content;
    console.log('✅ News fetched successfully');

    // Étape 2: Générer l'article complet via IA
    console.log('✍️ Generating blog article...');

    const currentWeek = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const articlePrompt = `En te basant sur ces actualités de la semaine, crée un article de blog complet et engageant :

${newsContent}

L'article doit :
- Avoir un titre accrocheur mentionnant "Actualités de la semaine" et la date (${currentWeek})
- Un slug URL-friendly
- Un extrait captivant (150-160 caractères)
- Un contenu structuré en Markdown avec:
  * Une introduction présentant les tendances générales de la semaine
  * Une section pour chaque actualité importante (3-5 actualités)
  * Chaque section doit expliquer l'actualité, son impact, et son intérêt pour les lecteurs
  * Une conclusion avec perspective pour la semaine suivante
- Des paragraphes courts et faciles à lire
- Un ton professionnel mais accessible
- Un meta_title optimisé SEO (50-60 caractères)
- Une meta_description engageante (150-160 caractères)
- 5-7 mots-clés pertinents incluant "actualités", "smartphone", "réparation"

L'article doit faire environ 800-1200 mots.`;

    const articleResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Tu es un rédacteur expert en articles de blog sur la technologie mobile et la réparation. Tes articles sont optimisés SEO, informatifs et engageants.' 
          },
          { role: 'user', content: articlePrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'create_blog_article',
            description: 'Generate a complete blog article with all required fields',
            parameters: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Article title (50-60 characters, SEO optimized)'
                },
                slug: {
                  type: 'string',
                  description: 'URL-friendly slug (lowercase, hyphens)'
                },
                excerpt: {
                  type: 'string',
                  description: 'Brief excerpt (150-160 characters)'
                },
                content: {
                  type: 'string',
                  description: 'Full article content in Markdown format'
                },
                meta_title: {
                  type: 'string',
                  description: 'SEO meta title (50-60 characters)'
                },
                meta_description: {
                  type: 'string',
                  description: 'SEO meta description (150-160 characters)'
                },
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of 5-7 SEO keywords'
                }
              },
              required: ['title', 'slug', 'excerpt', 'content', 'meta_title', 'meta_description', 'keywords'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'create_blog_article' } }
      }),
    });

    if (!articleResponse.ok) {
      const errorText = await articleResponse.text();
      console.error('❌ Article generation failed:', errorText);
      throw new Error(`Article generation failed: ${articleResponse.status}`);
    }

    const articleData = await articleResponse.json();
    console.log('✅ Article generated successfully');

    // Extraire les données de l'article
    const toolCall = articleData.choices[0].message.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'create_blog_article') {
      throw new Error('Invalid article generation response');
    }

    const articleContent = JSON.parse(toolCall.function.arguments);

    // Étape 3: Récupérer la catégorie "Actualités"
    const { data: category } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', 'actualites-reparation')
      .single();

    if (!category) {
      throw new Error('Category "actualites-reparation" not found');
    }

    // Étape 4: Sauvegarder l'article dans la base de données
    const shouldAutoPublish = config?.auto_publish ?? auto_publish;
    const articleStatus = shouldAutoPublish ? 'published' : 'pending';

    const { data: newArticle, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: articleContent.title,
        slug: articleContent.slug,
        excerpt: articleContent.excerpt,
        content: articleContent.content,
        category_id: category.id,
        visibility: 'both',
        status: articleStatus,
        ai_generated: true,
        ai_model: 'google/gemini-2.5-flash',
        generation_prompt: 'Weekly automation',
        meta_title: articleContent.meta_title,
        meta_description: articleContent.meta_description,
        keywords: articleContent.keywords,
        published_at: shouldAutoPublish ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to save article:', insertError);
      throw insertError;
    }

    console.log('✅ Article saved successfully:', newArticle.id);

    // Étape 5: Logger l'opération
    await supabase
      .from('admin_audit_logs')
      .insert({
        user_id: null, // Automatique
        action: 'weekly_blog_automation',
        resource: `blog_posts/${newArticle.id}`,
        details: {
          article_id: newArticle.id,
          title: newArticle.title,
          status: articleStatus,
          auto_publish: shouldAutoPublish,
          test_mode
        }
      });

    // Logger dans ai_analytics
    await supabase
      .from('ai_analytics')
      .insert({
        feature: 'weekly_blog_automation',
        model: 'google/gemini-2.5-flash',
        prompt_tokens: 0, // Estimation
        completion_tokens: 0,
        total_cost: 0,
        success: true,
        metadata: {
          article_id: newArticle.id,
          status: articleStatus
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Article ${shouldAutoPublish ? 'published' : 'created in pending status'}`,
        article: {
          id: newArticle.id,
          title: newArticle.title,
          slug: newArticle.slug,
          status: articleStatus,
          url: `/blog/${newArticle.slug}`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Weekly automation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
