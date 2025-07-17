
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

interface ChatMessage {
  content: string;
  sender_type: 'user' | 'bot';
  conversation_id?: string;
  session_id: string;
  user_id?: string;
}

interface TrainingData {
  intent: string;
  training_text: string;
  response_template: string;
  category: string;
  confidence_threshold: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, session_id, user_id, action } = await req.json();

    if (action === 'start_conversation') {
      // Créer une nouvelle conversation
      const { data: conversation, error } = await supabase
        .from('chatbot_conversations')
        .insert({
          session_id,
          user_id: user_id || null,
          user_type: user_id ? 'authenticated' : 'anonymous',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Incrémenter les métriques
      await supabase.rpc('increment_chatbot_metric', { 
        metric_name: 'conversations_started' 
      });

      return new Response(JSON.stringify({ 
        conversation_id: conversation.id,
        message: 'Bonjour ! Je suis votre assistant de réparation intelligent. Comment puis-je vous aider aujourd\'hui ?'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'send_message') {
      const { conversation_id, content } = message;

      // Sauvegarder le message utilisateur
      const { data: userMessage } = await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id,
          sender_type: 'user',
          content,
          message_type: 'text'
        })
        .select()
        .single();

      // Analyser le message avec l'IA intelligente
      const aiResponse = await analyzeMessageWithAdvancedAI(content, conversation_id);

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

      // Apprentissage automatique - sauvegarder le pattern si la confiance est élevée
      if (aiResponse.confidence > 0.8) {
        await supabase
          .from('chatbot_learning_patterns')
          .upsert({
            input_pattern: content.toLowerCase(),
            successful_response: aiResponse.content,
            category: aiResponse.metadata?.category || 'general',
            confidence_score: aiResponse.confidence,
            usage_count: 1
          }, {
            onConflict: 'input_pattern',
            ignoreDuplicates: false
          });
      }

      // Incrémenter les métriques
      await supabase.rpc('increment_chatbot_metric', { 
        metric_name: 'messages_processed' 
      });

      return new Response(JSON.stringify({
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions,
        message_id: userMessage?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_conversation_history') {
      const { conversation_id } = await req.json();
      
      const { data: messages } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      return new Response(JSON.stringify({ messages }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'submit_feedback') {
      const { conversation_id, message_id, feedback_type, rating, comment } = await req.json();
      
      await supabase
        .from('chatbot_response_feedback')
        .insert({
          conversation_id,
          message_id,
          user_id,
          feedback_type,
          rating,
          comment
        });

      // Incrémenter les métriques de satisfaction
      if (feedback_type === 'positive' || rating >= 4) {
        await supabase.rpc('increment_chatbot_metric', { 
          metric_name: 'user_satisfaction' 
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: 'Une erreur est survenue lors du traitement de votre message.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeMessageWithAdvancedAI(content: string, conversationId: string) {
  try {
    // D'abord essayer avec OpenAI si disponible
    if (openAIApiKey) {
      return await analyzeWithOpenAI(content, conversationId);
    }
    
    // Fallback vers l'analyse basique
    return await analyzeMessageBasic(content, conversationId);
  } catch (error) {
    console.error('Erreur IA avancée, fallback vers analyse basique:', error);
    return await analyzeMessageBasic(content, conversationId);
  }
}

async function analyzeWithOpenAI(content: string, conversationId: string) {
  // Récupérer l'historique de conversation pour le contexte
  const { data: messages } = await supabase
    .from('chatbot_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(10);

  // Récupérer les patterns d'apprentissage
  const { data: patterns } = await supabase
    .from('chatbot_learning_patterns')
    .select('*')
    .order('confidence_score', { ascending: false })
    .limit(10);

  // Récupérer la configuration émotionnelle et variations
  const { data: emotionalConfig } = await supabase
    .from('chatbot_configuration')
    .select('*')
    .in('config_key', ['personality_traits', 'emotional_responses', 'response_variations']);

  const configMap = emotionalConfig?.reduce((acc, item) => {
    acc[item.config_key] = item.config_value;
    return acc;
  }, {} as Record<string, any>) || {};

  // Construire le contexte pour OpenAI avec plus de détails
  const conversationHistory = messages?.map((m, index) => 
    `${index + 1}. ${m.sender_type === 'user' ? 'Client' : 'Ben'}: ${m.content}`
  ).join('\n') || '';

  // Analyser l'émotion et l'urgence
  const userEmotion = analyzeUserEmotion(content);
  const urgencyLevel = analyzeUrgency(content);
  const personalityTraits = configMap.personality_traits || {};
  const emotionalResponses = configMap.emotional_responses || {};

  // Enrichir le prompt avec plus de contexte français
  const prompt = `Tu es Ben, l'assistant IA français expert en réparation smartphone de RepairConnect. Tu es ${personalityTraits.primary || 'empathique'}, ${personalityTraits.secondary?.join(', ') || 'professionnel, chaleureux et patient'}.

🎯 PERSONNALITÉ ENRICHIE:
- Parle français naturel avec expressions courantes
- Utilise des émojis avec parcimonie mais pertinence
- Adapte ton registre selon l'urgence et l'émotion
- Pose des questions de suivi intelligentes
- Évite les répétitions en variant tes expressions

📊 CONTEXTE ACTUEL:
- Émotion détectée: ${userEmotion}
- Niveau d'urgence: ${urgencyLevel}
- Messages précédents: ${messages?.length || 0}

📝 HISTORIQUE CONVERSATION:
${conversationHistory}

🧠 PATTERNS APPRIS:
${patterns?.map(p => `- "${p.input_pattern}" → succès: ${p.success_rate}%`).join('\n') || 'Base d\'apprentissage vide'}

💬 MESSAGE UTILISATEUR: "${content}"

🎨 RÉPONSES ÉMOTIONNELLES DISPONIBLES:
${Object.entries(emotionalResponses).map(([emotion, responses]) => 
  `${emotion}: ${Array.isArray(responses) ? responses.join(', ') : responses}`
).join('\n')}

🚀 INSTRUCTIONS AVANCÉES:
1. Si frustration → empathie immédiate + solution concrète
2. Si urgence → priorité + créneaux rapides
3. Si découverte → explication simple + options claires
4. Si satisfaction → remerciement + opportunité cross-sell
5. Varie tes formulations pour éviter la robotisation
6. Intègre des éléments du contexte précédent
7. Propose 2-3 suggestions contextuelles max

Réponds avec un JSON strictement valide:
{
  "content": "Réponse naturelle, empathique et personnalisée en français",
  "confidence": 0.85,
  "emotion": "empathy|joy|concern|excitement|understanding|professional",
  "category": "diagnostic|pricing|booking|social|emotional_support|information",
  "suggestions": ["Action 1", "Action 2", "Action 3"],
  "actions": [{"type": "button", "label": "Label clair", "action": "action_id"}],
  "thinking_message": "Message durant la réflexion (varié)",
  "context_memory": {"last_emotion": "${userEmotion}", "urgency": "${urgencyLevel}"}
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
        { role: 'system', content: prompt },
        { role: 'user', content: content }
      ],
      temperature: 0.8, // Plus de créativité
      max_tokens: 600,   // Plus d'espace pour des réponses détaillées
      presence_penalty: 0.1, // Éviter les répétitions
      frequency_penalty: 0.2  // Varier le vocabulaire
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
      suggestions: parsedResponse.suggestions || [],
      actions: parsedResponse.actions || [],
      metadata: {
        category: parsedResponse.category || 'general',
        emotion: parsedResponse.emotion,
        context_memory: parsedResponse.context_memory,
        ai_model: 'gpt-4o-mini-enhanced'
      }
    };
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    // Fallback avec une réponse structurée
    return {
      content: aiResponse.replace(/```json|```/g, '').trim(),
      confidence: 0.7,
      suggestions: ["Reformuler la question", "Parler à un conseiller", "Voir les réparateurs"],
      actions: [{ type: 'button', label: 'Assistance humaine', action: 'human_support' }],
      metadata: { category: 'general', ai_model: 'gpt-4o-mini-fallback', parse_error: true }
    };
  }
}

async function analyzeMessageBasic(content: string, conversationId: string) {
  // Vérifications spéciales pour les salutations et messages simples
  const userInput = content.toLowerCase().trim();
  
  // Détecter les salutations
  const greetingPatterns = ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou', 'bonne journée', 'bonne soirée'];
  const isGreeting = greetingPatterns.some(pattern => userInput.includes(pattern));
  
  if (isGreeting) {
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    if (hour >= 18) greeting = 'Bonsoir';
    else if (hour >= 12) greeting = 'Bon après-midi';
    
    return {
      content: `${greeting} ! Je suis Ben, votre assistant de réparation personnalisé. Je suis là pour vous aider avec tous vos problèmes de smartphone ! 😊 \n\nComment puis-je vous aider aujourd'hui ?`,
      confidence: 0.95,
      suggestions: [
        "Mon écran est cassé",
        "Problème de batterie",
        "Mon téléphone ne s'allume plus",
        "Trouver un réparateur près de moi"
      ],
      actions: [
        { type: 'button', label: 'Diagnostic rapide', action: 'start_diagnostic' },
        { type: 'button', label: 'Voir les réparateurs', action: 'show_map' }
      ],
      metadata: { intent: 'greeting', category: 'social', ai_model: 'basic_nlp' }
    };
  }

  // Détecter les remerciements
  const thankingPatterns = ['merci', 'thanks', 'merci beaucoup', 'parfait', 'super', 'génial'];
  const isThanking = thankingPatterns.some(pattern => userInput.includes(pattern));
  
  if (isThanking) {
    return {
      content: "Je vous en prie ! C'est un plaisir de vous aider. 😊 \n\nY a-t-il autre chose que je peux faire pour vous ?",
      confidence: 0.9,
      suggestions: [
        "Autre problème",
        "Prendre rendez-vous",
        "Tarifs des réparations",
        "Au revoir"
      ],
      actions: [
        { type: 'button', label: 'Nouveau diagnostic', action: 'start_diagnostic' }
      ],
      metadata: { intent: 'thanks', category: 'social', ai_model: 'basic_nlp' }
    };
  }

  // Récupérer la configuration du chatbot
  const { data: config } = await supabase
    .from('chatbot_configuration')
    .select('config_key, config_value');

  const configMap = config?.reduce((acc, item) => {
    acc[item.config_key] = item.config_value;
    return acc;
  }, {} as Record<string, any>) || {};

  // Récupérer les données d'entraînement
  const { data: trainingData } = await supabase
    .from('chatbot_training_data')
    .select('*')
    .eq('is_active', true);

  // Analyse simple par mots-clés améliorée
  const bestMatch = findBestMatch(content.toLowerCase(), trainingData || []);
  
  if (bestMatch && bestMatch.confidence > (configMap.confidence_threshold || 0.7)) {
    // Personnaliser la réponse selon le contexte
    let response = bestMatch.response_template;
    
    // Ajouter des suggestions contextuelles
    const suggestions = generateSuggestions(bestMatch.category);
    const actions = generateActions(bestMatch.category);

    return {
      content: response,
      confidence: bestMatch.confidence,
      suggestions,
      actions,
      metadata: {
        intent: bestMatch.intent,
        category: bestMatch.category,
        ai_model: 'basic_nlp'
      }
    };
  } else {
    // Réponse générique améliorée
    return {
      content: "Je ne suis pas sûr de comprendre exactement votre problème. Pouvez-vous me donner plus de détails ou choisir parmi ces options ?",
      confidence: 0.3,
      suggestions: [
        "Problème d'écran cassé",
        "Problème de batterie", 
        "Téléphone qui ne s'allume plus",
        "Parler à un conseiller"
      ],
      actions: [
        { type: 'button', label: 'Diagnostic rapide', action: 'start_diagnostic' },
        { type: 'button', label: 'Voir les réparateurs', action: 'show_map' }
      ],
      metadata: { intent: 'clarification', category: 'general', ai_model: 'basic_nlp' }
    };
  }
}


// Fonction d'analyse sémantique améliorée avec synonymes français
function findBestMatch(input: string, trainingData: any[]) {
  if (!trainingData || trainingData.length === 0) return null;
  
  // Normaliser l'input
  const normalizedInput = normalizeText(input);
  
  let bestMatch = null;
  let highestScore = 0;
  
  // Dictionnaire de synonymes français pour la réparation mobile
  const synonyms = {
    'cassé': ['pété', 'brisé', 'abîmé', 'endommagé', 'fendu', 'fissuré'],
    'écran': ['vitre', 'display', 'affichage', 'dalle'],
    'batterie': ['accu', 'pile', 'autonomie'],
    'téléphone': ['phone', 'mobile', 'portable', 'smartphone', 'tel'],
    'réparation': ['dépannage', 'remise en état', 'fix'],
    'problème': ['souci', 'bug', 'panne', 'dysfonctionnement'],
    'urgent': ['vite', 'rapidement', 'pressé', 'emergency'],
    'cher': ['coûteux', 'prix élevé', 'tarif'],
    'rapide': ['quick', 'express', 'immédiat']
  };
  
  for (const training of trainingData) {
    const patterns = training.training_text.toLowerCase().split(',').map((p: string) => p.trim());
    let totalScore = 0;
    let matchedPatterns = 0;
    
    for (const pattern of patterns) {
      let patternScore = 0;
      const normalizedPattern = normalizeText(pattern);
      
      // 1. Correspondance exacte (score maximum)
      if (normalizedInput === normalizedPattern) {
        patternScore = 1.0;
      }
      // 2. Correspondance partielle
      else if (normalizedInput.includes(normalizedPattern) || normalizedPattern.includes(normalizedInput)) {
        patternScore = 0.8;
      }
      // 3. Analyse par mots avec synonymes
      else {
        const inputWords = normalizedInput.split(' ').filter(w => w.length > 2);
        const patternWords = normalizedPattern.split(' ').filter(w => w.length > 2);
        let wordMatches = 0;
        let totalWords = Math.max(inputWords.length, patternWords.length);
        
        for (const inputWord of inputWords) {
          // Correspondance directe
          if (patternWords.some(pw => pw.includes(inputWord) || inputWord.includes(pw))) {
            wordMatches += 1.0;
          }
          // Correspondance par synonymes
          else {
            for (const [baseWord, syns] of Object.entries(synonyms)) {
              if ((inputWord.includes(baseWord) || syns.some(syn => inputWord.includes(syn))) &&
                  patternWords.some(pw => pw.includes(baseWord) || syns.some(syn => pw.includes(syn)))) {
                wordMatches += 0.8;
                break;
              }
            }
          }
        }
        
        patternScore = totalWords > 0 ? (wordMatches / totalWords) : 0;
      }
      
      if (patternScore > 0) {
        totalScore += patternScore;
        matchedPatterns++;
      }
    }
    
    // Score final normalisé avec bonus pour les patterns multiples
    const finalScore = matchedPatterns > 0 ? 
      (totalScore / patterns.length) * (1 + (matchedPatterns - 1) * 0.1) : 0;
    
    // Ajuster le seuil dynamiquement selon la qualité des données
    const dynamicThreshold = Math.max(0.3, training.confidence_threshold || 0.6);
    
    if (finalScore > highestScore && finalScore >= dynamicThreshold) {
      highestScore = finalScore;
      bestMatch = {
        ...training,
        confidence: Math.min(finalScore, 0.95) // Cap à 95% pour laisser place à l'amélioration
      };
    }
  }
  
  return bestMatch;
}

// Fonction de normalisation du texte français
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^\w\s]/g, ' ') // Remplacer la ponctuation par des espaces
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
}

// Analyser l'émotion utilisateur
function analyzeUserEmotion(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const emotionPatterns = {
    'frustrated': ['marre', 'énerve', 'galère', 'nul', 'pourri', 'chiant'],
    'urgent': ['urgent', 'vite', 'rapidement', 'pressé', 'maintenant'],
    'worried': ['inquiet', 'peur', 'stress', 'angoisse', 'problème'],
    'happy': ['content', 'super', 'parfait', 'génial', 'excellent'],
    'confused': ['comprends pas', 'sais pas', 'comment', 'pourquoi', 'hein'],
    'polite': ['s\'il vous plaît', 'merci', 'excusez', 'pardon', 'bonjour']
  };
  
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      return emotion;
    }
  }
  
  return 'neutral';
}

// Analyser le niveau d'urgence
function analyzeUrgency(message: string): 'low' | 'medium' | 'high' {
  const lowerMessage = message.toLowerCase();
  
  const highUrgency = ['urgent', 'maintenant', 'immédiatement', 'tout de suite', 'vite', 'pressé'];
  const mediumUrgency = ['rapidement', 'bientôt', 'assez vite', 'dans la journée'];
  
  if (highUrgency.some(word => lowerMessage.includes(word))) return 'high';
  if (mediumUrgency.some(word => lowerMessage.includes(word))) return 'medium';
  
  return 'low';
}

function generateSuggestions(category: string, emotion?: string, urgency?: string): string[] {
  // Suggestions contextuelles basées sur l'émotion et l'urgence
  const contextualSuggestions: Record<string, string[]> = {
    'diagnostic_frustrated': [
      "Décrivez-moi le problème exact",
      "Quand c'est-il arrivé ?",
      "Avez-vous essayé de redémarrer ?"
    ],
    'diagnostic_urgent': [
      "Diagnostic express en 5 min",
      "Solutions d'urgence",
      "Réparateur le plus proche"
    ],
    'pricing_worried': [
      "Devis gratuit sans engagement",
      "Options de paiement facilité",
      "Comparaison avec la concurrence"
    ],
    'booking_urgent': [
      "Rendez-vous dans l'heure",
      "Service express disponible",
      "Réparation à domicile"
    ]
  };

  // Clé contextuelle
  const contextKey = `${category}_${emotion}`;
  if (contextualSuggestions[contextKey]) {
    return contextualSuggestions[contextKey];
  }

  // Suggestions par défaut améliorées
  const suggestionMap: Record<string, string[]> = {
    'diagnostic': [
      "Mon écran ne répond plus",
      "Problème de batterie",
      "Son/micro défaillant",
      "Appareil photo flou"
    ],
    'pricing': [
      "Devis gratuit personnalisé",
      "Tarifs selon la marque",
      "Options de garantie",
      "Paiement en plusieurs fois"
    ],
    'booking': [
      "Réparateur près de moi",
      "Prise de rendez-vous",
      "Service à domicile",
      "Horaires d'ouverture"
    ],
    'emotional_support': [
      "Parler à un conseiller",
      "Solutions alternatives",
      "Suivi personnalisé",
      "Garantie satisfaction"
    ],
    'information': [
      "Comment ça marche ?",
      "Durée des réparations",
      "Garanties proposées",
      "Conseils d'entretien"
    ],
    'social': [
      "Autre question ?",
      "Laisser un avis",
      "Parrainage ami",
      "Newsletter conseils"
    ],
    'general': [
      "Diagnostic de panne",
      "Quels appareils réparez-vous ?",
      "Garantie des réparations",
      "Parler à un conseiller"
    ]
  };

  return suggestionMap[category] || suggestionMap['general'];
}

function generateActions(category: string) {
  const actionMap: Record<string, any[]> = {
    'diagnostic': [
      { type: 'form', label: 'Diagnostic automatique', action: 'start_diagnostic' }
    ],
    'booking': [
      { type: 'button', label: 'Voir la carte', action: 'show_map' },
      { type: 'button', label: 'Réserver', action: 'book_appointment' }
    ],
    'pricing': [
      { type: 'button', label: 'Calculateur de prix', action: 'price_calculator' },
      { type: 'button', label: 'Devis gratuit', action: 'request_quote' }
    ]
  };

  return actionMap[category] || [
    { type: 'button', label: 'Voir les réparateurs', action: 'show_map' }
  ];
}

