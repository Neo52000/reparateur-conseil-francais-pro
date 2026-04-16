import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default site_id for single-tenant platform
const DEFAULT_SITE_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================
// LLM Provider Interfaces
// ============================================================

interface LlmResponse {
  provider: string;
  model: string;
  content: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

interface BrandAnalysis {
  brand_mentioned: boolean;
  company_domain_rank: number | null;
  top_domain: string | null;
  mentioned_pages: string[];
}

// ============================================================
// LLM API Calls
// ============================================================

async function callOpenAI(prompt: string, apiKey: string): Promise<LlmResponse> {
  const model = 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  // gpt-4o-mini pricing: $0.15/1M input, $0.60/1M output
  const costIn = (usage.prompt_tokens || 0) * 0.00000015;
  const costOut = (usage.completion_tokens || 0) * 0.0000006;

  return {
    provider: 'openai',
    model,
    content: data.choices?.[0]?.message?.content || '',
    tokensIn: usage.prompt_tokens || 0,
    tokensOut: usage.completion_tokens || 0,
    cost: costIn + costOut,
  };
}

async function callGemini(prompt: string, apiKey: string): Promise<LlmResponse> {
  const model = 'gemini-2.0-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata || {};
  // Gemini 2.0 Flash pricing: ~$0.10/1M input, ~$0.40/1M output
  const tokensIn = usage.promptTokenCount || 0;
  const tokensOut = usage.candidatesTokenCount || 0;
  const costIn = tokensIn * 0.0000001;
  const costOut = tokensOut * 0.0000004;

  return {
    provider: 'google',
    model,
    content,
    tokensIn,
    tokensOut,
    cost: costIn + costOut,
  };
}

async function callPerplexity(prompt: string, apiKey: string): Promise<LlmResponse> {
  const model = 'sonar';
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  // Perplexity Sonar pricing: $1/1M input, $1/1M output
  const costIn = (usage.prompt_tokens || 0) * 0.000001;
  const costOut = (usage.completion_tokens || 0) * 0.000001;

  return {
    provider: 'perplexity',
    model,
    content: data.choices?.[0]?.message?.content || '',
    tokensIn: usage.prompt_tokens || 0,
    tokensOut: usage.completion_tokens || 0,
    cost: costIn + costOut,
  };
}

// ============================================================
// Brand Analysis
// ============================================================

function analyzeBrandMention(
  responseText: string,
  profile: { website: string | null; name_aliases: string[] }
): BrandAnalysis {
  const text = responseText.toLowerCase();
  const mentioned_pages: string[] = [];

  // Check brand name aliases
  const aliases = (profile.name_aliases || []).map((a: string) => a.toLowerCase().trim()).filter(Boolean);
  let brand_mentioned = false;

  for (const alias of aliases) {
    if (alias && text.includes(alias)) {
      brand_mentioned = true;
      break;
    }
  }

  // Check website domain
  const domain = profile.website
    ? profile.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
    : null;

  if (domain && text.includes(domain)) {
    brand_mentioned = true;
  }

  // Extract URLs/domains mentioned in the response
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-z0-9][-a-z0-9]*(?:\.[a-z]{2,})+)/gi;
  const domainMatches = new Set<string>();
  let match;
  while ((match = urlRegex.exec(responseText)) !== null) {
    const foundDomain = match[1].toLowerCase();
    if (!foundDomain.includes('example.com') && !foundDomain.includes('openai.com')) {
      domainMatches.add(foundDomain);
      mentioned_pages.push(match[0]);
    }
  }

  // Determine domain rank
  const domainList = Array.from(domainMatches);
  let company_domain_rank: number | null = null;
  if (domain) {
    const idx = domainList.findIndex((d) => d.includes(domain));
    if (idx >= 0) company_domain_rank = idx + 1;
  }

  const top_domain = domainList.length > 0 ? domainList[0] : null;

  return { brand_mentioned, company_domain_rank, top_domain, mentioned_pages };
}

