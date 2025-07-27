import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, prompt, style, dimensions } = await req.json();

    let generatedContent;

    if (type === "text") {
      // Générer du texte avec Mistral ou autre modèle
      const textTemplates = {
        technique: [
          "🔧 Réparation professionnelle de {device} • Diagnostic gratuit • Pièces d'origine garanties",
          "⚡ Expert en réparation {device} • 15 ans d'expérience • Intervention rapide",
          "🛠️ Service technique de qualité • {device} réparé en 1h • Garantie 6 mois"
        ],
        proximite: [
          "👨‍🔧 Votre réparateur de quartier pour {device} • Service personnalisé et de confiance",
          "🏠 Réparation {device} à domicile • Proche de chez vous • Tarifs transparents",
          "🤝 Service de proximité • Réparation {device} • Relation de confiance depuis 10 ans"
        ],
        urgence: [
          "🚨 SOS {device} cassé ? Réparation EXPRESS en 30 min ! Ouvert 7j/7",
          "⏰ URGENT • {device} en panne ? Intervention immédiate • Disponible maintenant",
          "🔥 Réparation {device} ULTRA-RAPIDE • Service d'urgence • Appelez maintenant !"
        ],
        humour: [
          "😅 Votre {device} fait des siennes ? On le remet dans le droit chemin !",
          "🤣 {device} récalcitrant ? Notre équipe sait le convaincre de remarcher !",
          "😉 Votre {device} boude ? On lui redonne le sourire en un clin d'œil !"
        ],
        premium: [
          "💎 Service Premium • Réparation {device} haut de gamme • Excellence garantie",
          "✨ Atelier de luxe • Réparation {device} premium • Service VIP exclusif",
          "🏆 Expertise d'exception • {device} traité avec le plus grand soin • Prestige assuré"
        ]
      };

      const templates = textTemplates[style as keyof typeof textTemplates] || textTemplates.technique;
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      generatedContent = {
        text: randomTemplate.replace("{device}", "smartphone"),
        style,
        generated_at: new Date().toISOString()
      };
    } else if (type === "image") {
      // Pour l'image, retourner une URL placeholder ou intégrer avec un service d'IA
      const { width = 1200, height = 630 } = dimensions || {};
      generatedContent = {
        image_url: `https://via.placeholder.com/${width}x${height}/4F46E5/ffffff?text=Créatif+IA+${style}`,
        dimensions: { width, height },
        style,
        generated_at: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      creative: generatedContent 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating creative:", error);
    return new Response(JSON.stringify({ 
      error: "Erreur lors de la génération du créatif",
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});