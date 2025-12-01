import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

async function checkAdminRole(supabase: any, authHeader: string | null): Promise<boolean> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return false;
    
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    
    if (!userId) return false;
    
    // SECURITY: Use server-side has_role() function
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    
    if (error) {
      console.error("❌ has_role RPC error:", error);
      return false;
    }
    
    return Boolean(data);
  } catch (e) {
    console.error("❌ Admin check error:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try to parse body. If none provided, default to auto-publish mode
    const body = await req.json().catch(() => ({}));
    const { test_mode = false, action, schedule_id, category_id, auto_publish = false, ai_model } = body || {};

    // If asked to generate (test mode), branch to AI generation flow
    if (test_mode === true || action === 'generate') {
      // SECURITY: Verify admin role for manual generation
      const authHeader = req.headers.get("Authorization");
      const isAdmin = await checkAdminRole(supabase, authHeader);
      
      if (!isAdmin) {
        console.log("❌ Generation access denied: user is not admin");
        return new Response(
          JSON.stringify({ success: false, error: "forbidden", message: "Admin required for manual generation" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Load schedule or fallback to first enabled
      let schedule: any = null;
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

      // Resolve category
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

      const model = schedule?.ai_model || ai_model || 'google/gemini-2.5-flash';
      const promptTemplate: string = schedule?.prompt_template || `
Tu es un rédacteur technique français spécialisé en réparation de smartphones et mobilité. 
Rédige un article utile, clair, factuel et SEO-friendly (H1 + H2/H3, puces, mots-clés). 
Inclure : contexte marché/actu, conseils pratiques, points d’attention réparateurs. 
Ton pédagogique, neutre, concret. Longueur cible 900-1200 mots.
Titre et méta description (150-160 caractères) en tête :
META_TITLE: <titre>\nMETA_DESCRIPTION: <description>
`;

      // 🔄 SYSTÈME DE FALLBACK IA: Lovable AI → OpenAI → Mistral
      let content = '';
      let usedProvider = '';

      const systemMessage = 'Tu es un assistant de rédaction pour un blog français de réparation de smartphones.';

      // 1️⃣ Essayer Lovable AI
      if (LOVABLE_API_KEY) {
        try {
          console.log('🔹 Trying Lovable AI...');
          const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: promptTemplate },
              ],
              stream: false,
            }),
          });

          if (aiResp.ok) {
            const aiJson = await aiResp.json();
            content = aiJson?.choices?.[0]?.message?.content || '';
            if (content) {
              usedProvider = 'Lovable AI (Gemini)';
              console.log('✅ Lovable AI succeeded');
            }
          } else if (aiResp.status === 402) {
            console.log('⚠️ Lovable AI: No credits, trying fallback...');
          } else if (aiResp.status === 429) {
            console.log('⚠️ Lovable AI: Rate limited, trying fallback...');
          }
        } catch (error) {
          console.log('⚠️ Lovable AI failed:', error.message);
        }
      }

      // 2️⃣ Fallback OpenAI
      if (!content) {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (OPENAI_API_KEY) {
          try {
            console.log('🔹 Trying OpenAI...');
            const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemMessage },
                  { role: 'user', content: promptTemplate }
                ],
                temperature: 0.7
              })
            });

            if (aiResp.ok) {
              const aiJson = await aiResp.json();
              content = aiJson?.choices?.[0]?.message?.content || '';
              if (content) {
                usedProvider = 'OpenAI (GPT-4o-mini)';
                console.log('✅ OpenAI succeeded');
              }
            }
          } catch (error) {
            console.log('⚠️ OpenAI failed:', error.message);
          }
        }
      }

      // 3️⃣ Fallback Mistral
      if (!content) {
        const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL');
        if (MISTRAL_API_KEY) {
          try {
            console.log('🔹 Trying Mistral...');
            const aiResp = await fetch('https://api.mistral.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                  { role: 'system', content: systemMessage },
                  { role: 'user', content: promptTemplate }
                ],
                temperature: 0.7
              })
            });

            if (aiResp.ok) {
              const aiJson = await aiResp.json();
              content = aiJson?.choices?.[0]?.message?.content || '';
              if (content) {
                usedProvider = 'Mistral';
                console.log('✅ Mistral succeeded');
              }
            }
          } catch (error) {
            console.log('⚠️ Mistral failed:', error.message);
          }
        }
      }

      if (!content) {
        return new Response(JSON.stringify({ success: false, error: 'Aucune API IA disponible. Vérifiez vos clés API et crédits.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`✅ Article généré avec: ${usedProvider}`);

      // Parse meta
      let metaTitle = '';
      let metaDescription = '';
      let cleaned = content;
      const tMatch = content.match(/META_TITLE:\s*(.*)/i);
      const dMatch = content.match(/META_DESCRIPTION:\s*(.*)/i);
      if (tMatch) metaTitle = tMatch[1].trim();
      if (dMatch) metaDescription = dMatch[1].trim();
      cleaned = content.replace(/META_TITLE:.*\n?/i, '').replace(/META_DESCRIPTION:.*\n?/i, '').trim();

      const firstH1 = cleaned.match(/^#\s+(.+)$/m)?.[1];
      const title = metaTitle || firstH1 || 'Actualités de la réparation : mise à jour';
      const slugBase = title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
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
          ai_model: model,
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

    // Default behavior: auto-publish scheduled posts
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({ status: 'published', published_at: nowIso })
      .in('id', scheduledPosts.map(p => p.id))
      .select();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        published_count: updatedPosts?.length || 0,
        published_posts: updatedPosts?.map(p => ({ id: p.id, title: p.title, published_at: p.published_at }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-auto-publish:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
