import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      city, 
      deviceType, 
      repairType, 
      template, 
      tone = 'friendly', 
      wordCount = 700,
      includePricing = true,
      includeTestimonials = true,
      includeEcoData = true 
    } = await req.json()

    console.log(`🚀 Génération contenu mobile pour ${deviceType} ${repairType} à ${city}`)

    // Configuration Mistral AI
    const mistralApiKey = Deno.env.get('CLE_API_MISTRAL') || Deno.env.get('MISTRAL_API_KEY')
    
    if (!mistralApiKey) {
      console.log('⚠️ Clé Mistral manquante, utilisation du template statique')
      return generateStaticMobileContent(city, deviceType, repairType, wordCount)
    }

    // Prompt optimisé pour la génération de contenu mobile
    const prompt = `Tu es un expert en rédaction technique et SEO. Crée un article de blog optimisé sur la réparation ${deviceType}.

Paramètres:
- Ville: ${city}
- Appareil: ${deviceType}
- Type de réparation: ${repairType}
- Ton: ${tone}
- Nombre de mots: environ ${wordCount}

Génère UNIQUEMENT un objet JSON avec cette structure exacte:
{
  "title": "Titre optimisé SEO (60-70 caractères)",
  "slug": "url-slug-optimise",
  "content": "Contenu principal de l'article (${wordCount} mots)",
  "metaTitle": "Titre meta SEO (50-60 caractères)",
  "metaDescription": "Description meta (150-160 caractères)",
  "keywords": ["mot-clé-1", "mot-clé-2", "mot-clé-3", "mot-clé-4", "mot-clé-5"],
  "excerpt": "Résumé de l'article (150 caractères)",
  "structure": {
    "h1": "Titre principal H1",
    "h2Sections": ["Section 1", "Section 2", "Section 3"],
    "callToAction": "Texte CTA principal"
  }${includePricing ? ',\n  "pricingTable": {\n    "title": "Prix moyens réparation ' + deviceType + ' à ' + city + '",\n    "rows": [\n      {"repair": "Type réparation", "price": "Prix", "duration": "Durée", "warranty": "Garantie"}\n    ]\n  }' : ''}${includeTestimonials ? ',\n  "testimonials": [\n    {"comment": "Témoignage client", "client_name": "Nom", "overall_rating": 5}\n  ]' : ''}${includeEcoData ? ',\n  "ecoData": {\n    "co2Saved": 25,\n    "lifespanExtended": 18,\n    "wasteReduced": 400,\n    "recycledParts": 85\n  }' : ''}
}

Exigences:
- Contenu informatif et engageant
- Optimisé pour le SEO local "${city}"
- Intégrer naturellement "${repairType} ${deviceType}"
- Ton ${tone} et professionnel
- Structure claire avec H2 logiques
- Focus pratique et utile pour les utilisateurs`

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
          max_tokens: 2000
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
        const cleanContent = content.replace(/```json|```/g, '').trim()
        parsedContent = JSON.parse(cleanContent)
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', content)
        throw new Error('Format de réponse invalide de l\'IA')
      }

      // Validation de la structure de base
      const requiredFields = ['title', 'content', 'metaTitle', 'metaDescription', 'structure']
      for (const field of requiredFields) {
        if (!parsedContent[field]) {
          console.error(`❌ Champ manquant: ${field}`)
          throw new Error(`Champ requis manquant: ${field}`)
        }
      }

      // Enrichir avec les données demandées
      if (includePricing && !parsedContent.pricingTable) {
        parsedContent.pricingTable = generateDefaultPricing(deviceType, repairType, city)
      }

      if (includeTestimonials && !parsedContent.testimonials) {
        parsedContent.testimonials = generateDefaultTestimonials(city)
      }

      if (includeEcoData && !parsedContent.ecoData) {
        parsedContent.ecoData = generateDefaultEcoData()
      }

      console.log('✅ Contenu mobile généré avec succès')

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
      return generateStaticMobileContent(city, deviceType, repairType, wordCount, includePricing, includeTestimonials, includeEcoData)
    }

  } catch (error) {
    console.error('❌ Erreur génération contenu mobile:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generateStaticMobileContent(
  city: string, 
  deviceType: string, 
  repairType: string, 
  wordCount: number = 700,
  includePricing: boolean = true,
  includeTestimonials: boolean = true,
  includeEcoData: boolean = true
) {
  const content = {
    title: `Réparation ${repairType} ${deviceType} ${city} - Guide Complet 2024`,
    slug: `reparation-${repairType}-${deviceType}-${city.toLowerCase().replace(/\s+/g, '-')}`,
    content: `# Guide complet de réparation ${repairType} pour ${deviceType} à ${city}

Votre ${deviceType} rencontre des problèmes de ${repairType} ? Ce guide complet vous accompagne dans la recherche du meilleur service de réparation à ${city}.

## Pourquoi réparer plutôt que remplacer ?

La réparation de votre ${deviceType} présente de nombreux avantages, tant économiques qu'écologiques. À ${city}, nos réparateurs professionnels vous offrent une alternative durable au remplacement.

### Avantages économiques
- Coût 3 à 5 fois inférieur à un achat neuf
- Conservation de vos données et paramètres
- Valeur de revente préservée

### Impact environnemental
Réparer votre ${deviceType} évite la production d'un nouvel appareil, économisant ainsi 15 à 25 kg de CO2 et réduisant les déchets électroniques.

## Diagnostic professionnel du ${repairType}

Nos experts à ${city} réalisent un diagnostic complet pour identifier précisément la panne de votre ${deviceType}. Cette étape est essentielle pour garantir une réparation durable.

### Signes d'alerte à surveiller
- Dysfonctionnements intermittents
- Performances dégradées
- Problèmes d'affichage ou de connectivité
- Autonomie réduite

## Processus de réparation étape par étape

1. **Diagnostic initial** : Analyse complète de votre ${deviceType}
2. **Devis transparent** : Estimation détaillée des coûts
3. **Réparation professionnelle** : Intervention par des techniciens certifiés
4. **Tests qualité** : Vérification complète du fonctionnement
5. **Garantie** : Protection de votre réparation

## Choisir son réparateur à ${city}

Pour une réparation ${repairType} réussie, privilégiez des professionnels certifiés à ${city}. Vérifiez leurs références, leurs garanties et leur utilisation de pièces de qualité.

### Critères de sélection
- Certification et expérience
- Transparence des tarifs
- Garantie proposée
- Délais d'intervention
- Avis clients vérifiés

## Conclusion

La réparation ${repairType} de votre ${deviceType} à ${city} est un choix intelligent, économique et écologique. Nos professionnels vous garantissent un service de qualité avec des pièces compatibles et une garantie complète.`,
    metaTitle: `Réparation ${repairType} ${deviceType} ${city} | Service Pro`,
    metaDescription: `Réparation ${repairType} ${deviceType} à ${city} ✓ Devis gratuit ✓ Réparateurs certifiés ✓ Garantie ✓ Prix transparents. Intervention rapide.`,
    keywords: [
      `réparation ${deviceType}`,
      `${repairType} ${deviceType}`,
      `réparateur ${city}`,
      `${deviceType} ${city}`,
      'réparation mobile'
    ],
    excerpt: `Guide complet pour la réparation ${repairType} de votre ${deviceType} à ${city}. Conseils d'experts et solutions professionnelles.`,
    structure: {
      h1: `Réparation ${repairType} ${deviceType} ${city} - Guide Expert`,
      h2Sections: [
        'Pourquoi réparer plutôt que remplacer ?',
        `Diagnostic professionnel du ${repairType}`,
        'Processus de réparation étape par étape',
        `Choisir son réparateur à ${city}`
      ],
      callToAction: 'Obtenez un devis gratuit pour votre réparation'
    }
  }

  // Ajouter le tableau de prix si demandé
  if (includePricing) {
    content.pricingTable = generateDefaultPricing(deviceType, repairType, city)
  }

  // Ajouter les témoignages si demandé
  if (includeTestimonials) {
    content.testimonials = generateDefaultTestimonials(city)
  }

  // Ajouter les données éco si demandé
  if (includeEcoData) {
    content.ecoData = generateDefaultEcoData()
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

function generateDefaultPricing(deviceType: string, repairType: string, city: string) {
  const basePrices = {
    'smartphone': { 'écran': 80, 'batterie': 50, 'caméra': 60, 'haut-parleur': 40 },
    'tablette': { 'écran': 120, 'batterie': 70, 'caméra': 80, 'haut-parleur': 50 },
    'ordinateur portable': { 'écran': 200, 'batterie': 90, 'clavier': 60, 'ventilateur': 70 }
  }

  const basePrice = basePrices[deviceType]?.[repairType] || 60

  return {
    title: `Prix moyens réparation ${deviceType} à ${city}`,
    rows: [
      { repair: `${repairType} ${deviceType}`, price: `${basePrice}€`, duration: '2h', warranty: '3 mois' },
      { repair: 'Diagnostic', price: 'Gratuit', duration: '30min', warranty: '-' },
      { repair: 'Nettoyage complet', price: `${Math.round(basePrice * 0.3)}€`, duration: '1h', warranty: '1 mois' },
      { repair: 'Mise à jour logicielle', price: `${Math.round(basePrice * 0.2)}€`, duration: '45min', warranty: '1 mois' }
    ]
  }
}

function generateDefaultTestimonials(city: string) {
  return [
    {
      comment: `Service impeccable, mon téléphone fonctionne comme neuf ! Merci à l'équipe de ${city}.`,
      client_name: 'Marie L.',
      overall_rating: 5
    },
    {
      comment: 'Réparation rapide et prix correct. Je recommande vivement ce service.',
      client_name: 'Thomas B.',
      overall_rating: 5
    }
  ]
}

function generateDefaultEcoData() {
  return {
    co2Saved: Math.round(Math.random() * 10 + 20), // 20-30 kg CO2
    lifespanExtended: Math.round(Math.random() * 8 + 18), // 18-26 mois
    wasteReduced: Math.round(Math.random() * 150 + 350), // 350-500g
    recycledParts: Math.round(Math.random() * 20 + 75) // 75-95%
  }
}