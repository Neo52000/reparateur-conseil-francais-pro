import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AISuggestionRequest {
  repairerId: string
  suggestionType: 'optimization' | 'content' | 'pricing' | 'marketing'
  context?: any
}

interface AISuggestion {
  id: string
  type: string
  title: string
  description: string
  impact: {
    metric: string
    expectedChange: number
    confidence: number
  }
  actionSteps: string[]
  priority: 'high' | 'medium' | 'low'
  estimatedImplementationTime: number
  resources: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { repairerId, suggestionType, context } = await req.json() as AISuggestionRequest
    
    console.log('🤖 Generating AI suggestions:', { repairerId, suggestionType })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const mistralApiKey = Deno.env.get('CLE_API_MISTRAL')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get repairer data
    const { data: repairerData } = await supabase
      .from('repairer_profiles')
      .select(`
        *, 
        profiles(email, first_name, last_name),
        repairer_subscriptions(subscription_tier)
      `)
      .eq('user_id', repairerId)
      .single()

    if (!repairerData) {
      throw new Error('Repairer not found')
    }

    // Get performance analytics
    const { data: analytics } = await supabase
      .from('repairer_analytics')
      .select('*')
      .eq('repairer_id', repairerId)
      .order('date', { ascending: false })
      .limit(30)

    // Get competitor data
    const { data: competitors } = await supabase
      .from('repairers')
      .select('*')
      .eq('city', repairerData.city)
      .neq('id', repairerId)
      .limit(5)

    let suggestions: AISuggestion[] = []

    switch (suggestionType) {
      case 'optimization':
        suggestions = await generateOptimizationSuggestions(repairerData, analytics, competitors)
        break
      case 'content':
        suggestions = await generateContentSuggestions(repairerData, openaiApiKey, mistralApiKey)
        break
      case 'pricing':
        suggestions = await generatePricingSuggestions(repairerData, competitors)
        break
      case 'marketing':
        suggestions = await generateMarketingSuggestions(repairerData, analytics)
        break
      default:
        suggestions = await generateAllSuggestions(repairerData, analytics, competitors)
    }

    // Save suggestions to database
    if (suggestions.length > 0) {
      await supabase
        .from('ai_suggestions')
        .insert(suggestions.map(suggestion => ({
          repairer_id: repairerId,
          suggestion_type: suggestionType,
          title: suggestion.title,
          description: suggestion.description,
          impact_metric: suggestion.impact.metric,
          expected_change: suggestion.impact.expectedChange,
          confidence: suggestion.impact.confidence,
          action_steps: suggestion.actionSteps,
          priority: suggestion.priority,
          estimated_time: suggestion.estimatedImplementationTime,
          resources: suggestion.resources,
          status: 'active'
        })))
    }

    console.log(`✅ Generated ${suggestions.length} AI suggestions`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions,
        repairerId,
        suggestionType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ AI suggestions error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'AI suggestions failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function generateOptimizationSuggestions(repairer: any, analytics: any[], competitors: any[]): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = []

  // Profile completeness analysis
  const completeness = calculateProfileCompleteness(repairer)
  if (completeness < 80) {
    suggestions.push({
      id: `opt_profile_${Date.now()}`,
      type: 'optimization',
      title: 'Complétez votre profil pour être #1',
      description: `Votre profil est complété à ${completeness}%. Ajoutez les informations manquantes pour améliorer votre visibilité.`,
      impact: {
        metric: 'Visibilité locale',
        expectedChange: 35,
        confidence: 92
      },
      actionSteps: [
        'Ajoutez une photo de profil professionnelle',
        'Complétez votre description avec vos spécialités',
        'Ajoutez vos horaires d\'ouverture',
        'Indiquez vos méthodes de paiement acceptées'
      ],
      priority: 'high',
      estimatedImplementationTime: 15,
      resources: ['Guide de profil complet', 'Exemples de descriptions']
    })
  }

  // Competitor analysis
  if (competitors.length > 0) {
    const avgCompetitorRating = competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.length
    if ((repairer.rating || 0) < avgCompetitorRating) {
      suggestions.push({
        id: `opt_rating_${Date.now()}`,
        type: 'optimization',
        title: 'Améliorez votre note client',
        description: `Votre note moyenne (${repairer.rating || 'N/A'}) est inférieure à la concurrence (${avgCompetitorRating.toFixed(1)}).`,
        impact: {
          metric: 'Taux de conversion',
          expectedChange: 25,
          confidence: 88
        },
        actionSteps: [
          'Demandez systématiquement des avis après chaque réparation',
          'Répondez rapidement aux avis négatifs',
          'Mettez en place un suivi qualité',
          'Offrez un geste commercial en cas de problème'
        ],
        priority: 'high',
        estimatedImplementationTime: 30,
        resources: ['Template de demande d\'avis', 'Guide gestion des avis']
      })
    }
  }

  return suggestions
}

async function generateContentSuggestions(repairer: any, openaiKey?: string, mistralKey?: string): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = []

