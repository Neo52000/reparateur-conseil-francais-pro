import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface City {
  name: string;
  dept: string;
  population: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cities, serviceType = 'smartphone', autoPublish = false } = await req.json();

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      throw new Error('Liste de villes requise');
    }

    console.log(`🚀 Génération batch pour ${cities.length} villes`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    for (const city of cities) {
      try {
        console.log(`📍 Traitement de ${city.name}...`);

        // Compter les réparateurs dans cette ville
        const { data: repairers, count } = await supabase
          .from('repairers')
          .select('*', { count: 'exact' })
          .ilike('city', `%${city.name}%`)
          .eq('is_verified', true);

        const repairerCount = count || repairers?.length || 1;

        // Calculer la note moyenne
        const averageRating = repairers && repairers.length > 0
          ? repairers.reduce((sum, r) => sum + (r.rating || 4.5), 0) / repairers.length
          : 4.5;

        // Générer le contenu avec IA
        const generateResponse = await fetch(
          `${supabaseUrl}/functions/v1/generate-local-seo-v3`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              city: city.name,
              serviceType,
              repairerCount,
              averageRating
            })
          }
        );

        if (!generateResponse.ok) {
          throw new Error(`Erreur génération pour ${city.name}: ${generateResponse.status}`);
        }

        const aiResult = await generateResponse.json();

        if (!aiResult.success) {
          throw new Error(aiResult.error || `Échec génération ${city.name}`);
        }

        const content = aiResult.content;

        // Créer le slug de la ville
        const citySlug = city.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Vérifier si la page existe déjà
        const slug = `reparateur-${serviceType}-${citySlug}`;
        const { data: existingPage } = await supabase
          .from('local_seo_pages')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        let pageResult;

        if (existingPage) {
          // Mettre à jour la page existante
          const { data: updatedPage, error: updateError } = await supabase
            .from('local_seo_pages')
            .update({
              title: content.title,
              meta_description: content.metaDescription,
              h1_title: content.h1,
              content_paragraph_1: content.paragraph1,
              content_paragraph_2: content.paragraph2,
              services: content.services || [],
              faq: content.faq || [],
              sample_testimonials: content.testimonials || [],
              repairer_count: repairerCount,
              average_rating: Math.round(averageRating * 10) / 10,
              generated_by_ai: true,
              ai_model: aiResult.model,
              last_updated_content: new Date().toISOString(),
              is_published: autoPublish
            })
            .eq('id', existingPage.id)
            .select()
            .single();

          if (updateError) throw updateError;
          pageResult = updatedPage;
        } else {
          // Créer une nouvelle page
          const { data: newPage, error: insertError } = await supabase
            .from('local_seo_pages')
            .insert({
              slug,
              city: city.name,
              city_slug: citySlug,
              service_type: serviceType,
              title: content.title,
              meta_description: content.metaDescription,
              h1_title: content.h1,
              content_paragraph_1: content.paragraph1,
              content_paragraph_2: content.paragraph2,
              cta_text: 'Obtenir mon devis gratuit',
              services: content.services || [],
              faq: content.faq || [],
              sample_testimonials: content.testimonials || [],
              repairer_count: repairerCount,
              average_rating: Math.round(averageRating * 10) / 10,
              is_published: autoPublish,
              generated_by_ai: true,
              ai_model: aiResult.model,
              generation_prompt: `Génération batch automatique pour ${city.name}`
            })
            .select()
            .single();

          if (insertError) throw insertError;
          pageResult = newPage;
        }

        results.push({
          city: city.name,
          success: true,
          pageId: pageResult.id,
          slug,
          repairerCount,
          averageRating: Math.round(averageRating * 10) / 10
        });

        console.log(`✅ ${city.name} généré avec succès`);

        // Rate limiting : 1 requête par seconde
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erreur pour ${city.name}:`, error);
        results.push({
          city: city.name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📊 Résumé: ${successCount} succès, ${failureCount} échecs`);

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: cities.length,
        success: successCount,
        failure: failureCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur batch generation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
