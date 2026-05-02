
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback } from "../_shared/ai-text.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const result = await callAIWithFallback({
    systemPrompt,
    userPrompt: prompt,
    temperature: 0.8,
  });
  if (!result.success || !result.content) {
    throw new Error(result.error || 'All AI providers failed');
  }
  return result.content;
}

// SCAN: Find published blog posts without campaigns
async function handleScan() {
  const { data: existingCampaigns } = await supabaseAdmin
    .from('social_campaigns')
    .select('blog_post_id');

  const existingIds = (existingCampaigns || []).map((c: { blog_post_id: string }) => c.blog_post_id);

  let query = supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, status, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  if (existingIds.length > 0) {
    // Filter out already processed - use not.in
    query = query.not('id', 'in', `(${existingIds.join(',')})`);
  }

  const { data: newPosts, error } = await query;
  if (error) throw error;

  const articles_found: string[] = [];
  for (const post of (newPosts || [])) {
    const { error: insertError } = await supabaseAdmin
      .from('social_campaigns')
      .insert({ blog_post_id: post.id, status: 'detected' });
    if (!insertError) articles_found.push(post.title);
  }

  return { new_campaigns: articles_found.length, articles_found };
}

// GENERATE: Create social posts for a campaign
async function handleGenerate(campaignId: string) {
  // Get campaign with blog post
  const { data: campaign, error } = await supabaseAdmin
    .from('social_campaigns')
    .select('*, blog_post:blog_posts(id, title, slug, excerpt, content, featured_image_url, published_at, category_id, keywords)')
    .eq('id', campaignId)
    .single();

  interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    featured_image_url?: string;
    published_at?: string;
    category_id?: string;
    keywords?: string[];
  }
  interface SocialSettings {
    base_url?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign_prefix?: string;
  }

  if (error || !campaign) throw new Error('Campaign not found');
  const post = (campaign as { blog_post?: BlogPost }).blog_post;
  if (!post) throw new Error('Blog post not found');

  const { data: settingsRow } = await supabaseAdmin
    .from('social_settings')
    .select('config')
    .limit(1)
    .single();
  const settings = (settingsRow?.config as SocialSettings) || {};
  const baseUrl = settings.base_url || 'https://topreparateurs.fr';
  const utmSource = settings.utm_source || 'social';
  const utmMedium = settings.utm_medium || 'post';
  const utmPrefix = settings.utm_campaign_prefix || 'blog-booster';

  const articleUrl = `${baseUrl}/blog/${post.slug}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmPrefix}-${post.slug.substring(0, 30)}`;

  // Clean content for prompt
  const cleanContent = (post.content || '').replace(/<[^>]+>/g, ' ').substring(0, 2000);
  const title = post.title;
  const excerpt = post.excerpt || cleanContent.substring(0, 200);

  // Try to match a repairer
  let repairerInfo = '';
  try {
    const { data: repairers } = await supabaseAdmin
      .from('repairer_profiles')
      .select('id, business_name, city, specialties, description')
      .eq('is_available', true)
      .limit(5);

    if (repairers && repairers.length > 0) {
      // Simple keyword matching from article content
      const contentLower = (title + ' ' + cleanContent).toLowerCase();
      type RepairerMatch = {
        id: string;
        business_name: string;
        city?: string;
        specialties?: string[];
        description?: string;
      };
      let bestMatch: RepairerMatch | null = null;
      let bestScore = 0;

      for (const r of repairers) {
        let score = 0;
        const specs = (r.specialties || []) as string[];
        for (const spec of specs) {
          if (contentLower.includes(spec.toLowerCase())) score += 2;
        }
        if (r.city && contentLower.includes(r.city.toLowerCase())) score += 3;
        if (score > bestScore) { bestScore = score; bestMatch = r; }
      }

      if (bestMatch && bestScore >= 2) {
        await supabaseAdmin
          .from('social_campaigns')
          .update({
            repairer_id: bestMatch.id,
            match_score: bestScore,
            match_reason: `Match par spécialités/ville (score: ${bestScore})`,
          })
          .eq('id', campaignId);

        repairerInfo = `\n\nRéparateur recommandé : ${bestMatch.business_name} à ${bestMatch.city}. Intègre une mention naturelle de ce professionnel référencé sur TopRéparateurs.`;
      }
    }
  } catch (e) {
    console.error('Repairer matching failed:', e);
  }

  const systemPrompt = `Tu es un expert en social media marketing pour TopRéparateurs.fr, la plateforme de mise en relation avec des réparateurs de smartphones et appareils électroniques en France. Tu génères des publications engageantes, humaines et non robotiques. Chaque post doit promouvoir l'article ET la plateforme TopRéparateurs.`;

  const platforms = ['facebook', 'instagram', 'x', 'linkedin'];
  const prompts: Record<string, string> = {
    facebook: `Génère un post Facebook (200-300 mots) pour cet article de blog.
Titre: "${title}"
Résumé: "${excerpt}"
Lien: ${articleUrl}
${repairerInfo}

Règles:
- Ton éducatif et engageant, pas de jargon vide
- Commence par une question ou une accroche forte
- Inclus le lien vers l'article
- Termine par un CTA dynamique parmi: "Trouvez un réparateur près de chez vous sur TopRéparateurs.fr", "Comparez les réparateurs certifiés", "Découvrez l'article complet"
- N'utilise PAS de hashtags
- Format: texte brut uniquement, pas de markdown`,

    instagram: `Génère une caption Instagram (max 150 mots) pour cet article de blog.
Titre: "${title}"
Résumé: "${excerpt}"
${repairerInfo}

Règles:
- Ton engageant avec des emojis pertinents
- Accroche forte en première ligne
- Inclus "Lien en bio 👆" à la fin
- Génère 10-15 hashtags pertinents séparés (réparation, smartphone, tech, France)
- CTA: "Trouvez votre réparateur sur topreparateurs.fr"
- Format: texte brut, hashtags sur ligne séparée après "---HASHTAGS---"`,

    x: `Génère un tweet (max 270 caractères) pour cet article de blog.
Titre: "${title}"
Lien: ${articleUrl}
${repairerInfo}

Règles:
- Court, percutant, avec 1-2 emojis
- Inclus le lien
- Pas de hashtags (ils ne servent plus sur X)
- Ton direct et informatif`,

    linkedin: `Génère un post LinkedIn (200-400 mots) pour cet article de blog.
Titre: "${title}"
Résumé: "${excerpt}"
Lien: ${articleUrl}
${repairerInfo}

Règles:
- Ton expert et professionnel, positionne TopRéparateurs comme autorité du secteur
- Commence par un constat ou une donnée intéressante
- Développe l'angle expertise/qualité de service
- Inclus le lien
- CTA professionnel: "Découvrez notre réseau de réparateurs certifiés" ou "Rejoignez TopRéparateurs"
- Pas de hashtags dans le corps, 3-5 hashtags max à la fin
- Format: texte brut`,
  };

  let postsGenerated = 0;

  for (const platform of platforms) {
    try {
      const result = await callAI(prompts[platform], systemPrompt);

      let content = result;
      let hashtags: string[] = [];

      // Extract hashtags for Instagram
      if (platform === 'instagram' && result.includes('---HASHTAGS---')) {
        const parts = result.split('---HASHTAGS---');
        content = parts[0].trim();
        hashtags = (parts[1] || '').match(/#\w+/g) || [];
      }

      // Extract LinkedIn hashtags
      if (platform === 'linkedin') {
        const hashtagMatches = content.match(/#\w+/g) || [];
        hashtags = hashtagMatches.slice(-5);
      }

      const ctaTexts: Record<string, string> = {
        facebook: 'Trouvez un réparateur près de chez vous',
        instagram: 'Trouvez votre réparateur',
        x: 'Comparer les réparateurs',
        linkedin: 'Découvrez notre réseau certifié',
      };

      // Upsert post
      const { error: postError } = await supabaseAdmin
        .from('social_posts')
        .upsert({
          campaign_id: campaignId,
          platform,
          content,
          hashtags,
          cta_text: ctaTexts[platform],
          cta_url: articleUrl,
          media_url: post.featured_image_url || null,
          status: 'draft',
        }, { onConflict: 'campaign_id,platform' });

      if (!postError) postsGenerated++;

      // Log
      await supabaseAdmin.from('social_publication_logs').insert({
        campaign_id: campaignId,
        action: 'generate',
        status: postError ? 'failed' : 'success',
        error_message: postError?.message,
        response_data: { platform, content_length: content.length },
      });

    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Generation failed for ${platform}:`, e);
      await supabaseAdmin.from('social_publication_logs').insert({
        campaign_id: campaignId,
        action: 'generate',
        status: 'failed',
        error_message: message,
        response_data: { platform },
      });
    }
  }

  // Update campaign status
  await supabaseAdmin
    .from('social_campaigns')
    .update({ status: postsGenerated > 0 ? 'generated' : 'failed' })
    .eq('id', campaignId);

  return { campaign_id: campaignId, posts_generated: postsGenerated };
}

// STATUS: Get overview stats
async function handleStatus() {
  const { count: totalCampaigns } = await supabaseAdmin
    .from('social_campaigns')
    .select('*', { count: 'exact', head: true });

  const { count: totalPosts } = await supabaseAdmin
    .from('social_posts')
    .select('*', { count: 'exact', head: true });

  const { data: statusBreakdown } = await supabaseAdmin
    .from('social_campaigns')
    .select('status');

  const breakdown: Record<string, number> = {};
  for (const c of ((statusBreakdown || []) as { status: string }[])) {
    breakdown[c.status] = (breakdown[c.status] || 0) + 1;
  }

  return { totalCampaigns, totalPosts, statusBreakdown: breakdown };
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    const { action, ...payload } = await req.json();

    let result;
    switch (action) {
      case 'scan':
        result = await handleScan();
        break;
      case 'generate':
        if (!payload.campaign_id) throw new Error('campaign_id required');
        result = await handleGenerate(payload.campaign_id);
        break;
      case 'status':
        result = await handleStatus();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Social booster error:', e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
