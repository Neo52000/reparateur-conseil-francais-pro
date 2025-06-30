
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatbotMessage {
  content: string;
  sender_type: 'user' | 'bot';
  message_type?: string;
  metadata?: any;
}

interface ConversationContext {
  device_type?: string;
  brand?: string;
  model?: string;
  problem_type?: string;
  location?: string;
  stage: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message, sessionId, userId, conversationHistory } = await req.json();

    // Récupérer ou créer la conversation
    let { data: conversation, error: convError } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: createError } = await supabase
        .from('chatbot_conversations')
        .insert({
          session_id: sessionId,
          user_id: userId,
          user_type: userId ? 'registered' : 'anonymous',
          context: { stage: 'greeting' }
        })
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConv;
    }

    // Sauvegarder le message utilisateur
    await supabase
      .from('chatbot_messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'user',
        content: message,
        message_type: 'text'
      });

    // Analyser l'intention avec l'IA
    const context = conversation.context as ConversationContext;
    const aiResponse = await generateAIResponse(message, context, conversationHistory, openaiApiKey);

    // Sauvegarder la réponse du bot
    const { data: botMessage } = await supabase
      .from('chatbot_messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'bot',
        content: aiResponse.content,
        message_type: aiResponse.type,
        metadata: aiResponse.metadata,
        confidence_score: aiResponse.confidence
      })
      .select()
      .single();

    // Mettre à jour le contexte de la conversation
    await supabase
      .from('chatbot_conversations')
      .update({
        context: aiResponse.updatedContext,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    // Incrémenter les métriques
    await supabase.rpc('increment_chatbot_metric', { 
      metric_name: 'total_messages' 
    });

    return new Response(JSON.stringify({
      response: aiResponse.content,
      type: aiResponse.type,
      metadata: aiResponse.metadata,
      context: aiResponse.updatedContext,
      messageId: botMessage.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: 'Une erreur est survenue. Veuillez réessayer.',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAIResponse(
  userMessage: string, 
  context: ConversationContext, 
  history: ChatbotMessage[],
  apiKey: string
) {
  const systemPrompt = `Tu es l'assistant TopRéparateurs, expert en réparation de smartphones et appareils électroniques.

Contexte actuel: ${JSON.stringify(context)}

Instructions:
1. Aide les utilisateurs à diagnostiquer leurs problèmes d'appareils
2. Guide-les vers la prise de rendez-vous 
3. Fournis des estimations de prix basées sur les réparations courantes
4. Sois professionnel mais amical
5. Pose des questions précises pour mieux comprendre le problème

Étapes du diagnostic:
- Identification de l'appareil (marque, modèle)
- Description du problème
- Évaluation de la gravité
- Proposition de solutions et devis
- Redirection vers prise de RDV si nécessaire

Réponds en JSON avec cette structure:
{
  "content": "ta réponse",
  "type": "text|diagnostic|quote|appointment",
  "confidence": 0.85,
  "metadata": {...},
  "updatedContext": {...}
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(msg => ({
      role: msg.sender_type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    }),
  });

  const aiResult = await response.json();
  
  try {
    return JSON.parse(aiResult.choices[0].message.content);
  } catch {
    // Fallback si le JSON n'est pas valide
    return {
      content: aiResult.choices[0].message.content,
      type: 'text',
      confidence: 0.8,
      metadata: {},
      updatedContext: context
    };
  }
}
