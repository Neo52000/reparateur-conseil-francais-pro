import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🗺️ Génération du sitemap dynamique...');

    const baseUrl = req.headers.get('origin') || 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
    const entries: SitemapEntry[] = [];

    // Page d'accueil
    entries.push({
      url: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    });

    // Pages de recherche principales
    entries.push({
      url: `${baseUrl}/search`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9'
    });

    // Pages SEO locales
    const { data: seoPages } = await supabaseClient
      .from('local_seo_pages')
      .select('slug, updated_at, is_published')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (seoPages) {
      seoPages.forEach(page => {
        entries.push({
          url: `${baseUrl}/${page.slug}`,
          lastmod: new Date(page.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        });
      });
    }

    // Profils de réparateurs actifs
    const { data: repairers } = await supabaseClient
      .from('repairers')
      .select('unique_id, updated_at, is_verified')
      .eq('is_verified', true)
      .limit(1000)
      .order('updated_at', { ascending: false });

    if (repairers) {
      repairers.forEach(repairer => {
        entries.push({
          url: `${baseUrl}/repairer/${repairer.unique_id}`,
          lastmod: new Date(repairer.updated_at || new Date()).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: '0.6'
        });
      });
    }

    // Générer le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Sauvegarder dans l'historique
    const { error: historyError } = await supabaseClient
      .from('sitemap_history')
      .insert({
        sitemap_content: sitemap,
        urls_count: entries.length,
        submitted_to_google: false
      });

    if (historyError) {
      console.error('❌ Erreur sauvegarde historique:', historyError);
    }

    // Mettre à jour les URLs surveillées
    for (const entry of entries) {
      const urlType = entry.url === baseUrl ? 'homepage' :
                     entry.url.includes('/search') ? 'search' :
                     entry.url.includes('/repairer/') ? 'repairer_profile' : 'seo_page';
      
      await supabaseClient.rpc('add_url_to_monitoring', {
        url_to_monitor: entry.url,
        url_type_param: urlType,
        priority_param: urlType === 'homepage' ? 10 : urlType === 'search' ? 9 : 5
      });
    }

    console.log(`✅ Sitemap généré avec ${entries.length} URLs`);

    // Vérifier si soumission automatique Google est activée
    const { data: config } = await supabaseClient
      .from('seo_monitoring_config')
      .select('sitemap_auto_update, google_search_console_token')
      .single();

    if (config?.sitemap_auto_update && config?.google_search_console_token) {
      // Déclencher la soumission à Google Search Console
      const { error: submissionError } = await supabaseClient.functions.invoke('google-search-console-api', {
        body: { action: 'submit_sitemap', sitemap_url: `${baseUrl}/sitemap.xml` }
      });

      if (submissionError) {
        console.error('❌ Erreur soumission Google:', submissionError);
      } else {
        console.log('🚀 Sitemap soumis à Google Search Console');
      }
    }

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});