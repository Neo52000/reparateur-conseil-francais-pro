
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
    .limit(5);

  // Récupérer la configuration émotionnelle
  const { data: emotionalConfig } = await supabase
    .from('chatbot_configuration')
    .select('*')
    .in('config_key', ['personality_traits', 'emotional_responses']);

  const configMap = emotionalConfig?.reduce((acc, item) => {
    acc[item.config_key] = item.config_value;
    return acc;
  }, {} as Record<string, any>) || {};

  // Construire le contexte pour OpenAI
  const conversationHistory = messages?.map(m => 
    `${m.sender_type === 'user' ? 'Utilisateur' : 'Ben'}: ${m.content}`
  ).join('\n') || '';

  // Analyser l'émotion du message utilisateur
  const userEmotion = analyzeUserEmotion(content);
  const personalityTraits = configMap.personality_traits || {};

  const prompt = `Tu es Ben, un assistant IA empathique et humain spécialisé dans la réparation de smartphones. Tu as une personnalité ${personalityTraits.primary || 'empathique'} avec des traits ${personalityTraits.secondary?.join(', ') || 'aidante, professionnelle, chaleureuse'}.

PERSONNALITÉ DE BEN:
- Empathique et à l'écoute
- Utilise des émojis de manière naturelle
- S'adapte à l'émotion de l'utilisateur
- Professionnel mais chaleureux
- Donne des conseils pratiques

CONTEXTE ÉMOTIONNEL DÉTECTÉ: ${userEmotion}

HISTORIQUE DE CONVERSATION:
${conversationHistory}

PATTERNS D'APPRENTISSAGE RÉUSSIS:
${patterns?.map(p => `"${p.input_pattern}" → "${p.successful_response}"`).join('\n') || 'Aucun pattern disponible'}

MESSAGE UTILISATEUR: "${content}"

INSTRUCTIONS SPÉCIALES:
- Adapte ton ton à l'émotion détectée
- Si l'utilisateur semble frustré, montre de l'empathie
- Si c'est urgent, propose des solutions rapides
- Si c'est sa première fois, explique simplement
- Utilise les émojis appropriés à l'émotion
- Reste professionnelle mais humaine

Réponds UNIQUEMENT avec un JSON valide contenant:
{
  "content": "ta réponse empathique et adaptée",
  "confidence": 0.95,
  "emotion": "joy|empathy|concern|excitement|understanding",
  "category": "diagnostic|pricing|booking|social|emotional_support",
  "suggestions": ["suggestion contextuelle 1", "suggestion 2"],
  "actions": [{"type": "button", "label": "Action adaptée", "action": "action_id"}],
  "thinking_message": "Message personnalisé pendant la réflexion"
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
      temperature: 0.7,
      max_tokens: 500
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
        ai_model: 'gpt-4o-mini'
      }
    };
  } catch (parseError) {
    // Si le parsing JSON échoue, utiliser la réponse directement
    return {
      content: aiResponse,
      confidence: 0.7,
      suggestions: [],
      actions: [],
      metadata: { category: 'general', ai_model: 'gpt-4o-mini', parse_error: true }
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


function findBestMatch(input: string, trainingData: any[]) {
  if (!trainingData || trainingData.length === 0) return null;
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const training of trainingData) {
    const patterns = training.training_text.toLowerCase().split(',').map((p: string) => p.trim());
    let score = 0;
    
    // Calculer le score de correspondance
    for (const pattern of patterns) {
      if (input.includes(pattern)) {
        // Score plus élevé pour les correspondances exactes
        if (input === pattern) {
          score += 1.0;
        } else if (input.startsWith(pattern) || input.endsWith(pattern)) {
          score += 0.8;
        } else {
          score += 0.6;
        }
      }
      
      // Vérifier les mots individuels du pattern
      const patternWords = pattern.split(' ');
      const inputWords = input.split(' ');
      let wordMatches = 0;
      
      for (const word of patternWords) {
        if (word.length > 2 && inputWords.some(iw => iw.includes(word))) {
          wordMatches++;
        }
      }
      
      if (wordMatches > 0) {
        score += (wordMatches / patternWords.length) * 0.5;
      }
    }
    
    // Normaliser le score
    const normalizedScore = Math.min(score / patterns.length, 1.0);
    
    if (normalizedScore > highestScore && normalizedScore >= (training.confidence_threshold || 0.7)) {
      highestScore = normalizedScore;
      bestMatch = {
        ...training,
        confidence: normalizedScore
      };
    }
  }
  
  return bestMatch;
}

function generateSuggestions(category: string): string[] {
  const suggestionMap: Record<string, string[]> = {
    'diagnostic': [
      "Mon écran est fissuré",
      "Ma batterie se décharge vite",
      "Mon téléphone surchauffe",
      "Je n'ai plus de son"
    ],
    'pricing': [
      "Combien coûte une réparation d'écran ?",
      "Tarifs pour iPhone 14",
      "Prix réparation Samsung Galaxy",
      "Coût changement batterie"
    ],
    'booking': [
      "Trouver un réparateur près de moi",
      "Prendre rendez-vous rapidement",
      "Réparation à domicile disponible ?",
      "Réparateur ouvert le dimanche"
    ],
    'general': [
      "Comment ça marche ?",
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

function analyzeUserEmotion(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Analyse émotionnelle avancée
  const emotionPatterns = {
    frustration: ['énervé', 'marre', 'galère', 'problème encore', 'ça marche pas', 'nul'],
    urgency: ['urgent', 'vite', 'rapidement', 'aujourd\'hui', 'maintenant', 'tout de suite'],
    happiness: ['merci', 'super', 'génial', 'parfait', 'excellent', 'content'],
    concern: ['inquiet', 'peur', 'stress', 'anxieux', 'problème grave'],
    confusion: ['comprends pas', 'sais pas', 'comment', 'pourquoi', 'pas sûr'],
    politeness: ['bonjour', 's\'il vous plaît', 'merci', 'bonne journée', 'au revoir']
  };

  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    if (patterns.some(pattern => lowerContent.includes(pattern))) {
      return emotion;
    }
  }

  return 'neutral';
}
