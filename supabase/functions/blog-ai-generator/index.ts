import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function checkAdminRole(supabase: any, authHeader: string | null): Promise<string | null> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return null;
    
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    
    if (!userId) return null;
    
    // SECURITY: Use server-side has_role() function instead of trusting JWT metadata
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    
    if (error) {
      console.error("❌ has_role RPC error:", error);
      return null;
    }
    
    return data ? userId : null;
  } catch (e) {
    console.error("❌ Admin check error:", e);
    return null;
  }
}

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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const authHeader = req.headers.get("Authorization");

    // SECURITY: Check admin role using server-side has_role() function
    const userId = await checkAdminRole(supabase, authHeader);

    if (!userId) {
      console.log("❌ Access denied: user is not admin");
      return new Response(
        JSON.stringify({ success: false, error: "forbidden", message: "Admin required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Access authorized for admin user: ${userId}`);

    const requestData: GenerateArticleRequest = await req.json();
    const { topic, category_id, keywords, target_audience, tone, auto_publish, scheduled_at } = requestData;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Récupérer la catégorie si fournie
    let categoryName = '';
    let customPrompt = '';
    
    if (category_id) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('id', category_id)
        .single();
      categoryName = category?.name || '';

      // Récupérer le prompt personnalisé pour cette catégorie
      const { data: template } = await supabase
        .from('blog_generation_templates')
        .select('prompt_template, ai_model')
        .eq('category_id', category_id)
        .eq('is_active', true)
        .single();

      if (template) {
        customPrompt = template.prompt_template;
        console.log('✅ Prompt personnalisé trouvé pour la catégorie:', categoryName);
      }
    }

    // Remplacer les variables dynamiques dans le prompt
    const currentDate = new Date();
    const season = ['hiver', 'printemps', 'été', 'automne'][Math.floor((currentDate.getMonth() % 12) / 3)];
    
    if (customPrompt) {
      customPrompt = customPrompt
        .replace(/\{categorie\}/g, categoryName)
        .replace(/\{date\}/g, currentDate.toLocaleDateString('fr-FR'))
        .replace(/\{saison\}/g, season)
        .replace(/\{ton\}/g, tone || 'professionnel')
        .replace(/\{longueur\}/g, '600-800');
    }

    // Construire le prompt système
    const systemPrompt = `Tu es un expert en rédaction d'articles de blog pour une plateforme de réparation de smartphones.
Ton objectif est de créer des articles optimisés SEO, informatifs et engageants.
Audience cible: ${target_audience === 'repairers' ? 'professionnels réparateurs' : target_audience === 'public' ? 'grand public' : 'mixte (public et professionnels)'}
Ton: ${tone || 'professionnel'}
${categoryName ? `Catégorie: ${categoryName}` : ''}
Saison actuelle: ${season}`;

    // Utiliser le prompt personnalisé ou le prompt par défaut
    const userPrompt = customPrompt || `Crée un article de blog complet sur le sujet suivant: ${topic || 'Les dernières tendances en réparation de smartphones'}
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

    console.log('📝 Prompt utilisé:', customPrompt ? 'Personnalisé' : 'Par défaut');

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
        author_id: userId,
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
