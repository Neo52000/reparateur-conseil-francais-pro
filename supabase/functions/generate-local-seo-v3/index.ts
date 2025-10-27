import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { city, serviceType, repairerCount, averageRating, existingContent, regenerate } = await req.json();

    console.log(`🚀 Génération contenu SEO v3 pour ${city} - ${serviceType}`);

    if (!city || !serviceType) {
      throw new Error('Paramètres city et serviceType requis');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('⚠️ Clé Lovable AI manquante, utilisation du template statique');
      return generateStaticContent(city, serviceType, repairerCount, averageRating);
    }

    // System prompt optimisé pour Gemini 2.5 Flash
    const systemPrompt = `Tu es un expert en SEO local et copywriting pour services de réparation.
Génère un contenu optimisé, naturel et convaincant.

VILLE: ${city}
SERVICE: Réparation ${serviceType}
RÉPARATEURS: ${repairerCount || 1}
NOTE MOYENNE: ${averageRating || 4.8}/5

Ton du contenu:
- Professionnel mais chaleureux
- Axé sur la proximité et la confiance
- Pas de marketing agressif
- Focus avantages locaux (rapidité, proximité, engagement écologique)

Mots-clés SEO à intégrer naturellement:
- Primary: "réparation ${serviceType} ${city}"
- Secondary: "réparateur ${serviceType} ${city}", "atelier ${serviceType} ${city}"
- Long-tail: "prix réparation ${serviceType} ${city}", "devis ${serviceType} ${city}"`;

    const userPrompt = `Génère le contenu complet pour une page SEO locale de réparation ${serviceType} à ${city}.`;

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_local_seo_content",
                description: "Generate optimized local SEO content",
                parameters: {
                  type: "object",
                  properties: {
                    title: { 
                      type: "string", 
                      description: "SEO title 60-70 chars with keyword" 
                    },
                    metaDescription: { 
                      type: "string", 
                      description: "Meta desc 150-160 chars, engaging" 
                    },
                    h1: { 
                      type: "string", 
                      description: "Main H1 title with city and service" 
                    },
                    paragraph1: { 
                      type: "string", 
                      description: "First paragraph 200-250 words, informative" 
                    },
                    paragraph2: { 
                      type: "string", 
                      description: "Second paragraph 200-250 words with local details" 
                    },
                    services: {
                      type: "array",
                      description: "List of 4-6 key services",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Service name" },
                          price: { type: "string", description: "Price range like '49-79€'" },
                          duration: { type: "string", description: "Time like '30min' or '1h'" }
                        },
                        required: ["name", "price", "duration"]
                      }
                    },
                    testimonials: {
                      type: "array",
                      description: "3 realistic testimonials",
                      items: {
                        type: "object",
                        properties: {
                          author: { type: "string", description: "First name + initial" },
                          rating: { type: "number", description: "Rating 4-5" },
                          comment: { type: "string", description: "Short review 50-80 words" },
                          service: { type: "string", description: "Service repaired" },
                          verified: { type: "boolean", description: "Always true" }
                        },
                        required: ["author", "rating", "comment", "service", "verified"]
                      }
                    },
                    faq: {
                      type: "array",
                      description: "5-6 frequently asked questions",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string", description: "Question with city name" },
                          answer: { type: "string", description: "Clear answer 2-3 sentences" }
                        },
                        required: ["question", "answer"]
                      }
                    }
                  },
                  required: ["title", "metaDescription", "h1", "paragraph1", "paragraph2", "services", "testimonials", "faq"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "generate_local_seo_content" } }
        })
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Rate limits exceeded',
          message: 'Trop de requêtes, veuillez réessayer dans quelques instants.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Payment required',
          message: 'Crédits Lovable AI épuisés. Rechargez votre compte.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!response.ok) {
        console.error(`❌ Erreur Lovable AI: ${response.status}`);
        throw new Error(`Erreur API Lovable AI: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

      if (!toolCall || toolCall.function.name !== 'generate_local_seo_content') {
        throw new Error('Aucun tool call reçu de l\'IA');
      }

      const content = JSON.parse(toolCall.function.arguments);

      console.log('✅ Contenu généré avec succès via Tool Calling');

      return new Response(JSON.stringify({
        success: true,
        content,
        model: 'google/gemini-2.5-flash',
        method: 'tool_calling'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (aiError) {
      console.error('❌ Erreur Lovable AI:', aiError);
      return generateStaticContent(city, serviceType, repairerCount, averageRating);
    }

  } catch (error) {
    console.error('❌ Erreur génération SEO:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateStaticContent(city: string, serviceType: string, repairerCount: number, averageRating: number) {
  const content = {
    title: `Réparation ${serviceType} ${city} - Rapide et garantie`,
    metaDescription: `Réparation ${serviceType} à ${city} ✓ ${repairerCount} réparateurs certifiés ✓ Note ${averageRating}/5 ✓ Devis gratuit ✓ Intervention rapide`,
    h1: `Réparation ${serviceType} ${city} – rapide et garantie`,
    paragraph1: `Besoin d'une réparation ${serviceType} à ${city} ? Nos ${repairerCount} réparateurs certifiés vous offrent un service de qualité avec une note moyenne de ${averageRating}/5. Que votre appareil ait subi une chute, un problème d'écran, de batterie ou tout autre dysfonctionnement, nos experts locaux interviennent rapidement avec des pièces de qualité. Un devis gratuit vous sera fourni en moins de 24h, avec une transparence totale sur les tarifs.`,
    paragraph2: `À ${city}, nous privilégions la proximité et la confiance. Nos réparateurs ${serviceType} sont sélectionnés pour leur expertise technique et leur engagement envers la satisfaction client. Chaque intervention est garantie et nous utilisons exclusivement des pièces compatibles ou d'origine. L'impact écologique est au cœur de nos préoccupations : réparer plutôt que remplacer, c'est économiser en moyenne 15kg de CO2 et prolonger la durée de vie de votre appareil de 2 ans.`,
    services: [
      { name: "Écran cassé", price: "79-149€", duration: "1h" },
      { name: "Remplacement batterie", price: "49-79€", duration: "30min" },
      { name: "Connecteur de charge", price: "39-69€", duration: "45min" },
      { name: "Vitre arrière", price: "59-99€", duration: "1h30" }
    ],
    testimonials: [
      {
        author: "Marie L.",
        rating: 5,
        comment: "Service rapide et efficace ! Mon téléphone a été réparé en 30 minutes à peine. Le technicien était très professionnel.",
        service: `Réparation écran ${serviceType}`,
        verified: true
      },
      {
        author: "Thomas D.",
        rating: 5,
        comment: "Très satisfait de la prestation. Prix transparent, travail soigné et garantie respectée.",
        service: "Remplacement batterie",
        verified: true
      },
      {
        author: "Sophie M.",
        rating: 4,
        comment: "Bon service, délai respecté. Je recommande pour une réparation de qualité à ${city}.",
        service: "Connecteur charge",
        verified: true
      }
    ],
    faq: [
      {
        question: `Combien de temps prend une réparation d'écran à ${city} ?`,
        answer: "En moyenne, la réparation d'un écran prend entre 30 minutes et 1 heure selon le modèle. Nos réparateurs peuvent intervenir le jour même sur rendez-vous."
      },
      {
        question: "La réparation est-elle garantie ?",
        answer: "Oui, toutes nos réparations sont garanties 6 mois pièces et main d'œuvre. En cas de problème, nous reprenons l'intervention gratuitement."
      },
      {
        question: "Utilisez-vous des pièces d'origine ?",
        answer: "Nous proposons des pièces d'origine constructeur ou des pièces compatibles de haute qualité selon votre budget. Le choix vous appartient."
      },
      {
        question: "Puis-je avoir un devis avant réparation ?",
        answer: "Absolument ! Tous nos réparateurs fournissent un devis gratuit et détaillé avant toute intervention. Aucune surprise sur la facture."
      },
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: "Nos réparateurs acceptent les paiements par carte bancaire, espèces et parfois virement. Vérifiez avec votre réparateur lors de la prise de rendez-vous."
      }
    ]
  };

  return new Response(JSON.stringify({
    success: true,
    content,
    model: 'static-template',
    method: 'fallback'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
