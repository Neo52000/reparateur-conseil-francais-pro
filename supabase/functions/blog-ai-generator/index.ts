import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback, type AITool } from "../_shared/ai-text.ts";

type SbClient = ReturnType<typeof createClient>;

async function checkAdminRole(supabase: SbClient, authHeader: string | null): Promise<string | null> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    if (!userId) return null;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    if (error) return null;
    return data ? userId : null;
  } catch {
    return null;
  }
}

interface GenerateArticleRequest {
  action?: 'generate' | 'check-status';
  topic?: string;
  category_id?: string;
  keywords?: string[];
  target_audience?: 'public' | 'repairers' | 'both';
  tone?: 'professional' | 'casual' | 'technical' | 'educational';
  auto_publish?: boolean;
  scheduled_at?: string;
}

interface ProviderStatus {
  name: string;
  key: string;
  status: 'active' | 'error' | 'warning' | 'unknown';
  message: string;
  lastCheck?: string;
  docsUrl?: string;
}

async function checkOpenAI(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'OpenAI',
    key: 'OPENAI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://platform.openai.com/api-keys',
  };
  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide ou expirée';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit ou quota dépassé';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error: unknown) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${(error as Error).message}`;
  }
  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkGemini(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Google Gemini',
    key: 'GEMINI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://aistudio.google.com/apikey',
  };
  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
    } else if (response.status === 400 || response.status === 403) {
      result.status = 'error';
      result.message = "Clé API invalide ou restrictions d'accès";
    } else if (response.status === 404) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error: unknown) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${(error as Error).message}`;
  }
  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkMistral(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Mistral AI',
    key: 'MISTRAL_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://console.mistral.ai/api-keys',
  };
  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit atteint';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error: unknown) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${(error as Error).message}`;
  }
  result.lastCheck = new Date().toISOString();
  return result;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const authHeader = req.headers.get("Authorization");

    let isInternalCall = false;
    let userId: string | null = null;

    if (authHeader === `Bearer ${SERVICE_ROLE}`) {
      isInternalCall = true;
      userId = null;
    } else {
      userId = await checkAdminRole(supabase, authHeader);
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "forbidden", message: "Admin required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const requestData: GenerateArticleRequest = await req.json();
    const { action, topic, category_id, keywords, target_audience, tone, auto_publish, scheduled_at } = requestData;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') ?? Deno.env.get('CLE_API_MISTRAL');

    if (action === 'check-status') {
      const [openai, gemini, mistral] = await Promise.all([
        checkOpenAI(OPENAI_API_KEY || ''),
        checkGemini(GEMINI_API_KEY || ''),
        checkMistral(MISTRAL_API_KEY || ''),
      ]);
      const providers = [gemini, openai, mistral];
      const activeCount = providers.filter((p) => p.status === 'active').length;
      const errorCount = providers.filter((p) => p.status === 'error').length;
      return new Response(
        JSON.stringify({
          success: true,
          providers,
          summary: {
            active: activeCount,
            errors: errorCount,
            warnings: providers.filter((p) => p.status === 'warning').length,
            hasWorkingProvider: activeCount > 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!GEMINI_API_KEY && !OPENAI_API_KEY && !MISTRAL_API_KEY) {
      throw new Error('Aucune clé API IA configurée (GEMINI_API_KEY, OPENAI_API_KEY ou MISTRAL_API_KEY requis)');
    }

    let categoryName = '';
    let customPrompt = '';

    if (category_id) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('id', category_id)
        .single();
      categoryName = category?.name || '';

      const { data: template } = await supabase
        .from('blog_generation_templates')
        .select('prompt_template, ai_model')
        .eq('category_id', category_id)
        .eq('is_active', true)
        .single();

      if (template) {
        customPrompt = template.prompt_template;
      }
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long' });
    const formattedDate = currentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const season = ['hiver', 'printemps', 'été', 'automne'][Math.floor((currentDate.getMonth() % 12) / 3)];

    if (customPrompt) {
      customPrompt = customPrompt
        .replace(/\{categorie\}/g, categoryName)
        .replace(/\{date\}/g, formattedDate)
        .replace(/\{annee\}/g, String(currentYear))
        .replace(/\{saison\}/g, season)
        .replace(/\{ton\}/g, tone || 'professionnel')
        .replace(/\{longueur\}/g, '600-800');
    }

    const systemPrompt = `Tu es un expert en rédaction d'articles de blog pour une plateforme de réparation de smartphones.
Ton objectif est de créer des articles optimisés SEO, informatifs et engageants.

**📅 CONTEXTE TEMPOREL IMPORTANT:**
- Date du jour: ${formattedDate}
- Année actuelle: ${currentYear}
- Mois: ${currentMonth}
- Saison: ${season}

⚠️ RÈGLE CRITIQUE: Tous les contenus, références temporelles, tendances et statistiques mentionnées DOIVENT être pertinents pour ${currentYear}.
NE JAMAIS mentionner 2024 ou des années passées comme étant "actuelles", "récentes" ou "cette année".
Si tu mentionnes une année, utilise UNIQUEMENT ${currentYear}.

Audience cible: ${target_audience === 'repairers' ? 'professionnels réparateurs' : target_audience === 'public' ? 'grand public' : 'mixte (public et professionnels)'}
Ton: ${tone || 'professionnel'}
${categoryName ? `Catégorie: ${categoryName}` : ''}`;

    const userPrompt = customPrompt || `📅 Date de rédaction: ${formattedDate} (Année ${currentYear})

Crée un article de blog complet sur le sujet suivant: ${topic || 'Les dernières tendances en réparation de smartphones'}
${keywords?.length ? `Mots-clés à inclure naturellement: ${keywords.join(', ')}` : ''}

L'article doit:
- Avoir un titre accrocheur et optimisé SEO (50-60 caractères)
- Un slug URL-friendly
- Un extrait captivant (150-160 caractères)
- Un contenu structuré en Markdown avec titres H2/H3
- **IMPORTANT: Inclure exactement 2-3 placeholders d'images** dans le contenu:
  * Format: {{IMAGE_1}}, {{IMAGE_2}}, {{IMAGE_3}}
  * Positionner les placeholders entre les sections naturellement
  * Chaque placeholder doit avoir une description détaillée et spécifique
  * Exemple: "{{IMAGE_1}} - Photo d'un technicien réparant l'écran d'un iPhone dans un atelier moderne"
- Des paragraphes courts et faciles à lire (3-4 lignes max par paragraphe)
- Des listes à puces pour les conseils pratiques
- Des conseils actionnables et concrets
- Un meta_title optimisé SEO (50-60 caractères)
- Une meta_description engageante (150-160 caractères)
- 5-7 mots-clés pertinents pour le SEO

⚠️ IMPORTANT: Toutes les références temporelles (tendances, statistiques, "en ${currentYear}") doivent utiliser l'année ${currentYear}. NE PAS mentionner 2024 ou années antérieures comme actuelles.`;

    const tool: AITool = {
      type: 'function',
      function: {
        name: 'create_blog_article',
        description: 'Generate a complete blog article with all required fields',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: `Article title (50-60 chars). Use current year ${currentYear} only.` },
            slug: { type: 'string', description: 'URL-friendly slug (lowercase, hyphens)' },
            excerpt: { type: 'string', description: 'Short excerpt (150-160 chars)' },
            content: { type: 'string', description: 'Full article content in Markdown format with H2/H3 headings' },
            meta_title: { type: 'string', description: 'SEO meta title (50-60 chars)' },
            meta_description: { type: 'string', description: 'SEO meta description (150-160 chars)' },
            keywords: { type: 'array', items: { type: 'string' }, description: 'Array of 5-7 SEO keywords' },
            image_placeholders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  placeholder: { type: 'string' },
                  description: { type: 'string' },
                },
                required: ['placeholder', 'description'],
              },
            },
          },
          required: ['title', 'slug', 'excerpt', 'content', 'meta_title', 'meta_description', 'keywords', 'image_placeholders'],
        },
      },
    };

    const aiResult = await callAIWithFallback({
      systemPrompt,
      userPrompt,
      tools: [tool],
      toolChoice: { type: 'function', function: { name: 'create_blog_article' } },
    });

    if (!aiResult.success || !aiResult.toolCallArguments) {
      throw new Error(aiResult.error || 'Aucune API IA disponible. Vérifiez vos clés API et crédits.');
    }

    const articleData = aiResult.toolCallArguments as {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      meta_title: string;
      meta_description: string;
      keywords: string[];
      image_placeholders?: { placeholder: string; description: string }[];
    };
    const usedProvider = aiResult.provider ?? 'unknown';

    function extractImagePlaceholders(content: string): { placeholder: string; description: string }[] {
      const placeholders: { placeholder: string; description: string }[] = [];
      const regex = /(\{\{IMAGE_(\d+)\}\})(?:\s*[-–—:]\s*([^\n]+))?/gi;
      let match;
      while ((match = regex.exec(content)) !== null) {
        placeholders.push({
          placeholder: match[1],
          description: match[3]?.trim() || `Image illustrative pour la section ${match[2]}`,
        });
      }
      return placeholders;
    }

    let imagePlaceholders = articleData.image_placeholders;
    if (!imagePlaceholders || !Array.isArray(imagePlaceholders) || imagePlaceholders.length === 0) {
      imagePlaceholders = extractImagePlaceholders(articleData.content);
    }

    if (imagePlaceholders.length > 0) {
      let updatedContent = articleData.content;

      for (const placeholder of imagePlaceholders) {
        let inlineImageUrl: string | null = null;

        for (let attempt = 1; attempt <= 2 && !inlineImageUrl; attempt++) {
          try {
            const imageResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-image-generator`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SERVICE_ROLE}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: placeholder.description,
                style: 'modern',
              }),
            });
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              inlineImageUrl = imageData?.image_url || imageData?.imageUrl;
            }
          } catch {
            // retry handled by loop
          }
          if (!inlineImageUrl && attempt < 2) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        const escapedPlaceholder = placeholder.placeholder.replace(/[{}]/g, '\\$&');
        const patternWithDesc = new RegExp(escapedPlaceholder + '(?:\\s*[-–—:]\\s*[^\\n]*)?', 'g');
        const imageMarkdown = inlineImageUrl
          ? `\n\n![${placeholder.description}](${inlineImageUrl})\n\n`
          : `\n\n![${placeholder.description}](https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=800&fit=crop&q=80)\n\n`;

        updatedContent = updatedContent.replace(patternWithDesc, imageMarkdown);
      }

      articleData.content = updatedContent;
    }

    await supabase.from('ai_analytics').insert({
      function_name: 'blog-ai-generator',
      model_used: usedProvider,
      prompt_tokens: aiResult.usage?.prompt_tokens ?? 0,
      completion_tokens: aiResult.usage?.completion_tokens ?? 0,
      total_cost: 0,
      response_time_ms: 0,
      success: true,
    });

    const status = auto_publish ? 'published' : (scheduled_at ? 'scheduled' : 'draft');

    let uniqueSlug = articleData.slug;
    let slugCounter = 1;
    while (true) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();
      if (!existingPost) break;
      slugCounter++;
      uniqueSlug = `${articleData.slug}-${slugCounter}`;
    }

    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: articleData.title,
        slug: uniqueSlug,
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
        ai_model: usedProvider,
        generation_prompt: userPrompt,
        published_at: auto_publish ? new Date().toISOString() : null,
        scheduled_at: scheduled_at || null,
        view_count: 0,
        comment_count: 0,
        share_count: 0,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    let featuredImageUrl: string | null = null;
    const imagePrompt = `Professional blog header for article: "${articleData.title}". Modern smartphone repair, technology, professional service. Clean design, realistic style.`;

    for (let attempt = 1; attempt <= 2 && !featuredImageUrl; attempt++) {
      try {
        const imageResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-image-generator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'realistic',
            size: '1792x1024',
          }),
        });
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          featuredImageUrl = imageData?.image_url || imageData?.imageUrl;
        }
      } catch {
        // retry handled by loop
      }
      if (!featuredImageUrl && attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!featuredImageUrl) {
      featuredImageUrl = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1792&h=1024&fit=crop&q=80';
    }

    try {
      await supabase
        .from('blog_posts')
        .update({ featured_image_url: featuredImageUrl })
        .eq('id', newPost.id);
      newPost.featured_image_url = featuredImageUrl;
    } catch {
      // non-critical, continue
    }

    let moderationResult = null;
    try {
      const moderationResponse = await fetch(`${SUPABASE_URL}/functions/v1/blog-ai-moderation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: newPost.id }),
      });
      if (moderationResponse.ok) {
        const moderationData = await moderationResponse.json();
        moderationResult = moderationData.moderation;
        if (moderationData.new_status !== newPost.status) {
          newPost.status = moderationData.new_status;
        }
      }
    } catch {
      // moderation failures are non-blocking
    }

    return new Response(
      JSON.stringify({
        success: true,
        post: newPost,
        ai_model: usedProvider,
        moderation: moderationResult,
        message: auto_publish
          ? 'Article généré, modéré et publié avec succès'
          : scheduled_at
          ? 'Article généré, modéré et programmé avec succès'
          : moderationResult?.status === 'approved'
          ? 'Article généré et approuvé automatiquement'
          : 'Article généré et en attente de validation',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
