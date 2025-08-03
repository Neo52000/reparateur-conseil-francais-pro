import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupplierScrapingRequest {
  url: string;
}

interface SupplierData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  brands?: string[];
  certifications?: string[];
  product_types?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: SupplierScrapingRequest = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Firecrawl API key from secrets
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Scraping supplier website:', url);

    // Make request to Firecrawl API
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html']
      })
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success) {
      return new Response(
        JSON.stringify({ success: false, error: firecrawlData.error || 'Failed to scrape website' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the scraped data
    const parsedData = parseSupplierData(firecrawlData.data);
    
    console.log('Successfully scraped and parsed supplier data');

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error scraping supplier website:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseSupplierData(data: any): SupplierData {
  if (!data || !data.markdown) {
    return {};
  }

  const markdown = data.markdown;
  const html = data.html || '';
  
  // Extract company name from title or h1
  const titleMatch = markdown.match(/^#\s+(.+)/m) || html.match(/<title[^>]*>([^<]+)</i);
  const companyName = titleMatch ? titleMatch[1].replace(/\s*[-–|]\s*.*/g, '').trim() : '';

  // Extract description from meta description or first paragraph
  const metaDescMatch = html.match(/<meta[^>]+name=['"]description['"][^>]+content=['"]([^'"]+)/i);
  const firstParagraphMatch = markdown.match(/^(?!#)(.{50,200}\.)/m);
  const description = metaDescMatch ? metaDescMatch[1] : (firstParagraphMatch ? firstParagraphMatch[1] : '');

  // Extract contact information
  const emailMatch = markdown.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = markdown.match(/(?:\+33|0)[1-9](?:[0-9]{8})/);
  
  // Extract address from contact section or footer
  const addressPattern = /(?:adresse|address|siège)[:\s]*([^\n]+(?:\d{5}[^\n]*)?)/i;
  const addressMatch = markdown.match(addressPattern);
  const address = addressMatch ? addressMatch[1].trim() : '';

  // Extract brands/products from content
  const brandsKeywords = ['apple', 'samsung', 'huawei', 'xiaomi', 'sony', 'lg', 'oneplus', 'google', 'oppo', 'vivo'];
  const foundBrands = brandsKeywords.filter(brand => 
    markdown.toLowerCase().includes(brand.toLowerCase())
  );

  // Extract certifications
  const certificationKeywords = ['iso', 'certifié', 'agréé', 'qualifié', 'certification'];
  const hasCertifications = certificationKeywords.some(cert => 
    markdown.toLowerCase().includes(cert.toLowerCase())
  );

  return {
    name: companyName,
    description: description,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    address: address,
    brands: foundBrands,
    certifications: hasCertifications ? ['Certifié professionnel'] : [],
    product_types: ['Smartphones', 'Tablettes'], // Default values
  };
}