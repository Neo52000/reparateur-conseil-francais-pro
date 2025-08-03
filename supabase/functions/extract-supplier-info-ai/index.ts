import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupplierData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  brands?: string[];
  certifications?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, content } = await req.json();
    console.log('Extracting supplier info for:', url);

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const prompt = content 
      ? `Analyze the following website content and extract supplier information in JSON format. Focus on finding: company name, business description, email, phone, address, brands sold/serviced, certifications.

Website content:
${content.substring(0, 8000)}

Return ONLY a valid JSON object with these fields (use null for missing data):
{
  "name": "company name",
  "description": "business description", 
  "email": "contact email",
  "phone": "phone number",
  "address": "full address",
  "website": "website url",
  "brands": ["brand1", "brand2"],
  "certifications": ["cert1", "cert2"]
}`
      : `Search for information about the company at ${url} and extract supplier information in JSON format. Focus on finding: company name, business description, contact email, phone number, address, brands they sell/service, certifications.

Return ONLY a valid JSON object with these fields (use null for missing data):
{
  "name": "company name",
  "description": "business description",
  "email": "contact email", 
  "phone": "phone number",
  "address": "full address",
  "website": "website url",
  "brands": ["brand1", "brand2"],
  "certifications": ["cert1", "cert2"]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction specialist. Extract supplier information and return ONLY valid JSON, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse JSON from AI response
    let supplierData: SupplierData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      supplierData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Clean and validate data
    const cleanedData: SupplierData = {
      name: supplierData.name?.trim() || null,
      description: supplierData.description?.trim() || null,
      email: supplierData.email?.toLowerCase().trim() || null,
      phone: supplierData.phone?.replace(/[^\d+\s.-]/g, '').trim() || null,
      address: supplierData.address?.trim() || null,
      website: supplierData.website?.trim() || url,
      brands: Array.isArray(supplierData.brands) ? supplierData.brands.filter(b => b?.trim()) : [],
      certifications: Array.isArray(supplierData.certifications) ? supplierData.certifications.filter(c => c?.trim()) : []
    };

    // Validate email format
    if (cleanedData.email && !/^[^@]+@[^@]+\.[^@]+$/.test(cleanedData.email)) {
      cleanedData.email = null;
    }

    console.log('Cleaned supplier data:', cleanedData);

    return new Response(JSON.stringify({
      success: true,
      data: cleanedData,
      source: 'perplexity_ai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-supplier-info-ai function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});