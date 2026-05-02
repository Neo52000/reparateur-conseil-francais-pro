import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback } from "../_shared/ai-text.ts";

type SbClient = ReturnType<typeof createClient>;

async function checkAdminRole(supabase: SbClient, authHeader: string | null): Promise<boolean> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return false;
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    if (!userId) return false;
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { test_mode = false, action, schedule_id, category_id, auto_publish = false, ai_model } = body || {};

    if (test_mode === true || action === 'generate') {
      const authHeader = req.headers.get("Authorization");
      const isAdmin = await checkAdminRole(supabase, authHeader);
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: "forbidden", message: "Admin required for manual generation" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      type Schedule = {
        id?: string;
        category_id?: string | null;
        prompt_template?: string;
        ai_model?: string;
        auto_publish?: boolean;
      };
      let schedule: Schedule | null = null;
      if (schedule_id) {
        const { data, error } = await supabase
          .from('blog_automation_schedules')
          .select('*')
          .eq('id', schedule_id)
          .maybeSingle();
        if (error) throw error;
        schedule = data;
      } else {
        const { data, error } = await supabase
          .from('blog_automation_schedules')
          .select('*')
          .eq('enabled', true)
          .order('schedule_day', { ascending: true })
          .order('schedule_time', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        schedule = data;
      }

      let chosenCategoryId: string | null = null;
      if (schedule?.category_id) chosenCategoryId = schedule.category_id;
      else if (category_id) chosenCategoryId = category_id;
      else {
        const { data: cat } = await supabase
          .from('blog_categories')
          .select('id, slug')
          .in('slug', ['actualites-reparation', 'actualites'])
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        chosenCategoryId = cat?.id ?? null;
      }

      const promptTemplate: string = schedule?.prompt_template || `
Tu es un rédacteur technique français spécialisé en réparation de smartphones et mobilité.
Rédige un article utile, clair, factuel et SEO-friendly (H1 + H2/H3, puces, mots-clés).
Inclure : contexte marché/actu, conseils pratiques, points d'attention réparateurs.
Ton pédagogique, neutre, concret. Longueur cible 900-1200 mots.
Titre et méta description (150-160 caractères) en tête :
META_TITLE: <titre>\nMETA_DESCRIPTION: <description>
`;

      const systemMessage = 'Tu es un assistant de rédaction pour un blog français de réparation de smartphones.';

      const aiResult = await callAIWithFallback({
        systemPrompt: systemMessage,
        userPrompt: promptTemplate,
      });

      if (!aiResult.success || !aiResult.content) {
        return new Response(
          JSON.stringify({ success: false, error: aiResult.error || 'Aucune API IA disponible. Vérifiez vos clés API et crédits.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const content = aiResult.content;
      const usedProvider = aiResult.provider ?? 'unknown';

      let metaTitle = '';
      let metaDescription = '';
      const tMatch = content.match(/META_TITLE:\s*(.*)/i);
      const dMatch = content.match(/META_DESCRIPTION:\s*(.*)/i);
      if (tMatch) metaTitle = tMatch[1].trim();
      if (dMatch) metaDescription = dMatch[1].trim();
      const cleaned = content.replace(/META_TITLE:.*\n?/i, '').replace(/META_DESCRIPTION:.*\n?/i, '').trim();

      const firstH1 = cleaned.match(/^#\s+(.+)$/m)?.[1];
      const title = metaTitle || firstH1 || 'Actualités de la réparation : mise à jour';
      const slugBase = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60);
      const slug = `${slugBase}-${Date.now()}`;

      const publicationStatus = (auto_publish || schedule?.auto_publish) ? 'published' : 'pending';
      const now = new Date().toISOString();

      const { data: post, error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          title,
          slug,
          excerpt: metaDescription || undefined,
          content: cleaned,
          featured_image_url: null,
          author_id: null,
          category_id: chosenCategoryId,
          visibility: 'public',
          status: publicationStatus,
          ai_generated: true,
          ai_model: ai_model || usedProvider,
          generation_prompt: promptTemplate,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          keywords: [],
          published_at: publicationStatus === 'published' ? now : null,
          scheduled_at: null,
          view_count: 0,
          comment_count: 0,
          share_count: 0,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      if (schedule?.id) {
        await supabase
          .from('blog_automation_schedules')
          .update({ last_run_at: now })
          .eq('id', schedule.id);
      }

      return new Response(JSON.stringify({ success: true, article: post }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const nowIso = new Date().toISOString();
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, scheduled_at')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowIso);

    if (fetchError) throw fetchError;

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, published_count: 0, message: 'No posts to publish' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({ status: 'published', published_at: nowIso })
      .in('id', scheduledPosts.map((p) => p.id))
      .select();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        published_count: updatedPosts?.length || 0,
        published_posts: updatedPosts?.map((p) => ({ id: p.id, title: p.title, published_at: p.published_at })),
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