// ============================================================
// Stats Computation
// ============================================================

async function computeDashboardStats(supabase: any, siteId: string, competitors: any[]) {
  // Get all prompt runs for this site
  const { data: runs, error: runsErr } = await supabase
    .from('ai_cmo_prompt_runs')
    .select('brand_mentioned, top_domain, company_domain_rank')
    .eq('site_id', siteId);

  if (runsErr || !runs || runs.length === 0) {
    console.log('No runs to compute stats from');
    return;
  }

  const totalRuns = runs.length;
  const mentionedCount = runs.filter((r: any) => r.brand_mentioned).length;
  const aiVisibilityScore = mentionedCount / totalRuns;

  // Count domain mentions for share of voice
  const domainCounts: Record<string, number> = {};
  for (const run of runs) {
    if (run.top_domain) {
      domainCounts[run.top_domain] = (domainCounts[run.top_domain] || 0) + 1;
    }
  }

  // Get the user's domain from profile
  const { data: profile } = await supabase
    .from('ai_cmo_profiles')
    .select('website')
    .eq('site_id', siteId)
    .maybeSingle();

  const userDomain = profile?.website
    ? profile.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
    : null;

  const competitorDomains = competitors.map((c: any) =>
    c.website ? c.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase() : ''
  ).filter(Boolean);

  // Build share of voice array
  const totalDomainMentions = Object.values(domainCounts).reduce((a: number, b: number) => a + b, 0);
  const shareOfVoice = Object.entries(domainCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 20)
    .map(([domain, count]) => {
      let type = 'other';
      if (userDomain && domain.includes(userDomain)) type = 'you';
      else if (competitorDomains.some((cd: string) => domain.includes(cd))) type = 'competitor';
      return {
        domain,
        count,
        percentage: totalDomainMentions > 0 ? ((count as number) / totalDomainMentions) * 100 : 0,
        type,
      };
    });

  // Website citation share
  const userDomainCount = userDomain
    ? Object.entries(domainCounts)
        .filter(([d]) => d.includes(userDomain))
        .reduce((sum, [, c]) => sum + (c as number), 0)
    : 0;
  const websiteCitationShare = totalDomainMentions > 0 ? userDomainCount / totalDomainMentions : 0;

  // Upsert dashboard stats
  const { data: existing } = await supabase
    .from('ai_cmo_dashboard_stats')
    .select('id')
    .eq('site_id', siteId)
    .maybeSingle();

  const statsPayload = {
    site_id: siteId,
    ai_visibility_score: aiVisibilityScore,
    website_citation_share: websiteCitationShare,
    total_runs: totalRuns,
    share_of_voice: shareOfVoice,
    computed_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from('ai_cmo_dashboard_stats').update(statsPayload).eq('id', existing.id);
  } else {
    await supabase.from('ai_cmo_dashboard_stats').insert([statsPayload]);
  }

  console.log(`📊 Dashboard stats updated: visibility=${(aiVisibilityScore * 100).toFixed(1)}%, citation_share=${(websiteCitationShare * 100).toFixed(1)}%, total_runs=${totalRuns}`);
}

// ============================================================
// Recommendation Engine
// ============================================================

