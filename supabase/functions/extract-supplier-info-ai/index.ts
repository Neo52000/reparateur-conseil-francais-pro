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
  address_street?: string;
  address_city?: string;
  address_postal?: string;
  address_country?: string;
  website?: string;
  brands_sold?: string[];
  product_types?: string[];
  specialties?: string[];
  certifications?: string[];
  payment_terms?: string;
  minimum_order?: string;
  delivery_zones?: string;
  delivery_time?: string;
  delivery_cost?: string;
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
      ? `Analysez ce contenu de site web d'un fournisseur/grossiste en électronique/téléphonie et extrayez toutes les informations commerciales disponibles. Recherchez spécifiquement :

INFORMATIONS GÉNÉRALES :
- Nom de l'entreprise
- Description détaillée de l'activité
- Email de contact principal
- Numéro de téléphone
- Adresse complète (rue, ville, code postal, pays séparés)
- Site web

PRODUITS ET SERVICES :
- Marques vendues/distribuées (Apple, Samsung, Huawei, etc.)
- Types de produits (smartphones, tablettes, accessoires, pièces détachées, etc.)
- Spécialités techniques (réparation express, microsoudure, formation, etc.)
- Certifications professionnelles

INFORMATIONS COMMERCIALES :
- Conditions de paiement (comptant, 30 jours, etc.)
- Commande minimum
- Zones de livraison
- Délais de livraison
- Coûts de livraison

Contenu du site :
${content.substring(0, 8000)}

Retournez UNIQUEMENT un objet JSON valide avec ces champs (utilisez null pour les données manquantes) :
{
  "name": "nom de l'entreprise",
  "description": "description détaillée de l'activité",
  "email": "email de contact",
  "phone": "numéro de téléphone",
  "address_street": "adresse rue",
  "address_city": "ville",
  "address_postal": "code postal",
  "address_country": "pays",
  "website": "url du site web",
  "brands_sold": ["marque1", "marque2"],
  "product_types": ["smartphones", "tablettes", "accessoires"],
  "specialties": ["réparation express", "microsoudure"],
  "certifications": ["certification1", "certification2"],
  "payment_terms": "conditions de paiement",
  "minimum_order": "commande minimum",
  "delivery_zones": "zones de livraison",
  "delivery_time": "délais de livraison",
  "delivery_cost": "coûts de livraison"
}`
      : `Recherchez des informations sur l'entreprise fournisseur/grossiste en électronique/téléphonie à l'adresse ${url}. Extrayez toutes les informations commerciales disponibles :

INFORMATIONS À RECHERCHER :
- Nom de l'entreprise et description de l'activité
- Coordonnées (email, téléphone, adresse complète)
- Marques vendues/distribuées (Apple, Samsung, Huawei, etc.)
- Types de produits (smartphones, tablettes, accessoires, pièces détachées)
- Spécialités techniques (réparation, formation, services)
- Certifications professionnelles
- Conditions commerciales (paiement, commande minimum, livraison)

Retournez UNIQUEMENT un objet JSON valide avec ces champs (utilisez null pour les données manquantes) :
{
  "name": "nom de l'entreprise",
  "description": "description détaillée de l'activité",
  "email": "email de contact",
  "phone": "numéro de téléphone",
  "address_street": "adresse rue",
  "address_city": "ville",
  "address_postal": "code postal",
  "address_country": "pays",
  "website": "url du site web",
  "brands_sold": ["marque1", "marque2"],
  "product_types": ["smartphones", "tablettes", "accessoires"],
  "specialties": ["réparation express", "microsoudure"],
  "certifications": ["certification1", "certification2"],
  "payment_terms": "conditions de paiement",
  "minimum_order": "commande minimum",
  "delivery_zones": "zones de livraison",
  "delivery_time": "délais de livraison",
  "delivery_cost": "coûts de livraison"
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
      address_street: supplierData.address_street?.trim() || null,
      address_city: supplierData.address_city?.trim() || null,
      address_postal: supplierData.address_postal?.trim() || null,
      address_country: supplierData.address_country?.trim() || null,
      website: supplierData.website?.trim() || url,
      brands_sold: Array.isArray(supplierData.brands_sold) ? supplierData.brands_sold.filter(b => b?.trim()) : [],
      product_types: Array.isArray(supplierData.product_types) ? supplierData.product_types.filter(p => p?.trim()) : [],
      specialties: Array.isArray(supplierData.specialties) ? supplierData.specialties.filter(s => s?.trim()) : [],
      certifications: Array.isArray(supplierData.certifications) ? supplierData.certifications.filter(c => c?.trim()) : [],
      payment_terms: supplierData.payment_terms?.trim() || null,
      minimum_order: supplierData.minimum_order?.trim() || null,
      delivery_zones: supplierData.delivery_zones?.trim() || null,
      delivery_time: supplierData.delivery_time?.trim() || null,
      delivery_cost: supplierData.delivery_cost?.trim() || null
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