import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repairer_id } = await req.json();
    
    if (!repairer_id) {
      throw new Error('repairer_id est requis');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les données du réparateur
    const { data: repairer, error: repairerError } = await supabase
      .from('repairers')
      .select('*')
      .eq('id', repairer_id)
      .single();

    if (repairerError || !repairer) {
      throw new Error(`Réparateur non trouvé: ${repairerError?.message}`);
    }

    // Créer le slug URL-friendly
    const nameSlug = (repairer.business_name || repairer.name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const citySlug = repairer.city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${citySlug}-${nameSlug}`;
    const urlPath = `/${citySlug}/${nameSlug}`;

    // Vérifier si une page existe déjà
    const { data: existingPage } = await supabase
      .from('repairer_seo_pages')
      .select('id')
      .eq('repairer_id', repairer_id)
      .maybeSingle();

    // Générer le contenu SEO
    const businessName = repairer.business_name || repairer.name;
    const servicesText = repairer.services?.join(', ') || 'réparation smartphone, tablette, ordinateur';
    const specialtiesText = repairer.specialties?.join(', ') || 'toutes marques';

    const title = `Réparation smartphone à ${repairer.city} | ${businessName}`;
    const metaDescription = `${businessName} répare iPhone, Samsung, Huawei à ${repairer.city}. ${repairer.is_verified ? 'Professionnel vérifié. ' : ''}Diagnostic gratuit, devis rapide et pièces garanties.`;
    const h1Title = `Réparation smartphone à ${repairer.city}`;

    const introParagraph = `
      Chez <strong>${businessName}</strong>, nous réparons tous vos smartphones, tablettes et appareils électroniques à ${repairer.city}. 
      ${repairer.is_verified ? 'Professionnel vérifié et certifié TopRéparateurs.fr. ' : ''}
      Que ce soit un écran cassé, une batterie fatiguée, un connecteur défaillant ou tout autre problème, 
      notre équipe d'experts est là pour vous proposer une solution rapide et efficace.
      <br><br>
      Diagnostic gratuit, devis immédiat, et pièces garanties. Faites confiance à un réparateur local de confiance.
    `;

    const servicesDescription = `
      <h3>Nos services de réparation</h3>
      <ul>
        ${repairer.services?.map((s: string) => `<li>${s}</li>`).join('') || 
          '<li>Écran cassé</li><li>Batterie</li><li>Micro</li><li>Caméra</li><li>Connecteur de charge</li>'}
      </ul>
      <p>Nous réparons toutes les marques : ${specialtiesText}</p>
      ${repairer.response_time ? `<p>Temps de réparation moyen : ${repairer.response_time}</p>` : ''}
    `;

    const whyChooseUs = `
      <h3>Pourquoi nous choisir ?</h3>
      <ul>
        <li><strong>Diagnostic gratuit</strong> - Évaluation complète de votre appareil sans frais</li>
        <li><strong>Pièces garanties</strong> - Toutes nos pièces détachées sont garanties</li>
        <li><strong>Réparation express</strong> - Intervention rapide pour vous dépanner au plus vite</li>
        <li><strong>Service local à ${repairer.city}</strong> - Proximité et disponibilité</li>
        ${repairer.is_verified ? '<li><strong>Professionnel vérifié TopRéparateurs.fr</strong> - Confiance garantie</li>' : ''}
        ${repairer.rating ? `<li><strong>Note client : ${repairer.rating}/5</strong> ${repairer.review_count ? `(${repairer.review_count} avis)` : ''}</li>` : ''}
      </ul>
    `;

    // Générer les données structurées Schema.org
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": businessName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": repairer.address,
        "addressLocality": repairer.city,
        "postalCode": repairer.postal_code,
        "addressRegion": repairer.region,
        "addressCountry": "FR"
      },
      "telephone": repairer.phone || '',
      "email": repairer.email || '',
      "url": `https://topreparateurs.fr${urlPath}`,
      "priceRange": repairer.price_range === 'low' ? '€' : repairer.price_range === 'high' ? '€€€' : '€€',
      "openingHours": repairer.opening_hours || "Mo-Fr 09:00-18:00",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": repairer.lat || repairer.latitude,
        "longitude": repairer.lng || repairer.longitude
      },
      "aggregateRating": repairer.rating ? {
        "@type": "AggregateRating",
        "ratingValue": repairer.rating,
        "reviewCount": repairer.review_count || 1
      } : undefined,
      "sameAs": repairer.website ? [repairer.website] : []
    };

    const pageData = {
      repairer_id,
      slug,
      url_path: urlPath,
      title,
      meta_description: metaDescription.substring(0, 160), // Limiter à 160 caractères
      h1_title: h1Title,
      intro_paragraph: introParagraph,
      services_description: servicesDescription,
      why_choose_us: whyChooseUs,
      structured_data: structuredData,
      is_published: true,
      last_generated_at: new Date().toISOString()
    };

    if (existingPage) {
      // Mettre à jour la page existante
      const { error: updateError } = await supabase
        .from('repairer_seo_pages')
        .update(pageData)
        .eq('id', existingPage.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Page SEO mise à jour pour ${businessName}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Page SEO mise à jour',
          url_path: urlPath,
          page_id: existingPage.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Créer une nouvelle page
      const { data: newPage, error: insertError } = await supabase
        .from('repairer_seo_pages')
        .insert(pageData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Nouvelle page SEO créée pour ${businessName}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Page SEO créée',
          url_path: urlPath,
          page_id: newPage.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Erreur génération page SEO:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
