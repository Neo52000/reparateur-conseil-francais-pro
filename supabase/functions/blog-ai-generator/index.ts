import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateArticleRequest {
  topic?: string;
  category_id?: string;
  keywords?: string[];
  target_audience?: 'public' | 'repairers' | 'both';
  tone?: 'professional' | 'casual' | 'technical' | 'educational';
  auto_publish?: boolean;
  scheduled_at?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec le token utilisateur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Token invalide:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SÉCURITÉ: Vérification du rôle admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (roleError || !roleData) {
      console.error('❌ Accès refusé: utilisateur non-admin', { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Accès autorisé pour l'admin: ${user.email}`);

    const requestData: GenerateArticleRequest = await req.json();
    const { topic, category_id, keywords, target_audience, tone, auto_publish, scheduled_at } = requestData;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Récupérer la catégorie si fournie
    let categoryName = '';
    if (category_id) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('id', category_id)
        .single();
      categoryName = category?.name || '';
    }

    // Construire le prompt système
    const systemPrompt = `Tu es un expert en rédaction d'articles de blog pour une plateforme de réparation de smartphones.
Ton objectif est de créer des articles optimisés SEO, informatifs et engageants.
Audience cible: ${target_audience === 'repairers' ? 'professionnels réparateurs' : target_audience === 'public' ? 'grand public' : 'mixte (public et professionnels)'}
Ton: ${tone || 'professionnel'}
${categoryName ? `Catégorie: ${categoryName}` : ''}`;

    const userPrompt = `Crée un article de blog complet sur le sujet suivant: ${topic || 'Les dernières tendances en réparation de smartphones'}
${keywords?.length ? `Mots-clés à inclure naturellement: ${keywords.join(', ')}` : ''}

L'article doit:
- Avoir un titre accrocheur et optimisé SEO (50-60 caractères)
- Un slug URL-friendly
- Un extrait captivant (150-160 caractères)
- Un contenu structuré en Markdown avec titres H2/H3
- Des paragraphes courts et faciles à lire
- Des conseils pratiques et actionnables
- Un meta_title optimisé SEO (50-60 caractères)
- Une meta_description engageante (150-160 caractères)
- 5-7 mots-clés pertinents pour le SEO`;

    // Appel à Lovable AI avec Tool Calling pour structure garantie
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  description: 'Article title (50-60 chars)' 
                },
                slug: { 
                  type: 'string', 
                  description: 'URL-friendly slug (lowercase, hyphens)' 
                },
                excerpt: { 
                  type: 'string', 
                  description: 'Short excerpt (150-160 chars)' 
                },
                content: { 
                  type: 'string', 
                  description: 'Full article content in Markdown format with H2/H3 headings' 
                },
                meta_title: { 
                  type: 'string', 
                  description: 'SEO meta title (50-60 chars)' 
                },
                meta_description: { 
                  type: 'string', 
                  description: 'SEO meta description (150-160 chars)' 
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
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extraire les données du tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const articleData = JSON.parse(toolCall.function.arguments);

    // Enregistrer l'analytics
    await supabase.from('ai_analytics').insert({
      function_name: 'blog-ai-generator',
      model_used: 'google/gemini-2.5-flash',
      prompt_tokens: aiData.usage?.prompt_tokens || 0,
      completion_tokens: aiData.usage?.completion_tokens || 0,
      total_cost: 0, // Gratuit jusqu'au 13 octobre 2025
      response_time_ms: 0,
      success: true
    });

    // Créer l'article dans la base de données
    const status = auto_publish ? 'published' : (scheduled_at ? 'scheduled' : 'draft');
    
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        meta_title: articleData.meta_title,
        meta_description: articleData.meta_description,
        keywords: articleData.keywords,
        category_id: category_id || null,
        author_id: user.id,
        visibility: target_audience || 'public',
        status,
        ai_generated: true,
        ai_model: 'google/gemini-2.5-flash',
        generation_prompt: userPrompt,
        published_at: auto_publish ? new Date().toISOString() : null,
        scheduled_at: scheduled_at || null,
        view_count: 0,
        comment_count: 0,
        share_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        post: newPost,
        ai_model: 'google/gemini-2.5-flash',
        message: auto_publish 
          ? 'Article généré et publié avec succès' 
          : scheduled_at 
          ? 'Article généré et programmé avec succès'
          : 'Article généré en brouillon'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-ai-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
