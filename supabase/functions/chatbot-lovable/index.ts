import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationContext {
  device_brand?: string;
  device_model?: string;
  problem_type?: string;
  location?: string;
  budget_range?: string;
  urgency?: string;
  previous_repairs?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, action } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const startTime = Date.now();

    // Load or create conversation memory
    let conversationMemory;
    const { data: existingMemory } = await supabase
      .from('conversation_memory')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingMemory) {
      conversationMemory = existingMemory;
    } else {
      const { data: newMemory } = await supabase
        .from('conversation_memory')
        .insert({
          session_id: sessionId,
          context: {},
          history: []
        })
        .select()
        .single();
      conversationMemory = newMemory;
    }

    const context = conversationMemory?.context as ConversationContext || {};
    const history = conversationMemory?.history || [];

    // Build messages with context
    const messages = [
      {
        role: 'system',
        content: `Tu es Alex, l'assistant virtuel de TopRéparateurs.fr, la plateforme n°1 de mise en relation avec des réparateurs de smartphones.

**Contexte utilisateur actuel:**
${context.device_brand ? `- Appareil: ${context.device_brand} ${context.device_model || ''}` : ''}
${context.problem_type ? `- Problème: ${context.problem_type}` : ''}
${context.location ? `- Localisation: ${context.location}` : ''}
${context.budget_range ? `- Budget: ${context.budget_range}` : ''}
${context.urgency ? `- Urgence: ${context.urgency}` : ''}

**Tes objectifs:**
1. Comprendre le besoin précis de l'utilisateur (appareil, problème, localisation)
2. Extraire et mémoriser les informations clés
3. Proposer des actions concrètes (recherche réparateur, demande devis)
4. Être chaleureux, professionnel et efficace

**Actions disponibles:**
- search_repairers: Chercher des réparateurs près de l'utilisateur
- request_quote: Créer une demande de devis
- get_pricing: Estimer le prix d'une réparation
- book_appointment: Réserver un rendez-vous`
      },
      ...history.slice(-10), // Keep last 10 messages
      { role: 'user', content: message }
    ];

    // Call Lovable AI with tool calling
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_context',
              description: 'Extract and update user context from conversation',
              parameters: {
                type: 'object',
                properties: {
                  device_brand: { type: 'string', description: 'Brand of device (iPhone, Samsung, etc.)' },
                  device_model: { type: 'string', description: 'Model of device' },
                  problem_type: { type: 'string', description: 'Type of problem (écran cassé, batterie, etc.)' },
                  location: { type: 'string', description: 'User location (city, postal code)' },
                  budget_range: { type: 'string', description: 'Budget range' },
                  urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Urgency level' }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'search_repairers',
              description: 'Search for repairers near user location',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'City or postal code' },
                  specialty: { type: 'string', description: 'Device brand or problem type' },
                  max_results: { type: 'number', description: 'Maximum number of results', default: 5 }
                },
                required: ['location']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'request_quote',
              description: 'Create a quote request for repair',
              parameters: {
                type: 'object',
                properties: {
                  device_brand: { type: 'string' },
                  device_model: { type: 'string' },
                  problem_description: { type: 'string' },
                  location: { type: 'string' }
                },
                required: ['device_brand', 'problem_description', 'location']
              }
            }
          }
        ],
        tool_choice: 'auto'
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Lovable AI error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message;
    
    // Process tool calls
    let updatedContext = { ...context };
    const actions: any[] = [];
    
    if (aiMessage.tool_calls) {
      for (const toolCall of aiMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        if (functionName === 'extract_context') {
          updatedContext = { ...updatedContext, ...args };
        } else {
          actions.push({ type: functionName, params: args });
        }
      }
    }

    // Update conversation memory
    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: aiMessage.content }
    ].slice(-20); // Keep last 20 messages

    await supabase
      .from('conversation_memory')
      .update({
        context: updatedContext,
        history: updatedHistory,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('session_id', sessionId);

    // Log analytics
    const latency = Date.now() - startTime;
    await supabase.from('ai_analytics').insert({
      provider: 'lovable',
      model: 'google/gemini-2.5-flash',
      function_name: 'chatbot-lovable',
      latency_ms: latency,
      success: true
    });

    return new Response(
      JSON.stringify({
        response: aiMessage.content,
        context: updatedContext,
        actions,
        provider: 'lovable-ai',
        model: 'gemini-2.5-flash',
        latency_ms: latency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chatbot-lovable:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: "Désolé, je rencontre un problème technique. Puis-je vous aider autrement ?"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
