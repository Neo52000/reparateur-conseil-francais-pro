import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { action, sitemap_url, site_url } = await req.json();

    console.log(`🚀 Google Search Console API - Action: ${action}`);

    // Récupérer le token Google Search Console
    const { data: config } = await supabaseClient
      .from('seo_monitoring_config')
      .select('google_search_console_token')
      .single();

    if (!config?.google_search_console_token) {
      return new Response(
        JSON.stringify({ error: 'Google Search Console token not configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const accessToken = config.google_search_console_token;

    switch (action) {
      case 'submit_sitemap':
        return await submitSitemap(accessToken, sitemap_url, site_url, supabaseClient);
      
      case 'get_sitemaps':
        return await getSitemaps(accessToken, site_url);
      
      case 'get_indexing_status':
        return await getIndexingStatus(accessToken, site_url);
      
      case 'request_indexing':
        return await requestIndexing(accessToken, sitemap_url);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('❌ Erreur Google Search Console API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function submitSitemap(
  accessToken: string, 
  sitemapUrl: string, 
  siteUrl: string,
  supabaseClient: any
): Promise<Response> {
  try {
    const targetSiteUrl = siteUrl || 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
    const encodedSiteUrl = encodeURIComponent(targetSiteUrl);
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

    console.log(`📤 Soumission sitemap: ${sitemapUrl} pour ${targetSiteUrl}`);

    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps/${encodedSitemapUrl}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseData = await response.text();
    const isSuccess = response.ok;

    // Mettre à jour l'historique du sitemap
    await supabaseClient
      .from('sitemap_history')
      .update({
        submitted_to_google: isSuccess,
        google_submission_status: isSuccess ? 'success' : `error: ${response.status}`
      })
      .order('created_at', { ascending: false })
      .limit(1);

    if (isSuccess) {
      console.log('✅ Sitemap soumis avec succès à Google Search Console');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sitemap submitted successfully',
          sitemap_url: sitemapUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('❌ Erreur soumission sitemap:', response.status, responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit sitemap', 
          status: response.status,
          details: responseData
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ Erreur soumission sitemap:', error);
    throw error;
  }
}

async function getSitemaps(accessToken: string, siteUrl: string): Promise<Response> {
  try {
    const targetSiteUrl = siteUrl || 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
    const encodedSiteUrl = encodeURIComponent(targetSiteUrl);

    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ success: true, sitemaps: data.sitemap || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Erreur récupération sitemaps:', error);
    throw error;
  }
}

async function getIndexingStatus(accessToken: string, siteUrl: string): Promise<Response> {
  try {
    const targetSiteUrl = siteUrl || 'https://nbugpbakfkyvvjzgfjmw.supabase.co';
    const encodedSiteUrl = encodeURIComponent(targetSiteUrl);

    // Récupérer les métriques de couverture d'index
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['page'],
          rowLimit: 100
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        indexing_data: data,
        indexed_pages: data.rows?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Erreur status indexation:', error);
    throw error;
  }
}

async function requestIndexing(accessToken: string, url: string): Promise<Response> {
  try {
    console.log(`🔄 Demande d'indexation pour: ${url}`);

    // Utiliser l'API Indexing pour demander l'indexation d'une URL spécifique
    const response = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Demande d\'indexation envoyée');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Indexing request sent',
        response: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Erreur demande indexation:', error);
    throw error;
  }
}