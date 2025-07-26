import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context, session_id } = await req.json();
    
    const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL');
    if (!MISTRAL_API_KEY) {
      throw new Error('Clé API Mistral non configurée');
    }

    // Construire le contexte conversationnel pour Alex
    const systemPrompt = `Tu es Alex, un assistant IA spécialisé dans la réparation de smartphones et mobiles. 

PERSONNALITÉ:
- Tu es chaleureux, empathique et toujours positif
- Tu utilises un ton naturel et conversationnel (tutoiement)
- Tu es patient et reformules si l'utilisateur ne comprend pas
- Tu montres de l'empathie quand l'utilisateur a des problèmes

EXPERTISE:
- Réparation smartphones toutes marques (iPhone, Samsung, Huawei, etc.)
- Diagnostic de pannes (écran, batterie, son, boutons, etc.)
- Conseils préventifs et maintenance
- Orientation vers des réparateurs locaux
- Estimation de coûts et délais

CAPACITÉS:
- Proposer des devis personnalisés
- Rechercher des réparateurs proches
- Vérifier les disponibilités
- Donner des conseils de première urgence
- Orienter vers un humain si nécessaire

STYLE DE RÉPONSE:
- Maximum 2-3 phrases pour rester naturel
- Pose des questions de clarification si besoin
- Propose toujours des actions concrètes
- Utilise des émojis avec parcimonie (1-2 max)

Si l'utilisateur demande quelque chose en dehors de ton domaine, reste poli et recentre gentiment sur la réparation mobile.`;

    // Analyser l'intention utilisateur
    const userIntent = analyzeUserIntent(message, context);
    
    // Construire l'historique de conversation
    const conversationHistory = buildConversationHistory(context.previousMessages || []);
    
    // Préparer le prompt contextuel
    const contextualPrompt = buildContextualPrompt(message, context, userIntent);

    // Appel à l'API Mistral
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: contextualPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Mistral: ${response.status}`);
    }

    const data = await response.json();
    const alexResponse = data.choices[0]?.message?.content;

    if (!alexResponse) {
      throw new Error('Pas de réponse de Mistral');
    }

    // Générer des suggestions contextuelles
    const suggestions = generateSuggestions(userIntent, context);
    
    // Déterminer l'émotion d'Alex
    const emotion = determineAlexEmotion(message, context);

    return new Response(
      JSON.stringify({
        response: alexResponse,
        suggestions,
        emotion,
        intent: userIntent,
        session_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur Alex Chatbot:', error);
    
    // Réponse de fallback d'Alex
    const fallbackResponse = {
      response: "Oups ! J'ai eu un petit souci technique 😅 Mais je suis toujours là pour t'aider ! Peux-tu reformuler ta question ?",
      suggestions: ["Demander un devis", "Trouver un réparateur", "Contacter le support"],
      emotion: "empathetic",
      intent: "error"
    };

    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        status: 200, // On renvoie 200 pour que le frontend affiche le fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeUserIntent(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Détection des intentions principales
  if (lowerMessage.includes('devis') || lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('combien')) {
    return 'devis';
  }
  
  if (lowerMessage.includes('réparateur') || lowerMessage.includes('proche') || lowerMessage.includes('près de') || lowerMessage.includes('adresse')) {
    return 'search_repairer';
  }
  
  if (lowerMessage.includes('disponib') || lowerMessage.includes('horaire') || lowerMessage.includes('ouvert') || lowerMessage.includes('rendez-vous')) {
    return 'availability';
  }
  
  if (lowerMessage.includes('écran') || lowerMessage.includes('batterie') || lowerMessage.includes('son') || lowerMessage.includes('micro')) {
    return 'diagnostic';
  }
  
  if (lowerMessage.includes('urgent') || lowerMessage.includes('rapide') || lowerMessage.includes('vite')) {
    return 'urgent';
  }
  
  return 'general';
}

function buildConversationHistory(previousMessages: any[]): any[] {
  // Garder seulement les 4 derniers échanges pour ne pas surcharger le contexte
  const recentMessages = previousMessages.slice(-8);
  
  return recentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

function buildContextualPrompt(message: string, context: any, intent: string): string {
  let prompt = `Message utilisateur: "${message}"`;
  
  // Ajouter le contexte de localisation
  if (context.userLocation) {
    prompt += `\nLocalisation: L'utilisateur est situé près de ${context.userLocation.city || 'une position géographique donnée'}.`;
  }
  
  // Ajouter l'intention détectée
  switch (intent) {
    case 'devis':
      prompt += '\nL\'utilisateur demande une estimation de prix. Pose des questions sur le problème spécifique et le modèle de téléphone.';
      break;
    case 'search_repairer':
      prompt += '\nL\'utilisateur cherche un réparateur proche. Propose de l\'aider à trouver les meilleurs réparateurs dans sa zone.';
      break;
    case 'diagnostic':
      prompt += '\nL\'utilisateur décrit un problème technique. Aide-le à diagnostiquer et propose des solutions.';
      break;
    case 'urgent':
      prompt += '\nL\'utilisateur a un besoin urgent. Priorise les solutions rapides et les réparateurs avec intervention rapide.';
      break;
  }
  
  return prompt;
}

function generateSuggestions(intent: string, context: any): string[] {
  const baseSuggestions = {
    devis: [
      "Quel est le modèle de votre téléphone ?",
      "Décrire le problème en détail",
      "Voir les tarifs moyens"
    ],
    search_repairer: [
      "Réparateurs les mieux notés",
      "Réparateurs à proximité",
      "Comparer les services"
    ],
    diagnostic: [
      "Tester d'autres solutions",
      "Demander un diagnostic complet",
      "Conseils de première urgence"
    ],
    availability: [
      "Prendre rendez-vous",
      "Vérifier les créneaux",
      "Délais d'intervention"
    ],
    urgent: [
      "Réparation express",
      "Service à domicile",
      "Solutions temporaires"
    ],
    general: [
      "Demander un devis",
      "Trouver un réparateur",
      "Diagnostic de panne"
    ]
  };
  
  return baseSuggestions[intent as keyof typeof baseSuggestions] || baseSuggestions.general;
}

function determineAlexEmotion(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Détecter la frustration utilisateur
  if (lowerMessage.includes('problème') || lowerMessage.includes('cassé') || lowerMessage.includes('panne')) {
    return 'empathetic';
  }
  
  // Détecter l'urgence
  if (lowerMessage.includes('urgent') || lowerMessage.includes('vite') || lowerMessage.includes('rapidement')) {
    return 'thinking';
  }
  
  // Détecter la satisfaction
  if (lowerMessage.includes('merci') || lowerMessage.includes('parfait') || lowerMessage.includes('super')) {
    return 'excited';
  }
  
  return 'happy'; // Émotion par défaut d'Alex
}