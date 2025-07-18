import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

interface ConversationMemory {
  userProfile: {
    preferredName?: string;
    deviceBrand?: string;
    previousIssues?: string[];
    communicationStyle: 'formal' | 'casual' | 'technical';
    urgencyLevel: 'low' | 'medium' | 'high';
    satisfactionHistory: number[];
  };
  conversationContext: {
    currentIssue?: string;
    diagnosisStage: string;
    collectedSymptoms: string[];
    suggestedSolutions: string[];
    nearbyRepairers: any[];
  };
  emotionalJourney: {
    initialMood: string;
    currentMood: string;
    frustrationLevel: number;
    confidenceLevel: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message, session_id, user_id, user_location, conversation_memory, emotional_state } = await req.json();

    switch (action) {
      case 'start_conversation':
        return await startAdvancedConversation(session_id, user_id, user_location);
      
      case 'send_message':
        return await processAdvancedMessage(message, conversation_memory, emotional_state);
      
      case 'location_updated':
        return await handleLocationUpdate(message.conversation_id, user_location);
      
      case 'generate_diagnostic_report':
        return await generateDiagnosticReport(message.conversation_id, conversation_memory);
      
      case 'end_conversation':
        return await endAdvancedConversation(message.conversation_id, conversation_memory, message.satisfaction_score);
      
      default:
        throw new Error('Action non reconnue');
    }

  } catch (error) {
    console.error('Erreur chatbot avancé:', error);
    return new Response(JSON.stringify({ 
      error: 'Une erreur est survenue lors du traitement de votre message.',
      fallback_response: "Désolé pour le problème technique ! Je suis toujours là pour vous aider. 😊"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function startAdvancedConversation(sessionId: string, userId?: string, userLocation?: [number, number]) {
  // Créer une nouvelle conversation
  const { data: conversation, error } = await supabase
    .from('chatbot_conversations')
    .insert({
      session_id: sessionId,
      user_id: userId || null,
      user_type: userId ? 'authenticated' : 'anonymous',
      status: 'active',
      context: {
        user_location: userLocation,
        conversation_start: new Date().toISOString(),
        advanced_features: true
      }
    })
    .select()
    .single();

  if (error) throw error;

  // Incrémenter les métriques
  await supabase.rpc('increment_chatbot_metric', { 
    metric_name: 'advanced_conversations_started' 
  });

  // Message de bienvenue adaptatif selon l'heure et la localisation
  const hour = new Date().getHours();
  let greeting = 'Bonjour';
  if (hour >= 18) greeting = 'Bonsoir';
  else if (hour >= 12) greeting = 'Bon après-midi';

  let locationContext = '';
  if (userLocation) {
    locationContext = ' Je vois que vous êtes connecté avec votre localisation, parfait pour vous trouver un réparateur proche !';
  }

  const welcomeMessage = `${greeting} ! 👋 Je suis Ben, votre assistant de réparation nouvelle génération ! 

Je suis là pour vous offrir une expérience personnalisée et vous aider à diagnostiquer précisément votre problème de smartphone.${locationContext}

🔬 **Ce que je peux faire pour vous :**
• Diagnostic intelligent étape par étape
• Estimation précise des coûts de réparation  
• Recommandation des meilleurs réparateurs près de chez vous
• Suivi personnalisé de votre demande

Comment puis-je vous aider aujourd'hui ? 😊`;

  return new Response(JSON.stringify({ 
    conversation_id: conversation.id,
    message: welcomeMessage,
    suggestions: [
      "🔍 Diagnostic de mon problème",
      "📱 Mon écran est cassé",
      "🔋 Problème de batterie",
      "📍 Trouver un réparateur près de moi"
    ],
    actions: [
      { type: 'button', label: 'Commencer le diagnostic', action: 'start_diagnostic' },
      { type: 'button', label: 'Urgence (réparation immédiate)', action: 'urgent_repair' }
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processAdvancedMessage(message: any, conversationMemory: ConversationMemory, emotionalState: any) {
  const { conversation_id, content, user_location } = message;

  // Sauvegarder le message utilisateur
  await supabase
    .from('chatbot_messages')
    .insert({
      conversation_id,
      sender_type: 'user',
      content,
      message_type: 'text'
    });

  // Analyser avec l'IA avancée
  const aiResponse = await analyzeWithAdvancedAI(
    content, 
    conversation_id, 
    conversationMemory, 
    emotionalState,
    user_location
  );

  // Sauvegarder la réponse du bot
  await supabase
    .from('chatbot_messages')
    .insert({
      conversation_id,
      sender_type: 'bot',
      content: aiResponse.content,
      message_type: 'text',
      confidence_score: aiResponse.confidence,
      metadata: aiResponse.metadata
    });

  // Mettre à jour le contexte de conversation
  await supabase
    .from('chatbot_conversations')
    .update({ 
      context: aiResponse.updated_context,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversation_id);

  // Incrémenter les métriques
  await supabase.rpc('increment_chatbot_metric', { 
    metric_name: 'advanced_messages_processed' 
  });

  return new Response(JSON.stringify({
    response: aiResponse.content,
    confidence: aiResponse.confidence,
    suggestions: aiResponse.suggestions,
    actions: aiResponse.actions,
    emotional_context: aiResponse.emotional_context,
    diagnostic_data: aiResponse.diagnostic_data,
    metadata: {
      ...aiResponse.metadata,
      complexity: aiResponse.complexity || 'medium'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function analyzeWithAdvancedAI(
  content: string, 
  conversationId: string, 
  conversationMemory: ConversationMemory,
  emotionalState: any,
  userLocation?: [number, number]
) {
  if (!openAIApiKey) {
    return await analyzeWithEnhancedRules(content, conversationId, conversationMemory);
  }

  try {
    // Récupérer l'historique de conversation
    const { data: messages } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(15);

    // Construire le contexte enrichi
    const conversationHistory = messages?.map((m, index) => 
      `${index + 1}. ${m.sender_type === 'user' ? 'Client' : 'Ben'}: ${m.content}`
    ).join('\n') || '';

    // Analyser les réparateurs proches si localisation disponible
    let nearbyRepairersContext = '';
    if (userLocation) {
      const { data: nearbyRepairers } = await supabase
        .from('repairers')
        .select('name, address, rating, specialties')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .limit(5);
      
      if (nearbyRepairers && nearbyRepairers.length > 0) {
        nearbyRepairersContext = `\n🏪 RÉPARATEURS PROCHES DISPONIBLES:\n${nearbyRepairers.map(r => 
          `- ${r.name} (${r.rating}/5) - ${r.address}`
        ).join('\n')}`;
      }
    }

    // Construire le prompt ultra-sophistiqué
    const advancedPrompt = `Tu es Ben, l'assistant IA ultra-intelligent de RepairConnect, spécialisé dans l'accompagnement personnalisé pour la réparation de smartphones. Tu es équipé d'une intelligence émotionnelle avancée et d'un moteur de diagnostic de pointe.

🧠 **PROFIL UTILISATEUR ANALYSÉ:**
- Style de communication: ${conversationMemory.userProfile.communicationStyle}
- Niveau d'urgence: ${conversationMemory.userProfile.urgencyLevel}
- Appareils précédents: ${conversationMemory.userProfile.previousIssues?.join(', ') || 'Aucun historique'}
- Satisfaction moyenne: ${conversationMemory.userProfile.satisfactionHistory[conversationMemory.userProfile.satisfactionHistory.length - 1]}%

📊 **CONTEXTE ÉMOTIONNEL ACTUEL:**
- Émotion détectée: ${emotionalState.currentEmotion}
- Niveau de frustration: ${conversationMemory.emotionalJourney.frustrationLevel}/10
- Confiance en la solution: ${conversationMemory.emotionalJourney.confidenceLevel}%
- Humeur conversation: ${conversationMemory.emotionalJourney.currentMood}

🔬 **ÉTAT DU DIAGNOSTIC:**
- Étape actuelle: ${conversationMemory.conversationContext.diagnosisStage}
- Symptômes identifiés: ${conversationMemory.conversationContext.collectedSymptoms.join(', ') || 'Aucun'}
- Solutions suggérées: ${conversationMemory.conversationContext.suggestedSolutions.join(', ') || 'Aucune'}

📝 **HISTORIQUE CONVERSATION:**
${conversationHistory}

💬 **MESSAGE UTILISATEUR ACTUEL:** "${content}"

${nearbyRepairersContext}

🎯 **INSTRUCTIONS COMPORTEMENTALES AVANCÉES:**

**Adaptation du style selon le profil:**
- Si 'formal': Vouvoyez, soyez professionnel mais chaleureux
- Si 'casual': Tutoyez, soyez décontracté et amical  
- Si 'technical': Utilisez du vocabulaire technique approprié

**Gestion émotionnelle intelligente:**
- Si frustration élevée (>6): Empathie immédiate + action concrète
- Si confiance faible (<40%): Rassurance + étapes claires
- Si urgence haute: Priorisez les solutions rapides
- Si satisfaction en baisse: Changez d'approche + proposez escalade

**Stratégie diagnostique:**
1. **Identification** → Collectez symptômes précis avec questions ciblées
2. **Analyse** → Croisez symptômes avec base de connaissances
3. **Estimation** → Donnez coût approximatif et temps de réparation
4. **Recommandation** → Orientez vers le meilleur réparateur selon critères

**Personnalisation des réponses:**
- Variez expressions pour éviter répétitions robotiques
- Intégrez éléments du contexte personnel mentionné
- Adaptez niveau de détail selon expertise perçue
- Utilisez émojis avec parcimonie mais pertinence

**Recommandations géographiques:**
- Si localisation: Recommandez réparateurs spécifiques avec justification
- Estimez temps de trajet et disponibilité
- Comparez 2-3 options avec avantages de chacune

Réponds avec un JSON strictement valide contenant:
{
  "content": "Réponse naturelle, empathique et personnalisée en français",
  "confidence": 0.85,
  "complexity": "simple|medium|complex",
  "emotional_context": {
    "detected_emotion": "empathy|concern|excitement|professional|supportive",
    "response_tone": "caring|urgent|reassuring|enthusiastic|technical",
    "adaptation_made": "Description de l'adaptation au profil utilisateur"
  },
  "diagnostic_data": {
    "symptoms_detected": ["symptome1", "symptome2"],
    "diagnosis_stage": "nouvelle_étape",
    "estimated_cost": "50-120€",
    "urgency_level": "low|medium|high",
    "confidence_diagnosis": 0.75
  },
  "suggestions": ["Suggestion contextualisée 1", "Suggestion 2", "Suggestion 3"],
  "actions": [
    {"type": "button", "label": "Action claire", "action": "action_id"},
    {"type": "location", "label": "Partager ma position", "action": "request_location"}
  ],
  "updated_context": {
    "conversation_memory_updates": "Nouveaux éléments à retenir",
    "next_recommended_step": "Étape suivante suggérée"
  },
  "reasoning": "Explication du raisonnement suivi pour cette réponse"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: advancedPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.2,
        frequency_penalty: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return {
        content: parsedResponse.content,
        confidence: parsedResponse.confidence || 0.8,
        complexity: parsedResponse.complexity || 'medium',
        suggestions: parsedResponse.suggestions || [],
        actions: parsedResponse.actions || [],
        emotional_context: parsedResponse.emotional_context,
        diagnostic_data: parsedResponse.diagnostic_data,
        updated_context: parsedResponse.updated_context,
        metadata: {
          ai_model: 'gpt-4o-mini-advanced',
          reasoning: parsedResponse.reasoning,
          category: parsedResponse.diagnostic_data?.diagnosis_stage || 'general'
        }
      };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw response:', aiResponse);
      return await analyzeWithEnhancedRules(content, conversationId, conversationMemory);
    }

  } catch (error) {
    console.error('Erreur OpenAI avancée:', error);
    return await analyzeWithEnhancedRules(content, conversationId, conversationMemory);
  }
}

async function analyzeWithEnhancedRules(content: string, conversationId: string, conversationMemory: ConversationMemory) {
  const userInput = content.toLowerCase().trim();
  
  // Détection avancée des intentions
  const intentions = {
    screen_broken: {
      keywords: ['écran', 'cassé', 'fissure', 'pété', 'vitre', 'noir'],
      response: "Je vois que votre écran a un problème ! 📱💔 C'est effectivement l'une des pannes les plus courantes. Pour vous aider au mieux, j'ai besoin de quelques précisions :",
      questions: [
        "L'écran tactile fonctionne-t-il encore ?",
        "Voyez-vous des couleurs anormales ou des lignes ?",
        "L'écran s'allume-t-il toujours ?"
      ],
      estimated_cost: "80-200€",
      urgency: "medium"
    },
    battery_issue: {
      keywords: ['batterie', 'autonomie', 'charge', 'décharge', 'pourcentage'],
      response: "Problème de batterie détecté ! 🔋 C'est très fréquent après 2-3 ans d'utilisation. Laissez-moi vous aider à identifier la cause exacte :",
      questions: [
        "Depuis quand durez-vous remarqué ce problème ?",
        "Le téléphone chauffe-t-il pendant la charge ?",
        "L'autonomie s'est-elle dégradée progressivement ?"
      ],
      estimated_cost: "50-90€",
      urgency: "medium"
    },
    water_damage: {
      keywords: ['eau', 'mouillé', 'tombé', 'liquide', 'humidité'],
      response: "⚠️ Dégât des eaux détecté ! C'est une urgence ! Il faut agir rapidement pour limiter les dommages :",
      questions: [
        "Le téléphone était-il complètement immergé ?",
        "Combien de temps est-il resté en contact avec le liquide ?",
        "L'avez-vous éteint immédiatement ?"
      ],
      estimated_cost: "100-300€",
      urgency: "high"
    }
  };

  // Analyser l'intention
  let bestMatch = null;
  let bestScore = 0;

  for (const [intention, data] of Object.entries(intentions)) {
    const matches = data.keywords.filter(keyword => userInput.includes(keyword)).length;
    const score = matches / data.keywords.length;
    
    if (score > bestScore && score > 0.3) {
      bestMatch = { intention, ...data, score };
    }
  }

  if (bestMatch) {
    return {
      content: `${bestMatch.response}\n\n${bestMatch.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
      confidence: bestMatch.score,
      complexity: 'medium',
      suggestions: bestMatch.questions.slice(0, 3),
      actions: [
        { type: 'button', label: 'Voir les réparateurs', action: 'show_repairers' },
        { type: 'button', label: 'Estimation détaillée', action: 'detailed_quote' }
      ],
      emotional_context: {
        detected_emotion: bestMatch.urgency === 'high' ? 'concern' : 'supportive',
        response_tone: bestMatch.urgency === 'high' ? 'urgent' : 'caring'
      },
      diagnostic_data: {
        symptoms_detected: [bestMatch.intention],
        estimated_cost: bestMatch.estimated_cost,
        urgency_level: bestMatch.urgency,
        confidence_diagnosis: bestMatch.score
      },
      metadata: {
        ai_model: 'enhanced_rules',
        category: 'diagnostic'
      },
      updated_context: {}
    };
  }

  // Réponse générique enrichie
  return {
    content: "Je suis là pour vous aider ! 😊 Pour vous proposer le meilleur service, pouvez-vous me décrire précisément le problème que vous rencontrez avec votre smartphone ?",
    confidence: 0.6,
    complexity: 'simple',
    suggestions: [
      "Mon écran est endommagé",
      "Problème de batterie ou charge", 
      "Mon téléphone ne s'allume plus",
      "Autre problème"
    ],
    actions: [
      { type: 'button', label: 'Diagnostic guidé', action: 'guided_diagnostic' }
    ],
    emotional_context: {
      detected_emotion: 'supportive',
      response_tone: 'encouraging'
    },
    diagnostic_data: {
      symptoms_detected: [],
      diagnosis_stage: 'problem_identification',
      urgency_level: 'medium'
    },
    metadata: {
      ai_model: 'enhanced_rules_fallback',
      category: 'general'
    },
    updated_context: {}
  };
}

async function handleLocationUpdate(conversationId: string, userLocation: [number, number]) {
  // Mettre à jour le contexte avec la localisation
  await supabase
    .from('chatbot_conversations')
    .update({ 
      context: { user_location: userLocation, location_updated_at: new Date().toISOString() }
    })
    .eq('id', conversationId);

  return new Response(JSON.stringify({
    success: true,
    message: "Parfait ! J'ai bien reçu votre localisation. Je peux maintenant vous recommander les meilleurs réparateurs près de chez vous ! 📍"
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateDiagnosticReport(conversationId: string, conversationMemory: ConversationMemory) {
  const symptoms = conversationMemory.conversationContext.collectedSymptoms;
  
  const report = {
    summary: `Diagnostic basé sur ${symptoms.length} symptôme(s) identifié(s)`,
    symptoms: symptoms,
    recommendations: [
      "Consultation d'un réparateur agréé recommandée",
      "Obtenir un devis détaillé avant réparation",
      "Sauvegarder vos données importantes"
    ],
    estimated_timeline: "1-3 jours ouvrés",
    confidence_level: conversationMemory.emotionalJourney.confidenceLevel
  };

  return new Response(JSON.stringify({ report }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function endAdvancedConversation(conversationId: string, conversationMemory: ConversationMemory, satisfactionScore: number) {
  await supabase
    .from('chatbot_conversations')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      satisfaction_score: satisfactionScore,
      context: { 
        final_memory: conversationMemory,
        completion_reason: 'user_ended'
      }
    })
    .eq('id', conversationId);

  return new Response(JSON.stringify({
    success: true,
    message: "Merci d'avoir utilisé notre assistant ! N'hésitez pas à revenir si vous avez d'autres questions. 😊"
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}