async function generateRecommendations(supabase: any, siteId: string, competitors: any[], openaiKey: string | null) {
  if (!openaiKey || competitors.length === 0) return;

  // Get recent runs where brand was NOT mentioned but competitors were
  const { data: runs } = await supabase
    .from('ai_cmo_prompt_runs')
    .select('*, ai_cmo_questions(prompt)')
    .eq('site_id', siteId)
    .eq('brand_mentioned', false)
    .order('run_at', { ascending: false })
    .limit(50);

  if (!runs || runs.length === 0) return;

  // Group by competitor domains mentioned
  for (const competitor of competitors.slice(0, 5)) {
    const competitorDomain = competitor.website
      ? competitor.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
      : competitor.name.toLowerCase();

    const relevantRuns = runs.filter((r: any) =>
      r.raw_response && r.raw_response.toLowerCase().includes(competitorDomain)
    );

    if (relevantRuns.length === 0) continue;

    // Check if we already have a recent recommendation for this competitor
    const { data: existingRec } = await supabase
      .from('ai_cmo_recommendations')
      .select('id, created_at')
      .eq('site_id', siteId)
      .eq('competitor_domain', competitorDomain)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingRec) {
      const daysSince = (Date.now() - new Date(existingRec.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) continue; // Skip if recommendation is less than a week old
    }

    const promptTexts = relevantRuns.slice(0, 5).map((r: any) => r.ai_cmo_questions?.prompt || 'N/A');

    try {
      const analysisPrompt = `Tu es un expert en visibilite de marque dans les IA conversationnelles.

Le concurrent "${competitor.name}" (${competitorDomain}) est cite dans les reponses IA pour ces questions, mais PAS notre marque.

Questions concernees:
${promptTexts.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

Reponds en JSON avec exactement ces 3 champs:
{
  "why_competitor": "Explication de pourquoi le concurrent est cite (2-3 phrases)",
  "why_not_user": "Explication de pourquoi nous ne sommes pas cites (2-3 phrases)",
  "what_to_do": "Plan d'action concret en 3-5 points pour ameliorer notre visibilite"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) continue;

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) continue;

      const analysis = JSON.parse(content);

      await supabase.from('ai_cmo_recommendations').insert([{
        site_id: siteId,
        competitor_domain: competitorDomain,
        prompts_to_analyze: promptTexts,
        why_competitor: analysis.why_competitor || null,
        why_not_user: analysis.why_not_user || null,
        what_to_do: analysis.what_to_do || null,
        completed_at: new Date().toISOString(),
      }]);

      console.log(`💡 Recommendation generated for competitor: ${competitorDomain}`);
    } catch (err) {
      console.warn(`⚠️ Failed to generate recommendation for ${competitorDomain}:`, err);
    }
  }
}

// ============================================================
// Cost Tracking
// ============================================================

async function trackCost(supabase: any, siteId: string, llmResponse: LlmResponse, callType: string) {
  const today = new Date().toISOString().split('T')[0];

  // Try to update existing row for today + model
  const { data: existing } = await supabase
    .from('ai_cmo_llm_costs')
    .select('id, cost, call_count, tokens_in, tokens_out')
    .eq('site_id', siteId)
    .eq('model', llmResponse.model)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    await supabase.from('ai_cmo_llm_costs').update({
      cost: (existing.cost || 0) + llmResponse.cost,
      call_count: (existing.call_count || 0) + 1,
      tokens_in: (existing.tokens_in || 0) + llmResponse.tokensIn,
      tokens_out: (existing.tokens_out || 0) + llmResponse.tokensOut,
    }).eq('id', existing.id);
  } else {
    await supabase.from('ai_cmo_llm_costs').insert([{
      site_id: siteId,
      model: llmResponse.model,
      call_type: callType,
      date: today,
      cost: llmResponse.cost,
      call_count: 1,
      tokens_in: llmResponse.tokensIn,
      tokens_out: llmResponse.tokensOut,
    }]);
  }
}

// ============================================================
// Main Handler
// ============================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY') || null;
    const geminiKey = Deno.env.get('GEMINI_API_KEY') || null;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY') || null;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional request body
    let siteId = DEFAULT_SITE_ID;
    let forceAll = false;
    try {
      const body = await req.json();
      if (body.site_id) siteId = body.site_id;
      if (body.force_all) forceAll = body.force_all;
    } catch {
      // No body or invalid JSON — use defaults
    }

    console.log(`🚀 AI-CMO Worker starting for site_id=${siteId}, force_all=${forceAll}`);

    // 1. Load profile for brand analysis
    const { data: profile } = await supabase
      .from('ai_cmo_profiles')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'No AI-CMO profile configured. Please set up your profile first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Load active questions due for execution
    const now = new Date().toISOString();
    let query = supabase
      .from('ai_cmo_questions')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!forceAll) {
      // Only fetch questions that are due (next_run_at <= now OR next_run_at IS NULL)
      query = query.or(`next_run_at.is.null,next_run_at.lte.${now}`);
    }

    const { data: questions, error: questionsErr } = await query;

    if (questionsErr) {
      throw new Error(`Failed to fetch questions: ${questionsErr.message}`);
    }

    if (!questions || questions.length === 0) {
      console.log('📭 No questions due for execution');
      return new Response(
        JSON.stringify({ success: true, message: 'No questions due for execution', runs_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`📋 Found ${questions.length} questions to process`);

    // 3. Load competitors for stats computation
    const { data: competitors } = await supabase
      .from('ai_cmo_competitors')
      .select('*')
      .eq('site_id', siteId);

    // 4. Determine which LLM providers are available
    const providers: { name: string; fn: (prompt: string) => Promise<LlmResponse> }[] = [];
    if (openaiKey) providers.push({ name: 'openai', fn: (p) => callOpenAI(p, openaiKey) });
    if (geminiKey) providers.push({ name: 'google', fn: (p) => callGemini(p, geminiKey) });
    if (perplexityKey) providers.push({ name: 'perplexity', fn: (p) => callPerplexity(p, perplexityKey) });

    if (providers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No LLM API keys configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or PERPLEXITY_API_KEY in Supabase secrets.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🤖 Available providers: ${providers.map(p => p.name).join(', ')}`);

    // 5. Execute each question against each provider
    let runsCreated = 0;
    const errors: string[] = [];

    for (const question of questions) {
      for (const provider of providers) {
        try {
          console.log(`🔍 Running question "${question.prompt.substring(0, 50)}..." on ${provider.name}`);

          const llmResponse = await provider.fn(question.prompt);
          const analysis = analyzeBrandMention(llmResponse.content, {
            website: profile.website,
            name_aliases: profile.name_aliases || [],
          });

          // Insert prompt run
          await supabase.from('ai_cmo_prompt_runs').insert([{
            site_id: siteId,
            question_id: question.id,
            llm_provider: llmResponse.provider,
            llm_model: llmResponse.model,
            brand_mentioned: analysis.brand_mentioned,
            company_domain_rank: analysis.company_domain_rank,
            top_domain: analysis.top_domain,
            raw_response: llmResponse.content,
            mentioned_pages: analysis.mentioned_pages,
            run_at: new Date().toISOString(),
          }]);

          // Track cost
          await trackCost(supabase, siteId, llmResponse, 'monitoring');

          runsCreated++;

          console.log(`  ✅ brand_mentioned=${analysis.brand_mentioned}, rank=${analysis.company_domain_rank}, top_domain=${analysis.top_domain}`);
        } catch (err: unknown) {
          const msg = `${provider.name}/${question.id}: ${(err as Error).message}`;
          console.warn(`  ❌ ${msg}`);
          errors.push(msg);
        }
      }

      // Update question last_run_at and next_run_at
      const nextRun = new Date(Date.now() + question.refresh_interval_seconds * 1000).toISOString();
      await supabase.from('ai_cmo_questions').update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun,
      }).eq('id', question.id);
    }

    // 6. Recompute dashboard stats
    console.log('📊 Computing dashboard stats...');
    await computeDashboardStats(supabase, siteId, competitors || []);

    // 7. Generate recommendations
    console.log('💡 Generating recommendations...');
    await generateRecommendations(supabase, siteId, competitors || [], openaiKey);

    // 8. Return results
    const result = {
      success: true,
      site_id: siteId,
      questions_processed: questions.length,
      providers_used: providers.map(p => p.name),
      runs_created: runsCreated,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`✅ AI-CMO Worker completed: ${runsCreated} runs created, ${errors.length} errors`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    console.error('❌ AI-CMO Worker error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
