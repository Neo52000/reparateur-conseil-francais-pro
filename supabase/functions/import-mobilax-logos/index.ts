import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description?: string;
    };
  }[];
  error?: string;
}

interface BrandLogo {
  name: string;
  logoUrl: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Mobilax logo extraction...');

    // Scraper la page principale de Mobilax
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.mobilax.fr',
        formats: ['html', 'markdown']
      })
    });

    const crawlResult: FirecrawlResponse = await firecrawlResponse.json();

    if (!crawlResult.success || !crawlResult.data?.[0]) {
      throw new Error(`Firecrawl failed: ${crawlResult.error || 'No data received'}`);
    }

    const htmlContent = crawlResult.data[0].html;
    const baseUrl = 'https://www.mobilax.fr';

    console.log('Parsing brand logos from HTML...');

    // Parser le HTML pour extraire les logos de marques
    const brandLogos: BrandLogo[] = [];
    
    // Regex patterns pour trouver les logos
    const logoPatterns = [
      // Images avec alt contenant des noms de marques
      /<img[^>]*alt=["'][^"']*(?:apple|samsung|huawei|xiaomi|oppo|oneplus|google|sony|lg|nokia|motorola|realme|honor|vivo)[^"']*["'][^>]*src=["']([^"']+)["']/gi,
      // Images dans des dossiers marques ou logos
      /<img[^>]*src=["']([^"']*(?:logo|brand|marque)[^"']*\.(?:png|jpg|jpeg|svg|webp))["']/gi,
      // Images avec des noms de marques dans le chemin
      /<img[^>]*src=["']([^"']*(?:apple|samsung|huawei|xiaomi|oppo|oneplus|google|sony|lg|nokia|motorola|realme|honor|vivo)[^"']*\.(?:png|jpg|jpeg|svg|webp))["']/gi
    ];

    // Marques communes dans la réparation mobile
    const commonBrands = [
      'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'OnePlus', 
      'Google', 'Sony', 'LG', 'Nokia', 'Motorola', 'Realme', 'Honor', 'Vivo'
    ];

    // Rechercher dans le HTML
    for (const pattern of logoPatterns) {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        const logoUrl = match[1];
        const fullUrl = logoUrl.startsWith('http') ? logoUrl : new URL(logoUrl, baseUrl).href;
        
        // Détecter le nom de la marque depuis l'URL ou l'alt
        const fullMatch = match[0];
        let brandName = '';
        let confidence = 0.5;

        for (const brand of commonBrands) {
          if (fullMatch.toLowerCase().includes(brand.toLowerCase()) || 
              fullUrl.toLowerCase().includes(brand.toLowerCase())) {
            brandName = brand;
            confidence = 0.8;
            break;
          }
        }

        if (brandName && !brandLogos.find(b => b.name === brandName)) {
          brandLogos.push({
            name: brandName,
            logoUrl: fullUrl,
            confidence
          });
        }
      }
    }

    console.log(`Found ${brandLogos.length} potential brand logos`);

    // Récupérer les marques existantes
    const { data: existingBrands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, logo_url');

    if (brandsError) {
      throw new Error(`Error fetching brands: ${brandsError.message}`);
    }

    let updatedCount = 0;
    let createdCount = 0;
    const results = [];

    // Mettre à jour ou créer les marques
    for (const logo of brandLogos) {
      // Vérifier si la marque existe déjà
      const existingBrand = existingBrands?.find(b => 
        b.name.toLowerCase() === logo.name.toLowerCase()
      );

      if (existingBrand) {
        // Mettre à jour seulement si pas de logo existant
        if (!existingBrand.logo_url) {
          const { error: updateError } = await supabase
            .from('brands')
            .update({ logo_url: logo.logoUrl })
            .eq('id', existingBrand.id);

          if (!updateError) {
            updatedCount++;
            results.push({
              action: 'updated',
              brand: logo.name,
              logoUrl: logo.logoUrl
            });
          }
        } else {
          results.push({
            action: 'skipped',
            brand: logo.name,
            reason: 'Logo already exists'
          });
        }
      } else {
        // Créer une nouvelle marque
        const { error: createError } = await supabase
          .from('brands')
          .insert([{
            name: logo.name,
            logo_url: logo.logoUrl
          }]);

        if (!createError) {
          createdCount++;
          results.push({
            action: 'created',
            brand: logo.name,
            logoUrl: logo.logoUrl
          });
        }
      }
    }

    console.log(`Import completed: ${updatedCount} updated, ${createdCount} created`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalFound: brandLogos.length,
          updated: updatedCount,
          created: createdCount,
          skipped: results.filter(r => r.action === 'skipped').length
        },
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-mobilax-logos:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});