
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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
        message: 'Bonjour ! Je suis votre assistant de réparation. Comment puis-je vous aider aujourd\'hui ?'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'send_message') {
      const { conversation_id, content } = message;

      // Sauvegarder le message utilisateur
      await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id,
          sender_type: 'user',
          content,
          message_type: 'text'
        });

      // Analyser le message avec l'IA
      const aiResponse = await analyzeMessageAndRespond(content, conversation_id);

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

      // Incrémenter les métriques
      await supabase.rpc('increment_chatbot_metric', { 
        metric_name: 'messages_processed' 
      });

      return new Response(JSON.stringify({
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
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

async function analyzeMessageAndRespond(content: string, conversationId: string) {
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

  // Analyse simple par mots-clés (peut être remplacée par OpenAI)
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
        category: bestMatch.category
      }
    };
  } else {
    // Réponse générique si la confiance est faible
    return {
      content: "Je ne suis pas sûr de comprendre exactement votre problème. Pouvez-vous me donner plus de détails ou choisir parmi ces options ?",
      confidence: 0.3,
      suggestions: [
        "Problème d'écran",
        "Problème de batterie", 
        "Parler à un conseiller"
      ],
      actions: [],
      metadata: { intent: 'clarification' }
    };
  }
}

function findBestMatch(userInput: string, trainingData: TrainingData[]) {
  let bestMatch = null;
  let bestScore = 0;

  for (const data of trainingData) {
    const keywords = data.training_text.toLowerCase().split(' ');
    let score = 0;
    
    for (const keyword of keywords) {
      if (userInput.includes(keyword)) {
        score += 1;
      }
    }
    
    const confidence = score / keywords.length;
    
    if (confidence > bestScore) {
      bestScore = confidence;
      bestMatch = {
        ...data,
        confidence
      };
    }
  }

  return bestMatch;
}

function generateSuggestions(category: string): string[] {
  const suggestionMap: Record<string, string[]> = {
    'diagnostic': [
      "Mon écran est cassé",
      "Ma batterie ne tient plus",
      "Mon téléphone ne s'allume plus"
    ],
    'pricing': [
      "Combien coûte une réparation d'écran ?",
      "Tarifs pour iPhone",
      "Prix réparation Samsung"
    ],
    'booking': [
      "Trouver un réparateur près de moi",
      "Prendre rendez-vous",
      "Réparation à domicile"
    ],
    'general': [
      "Comment ça marche ?",
      "Quels appareils réparez-vous ?",
      "Parler à un conseiller"
    ]
  };

  return suggestionMap[category] || suggestionMap['general'];
}

function generateActions(category: string) {
  const actionMap: Record<string, any[]> = {
    'diagnostic': [
      { type: 'form', label: 'Diagnostic rapide', action: 'start_diagnostic' }
    ],
    'booking': [
      { type: 'button', label: 'Voir les réparateurs', action: 'show_map' },
      { type: 'button', label: 'Prendre RDV', action: 'book_appointment' }
    ],
    'pricing': [
      { type: 'button', label: 'Calculateur de prix', action: 'price_calculator' }
    ]
  };

  return actionMap[category] || [];
}
