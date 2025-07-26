import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { repairer_id, item_ids } = await req.json();

    // Récupérer les éléments du catalogue
    const { data: items, error: itemsError } = await supabase
      .from('pos_inventory_items')
      .select('*')
      .eq('repairer_id', repairer_id)
      .in('id', item_ids);

    if (itemsError) throw itemsError;

    const generatedAds = [];

    // Générer des publicités pour chaque élément
    for (const item of items || []) {
      // Créer une campagne automatique
      const { data: campaign, error: campaignError } = await supabase
        .from('advertising_campaigns')
        .insert({
          repairer_id: repairer_id,
          name: `Campagne Auto - ${item.name}`,
          description: `Campagne générée automatiquement pour ${item.name}`,
          campaign_type: 'automated',
          budget_total: 50,
          budget_daily: 5,
          channels: ['google_ads', 'meta_ads'],
          targeting_config: {
            location_radius: 10,
            keywords: [item.name, item.category],
            demographics: { age_range: '25-55' }
          },
          creative_style: 'proximite',
          auto_optimization: true,
          status: 'draft'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Générer le contenu IA pour cet élément
      const contentTypes = ['ad_title', 'ad_description', 'image'];
      
      for (const contentType of contentTypes) {
        const { data: content, error: contentError } = await supabase.functions.invoke('generate-ai-content', {
          body: {
            content_type: contentType,
            source_item: {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.category
            },
            style: 'proximite',
            target_audience: 'Clients locaux',
            additional_context: 'Réparation de smartphone et accessoires'
          }
        });

        if (contentError) {
          console.warn(`Erreur génération contenu ${contentType}:`, contentError);
          continue;
        }

        // Créer une creative pour la campagne
        await supabase
          .from('campaign_creatives')
          .insert({
            campaign_id: campaign.id,
            creative_type: contentType,
            creative_data: content.generated_content,
            ai_generated: true,
            ai_model: content.ai_model,
            generation_prompt: content.generation_prompt,
            performance_score: content.quality_score,
            status: 'active',
            name: `${contentType} - ${item.name}`
          });
      }

      generatedAds.push({
        campaign_id: campaign.id,
        item_name: item.name,
        status: 'generated'
      });
    }

    return new Response(JSON.stringify({
      success: true,
      generated_ads: generatedAds,
      total_campaigns: generatedAds.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur génération publicités catalogue:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});