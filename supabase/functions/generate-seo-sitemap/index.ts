import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer toutes les pages SEO publiées
    const { data: pages, error } = await supabaseClient
      .from('local_seo_pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const baseUrl = req.headers.get('origin') || 'https://your-domain.com';
    
    // Générer le sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Pages de recherche principales -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Pages SEO locales -->
${pages?.map(page => `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${new Date(page.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/images/seo/${page.slug}.jpg</image:loc>
      <image:caption>Réparation professionnelle près de chez vous</image:caption>
    </image:image>
  </url>`).join('\n') || ''}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache 1 heure
      }
    });

  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});