  if (!repairer.description || repairer.description.length < 100) {
    // Generate AI-powered description
    let generatedContent = ''
    
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en marketing pour réparateurs de smartphones. Crée des descriptions engageantes et professionnelles.'
              },
              {
                role: 'user',
                content: `Crée une description attractive pour ${repairer.business_name || 'un réparateur'} situé à ${repairer.city}. Services: ${repairer.services_offered?.join(', ') || 'réparation smartphone'}. Max 150 mots.`
              }
            ],
            max_tokens: 200
          })
        })

        const data = await response.json()
        generatedContent = data.choices[0]?.message?.content || ''
      } catch (error) {
        console.log('OpenAI content generation failed:', error)
      }
    }

    suggestions.push({
      id: `content_desc_${Date.now()}`,
      type: 'content',
      title: 'Description optimisée générée par IA',
      description: 'Votre description actuelle est trop courte. Voici une version optimisée pour attirer plus de clients.',
      impact: {
        metric: 'Taux de clic',
        expectedChange: 40,
        confidence: 85
      },
      actionSteps: [
        'Remplacer votre description actuelle',
        'Ajouter vos spécialités techniques',
        'Mentionner vos garanties et certifications',
        'Inclure un appel à l\'action'
      ],
      priority: 'medium',
      estimatedImplementationTime: 10,
      resources: ['Description générée', 'Conseils d\'optimisation SEO']
    })
  }

  return suggestions
}

async function generatePricingSuggestions(repairer: any, competitors: any[]): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = []

  // Price positioning analysis
  if (competitors.length > 0) {
    suggestions.push({
      id: `pricing_analysis_${Date.now()}`,
      type: 'pricing',
      title: 'Optimisez vos tarifs selon la concurrence',
      description: `Analyse de ${competitors.length} concurrents locaux. Ajustez vos prix pour maximiser vos profits.`,
      impact: {
        metric: 'Marge bénéficiaire',
        expectedChange: 15,
        confidence: 78
      },
      actionSteps: [
        'Analyser les tarifs de la concurrence locale',
        'Définir votre positionnement prix (premium/compétitif)',
        'Créer des offres groupées attractives',
        'Mettre en avant votre rapport qualité-prix'
      ],
      priority: 'medium',
      estimatedImplementationTime: 45,
      resources: ['Étude tarifaire locale', 'Calculateur de marge']
    })
  }

  return suggestions
}

async function generateMarketingSuggestions(repairer: any, analytics: any[]): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = []

  // Digital presence analysis
  if (!repairer.website && !repairer.facebook_url) {
    suggestions.push({
      id: `marketing_digital_${Date.now()}`,
      type: 'marketing',
      title: 'Développez votre présence digitale',
      description: 'Aucune présence web détectée. 78% des clients cherchent d\'abord en ligne.',
      impact: {
        metric: 'Nouvelles demandes',
        expectedChange: 60,
        confidence: 90
      },
      actionSteps: [
        'Créer une page Facebook Business',
        'Optimiser votre fiche Google My Business',
        'Publier régulièrement vos réparations',
        'Encourager les avis clients'
      ],
      priority: 'high',
      estimatedImplementationTime: 60,
      resources: ['Guide Facebook Business', 'Template de posts']
    })
  }

  return suggestions
}

async function generateAllSuggestions(repairer: any, analytics: any[], competitors: any[]): Promise<AISuggestion[]> {
  const all = await Promise.all([
    generateOptimizationSuggestions(repairer, analytics, competitors),
    generateContentSuggestions(repairer),
    generatePricingSuggestions(repairer, competitors),
    generateMarketingSuggestions(repairer, analytics)
  ])

  return all.flat().slice(0, 5) // Limit to top 5 suggestions
}

function calculateProfileCompleteness(repairer: any): number {
  let score = 0
  const fields = [
    'business_name', 'description', 'address', 'phone', 'email',
    'services_offered', 'opening_hours', 'payment_methods'
  ]

  fields.forEach(field => {
    if (repairer[field] && repairer[field] !== '') {
      score += 12.5 // 100 / 8 fields
    }
  })

  return Math.round(score)
}