import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { city, serviceType, repairerCount, averageRating, existingContent, regenerate } = await req.json()

    console.log(`🚀 Génération contenu SEO pour ${city} - ${serviceType}`)

    // Validation des paramètres
    if (!city || !serviceType) {
      throw new Error('Paramètres city et serviceType requis')
    }

    // Configuration Mistral AI
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    
    if (!mistralApiKey) {
      console.log('⚠️ Clé Mistral manquante, utilisation du template statique')
      return generateStaticContent(city, serviceType, repairerCount, averageRating)
    }

    // Prompt optimisé pour la génération de contenu SEO local
    const prompt = `Tu es un expert en SEO local et rédaction web. Génère un contenu optimisé pour la page SEO locale d'un service de réparation.

Ville: ${city}
Service: réparation ${serviceType}
Nombre de réparateurs: ${repairerCount || 1}
Note moyenne: ${averageRating || 4.8}/5

Génère UNIQUEMENT un objet JSON avec cette structure exacte:
{
  "title": "Titre H1 optimisé SEO (60-70 caractères)",
  "metaDescription": "Meta description unique et engageante (150-160 caractères)",
  "h1": "Titre principal de la page",
  "paragraph1": "Premier paragraphe informatif (200-250 mots)",
  "paragraph2": "Deuxième paragraphe avec détails locaux (200-250 mots)"
}

Exigences:
- Ton professionnel mais accessible
- Intégrer naturellement les mots-clés: "réparation ${serviceType} ${city}", "réparateur ${serviceType}", "${city}"
- Mentionner les ${repairerCount} réparateurs locaux
- Inclure la note ${averageRating}/5
- Éviter le marketing agressif
- Focus sur la proximité, rapidité, qualité`

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        console.error(`❌ Erreur Mistral API: ${response.status}`)
        throw new Error(`Erreur API Mistral: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content?.trim()

      if (!content) {
        throw new Error('Réponse vide de Mistral AI')
      }

      // Parser le JSON de la réponse
      let parsedContent
      try {
        // Nettoyer le contenu (supprimer les éventuels backticks ou markdown)
        const cleanContent = content.replace(/```json|```/g, '').trim()
        parsedContent = JSON.parse(cleanContent)
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', content)
        throw new Error('Format de réponse invalide de l\'IA')
      }

      // Validation de la structure
      const requiredFields = ['title', 'metaDescription', 'h1', 'paragraph1', 'paragraph2']
      for (const field of requiredFields) {
        if (!parsedContent[field]) {
          console.error(`❌ Champ manquant: ${field}`)
          throw new Error(`Champ requis manquant: ${field}`)
        }
      }

      console.log('✅ Contenu généré avec succès')

      return new Response(JSON.stringify({
        success: true,
        content: parsedContent,
        model: 'mistral-small-latest',
        tokens: data.usage?.total_tokens || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (mistralError) {
      console.error('❌ Erreur Mistral:', mistralError)
      // Fallback sur le contenu statique
      return generateStaticContent(city, serviceType, repairerCount, averageRating)
    }

  } catch (error) {
    console.error('❌ Erreur génération SEO:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generateStaticContent(city: string, serviceType: string, repairerCount: number, averageRating: number) {
  const content = {
    title: `Réparation ${serviceType} ${city} - Experts certifiés`,
    metaDescription: `Réparation ${serviceType} à ${city} ✓ ${repairerCount} réparateurs certifiés ✓ Note ${averageRating}/5 ✓ Devis gratuit ✓ Intervention rapide`,
    h1: `Réparation ${serviceType} ${city} - Service professionnel`,
    paragraph1: `Besoin d'une réparation ${serviceType} à ${city} ? Nos ${repairerCount} réparateurs certifiés vous offrent un service de qualité avec une note moyenne de ${averageRating}/5. Que votre appareil ait subi une chute, un problème d'écran, de batterie ou tout autre dysfonctionnement, nos experts locaux interviennent rapidement avec des pièces de qualité. Un devis gratuit vous sera fourni en moins de 24h, avec une transparence totale sur les tarifs.`,
    paragraph2: `À ${city}, nous privilégions la proximité et la confiance. Nos réparateurs ${serviceType} sont sélectionnés pour leur expertise technique et leur engagement envers la satisfaction client. Chaque intervention est garantie et nous utilisons exclusivement des pièces compatibles ou d'origine. L'impact écologique est au cœur de nos préoccupations : réparer plutôt que remplacer, c'est économiser en moyenne 15kg de CO2 et prolonger la durée de vie de votre appareil de 2 ans.`
  }

  return new Response(JSON.stringify({
    success: true,
    content,
    model: 'static-template',
    tokens: 0
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}