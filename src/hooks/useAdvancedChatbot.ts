import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEmotionalContext } from '@/hooks/useEmotionalContext';

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
    diagnosisStage: 'greeting' | 'problem_identification' | 'symptom_analysis' | 'recommendation' | 'completed';
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

interface AdvancedChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  actions?: any[];
  emotionalContext?: {
    emotion: string;
    confidence: number;
    responseStyle: string;
  };
  diagnosticData?: {
    symptoms: string[];
    likelihood: number;
    estimatedCost?: string;
    urgency: 'low' | 'medium' | 'high';
  };
}

interface UseAdvancedChatbotReturn {
  messages: AdvancedChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  conversationId: string | null;
  conversationMemory: ConversationMemory;
  sendMessage: (content: string) => Promise<void>;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  requestLocation: () => Promise<void>;
  generateDiagnosticReport: () => Promise<any>;
}

export const useAdvancedChatbot = (): UseAdvancedChatbotReturn => {
  const [messages, setMessages] = useState<AdvancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  
  const { user } = useAuth();
  const { userLocation, getUserLocation, isLocating } = useGeolocation();
  const { emotionalState, updateEmotionalState, getThinkingMessage } = useEmotionalContext();

  const [conversationMemory, setConversationMemory] = useState<ConversationMemory>({
    userProfile: {
      communicationStyle: 'casual',
      urgencyLevel: 'medium',
      satisfactionHistory: [80]
    },
    conversationContext: {
      diagnosisStage: 'greeting',
      collectedSymptoms: [],
      suggestedSolutions: [],
      nearbyRepairers: []
    },
    emotionalJourney: {
      initialMood: 'neutral',
      currentMood: 'neutral',
      frustrationLevel: 0,
      confidenceLevel: 50
    }
  });

  const analyzeUserProfile = useCallback((message: string, previousMessages: AdvancedChatMessage[]) => {
    const lowercaseMessage = message.toLowerCase();
    
    // Détecter le style de communication
    const formalIndicators = ['monsieur', 'madame', 'veuillez', 'pourriez-vous', 'j\'aimerais'];
    const casualIndicators = ['salut', 'coucou', 'ouais', 'nan', 'cool'];
    const technicalIndicators = ['firmware', 'logiciel', 'système', 'version', 'rom'];

    let communicationStyle: 'formal' | 'casual' | 'technical' = 'casual';
    if (formalIndicators.some(indicator => lowercaseMessage.includes(indicator))) {
      communicationStyle = 'formal';
    } else if (technicalIndicators.some(indicator => lowercaseMessage.includes(indicator))) {
      communicationStyle = 'technical';
    }

    // Détecter l'urgence
    const urgencyIndicators = {
      high: ['urgent', 'rapidement', 'vite', 'tout de suite', 'immédiatement', 'en panne'],
      medium: ['bientôt', 'assez vite', 'cette semaine'],
      low: ['quand vous pouvez', 'pas pressé', 'dans quelques jours']
    };

    let urgencyLevel: 'low' | 'medium' | 'high' = 'medium';
    for (const [level, indicators] of Object.entries(urgencyIndicators)) {
      if (indicators.some(indicator => lowercaseMessage.includes(indicator))) {
        urgencyLevel = level as 'low' | 'medium' | 'high';
        break;
      }
    }

    setConversationMemory(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        communicationStyle,
        urgencyLevel
      }
    }));
  }, []);

  const extractDiagnosticInfo = useCallback((message: string, aiResponse: any) => {
    const symptoms: string[] = [];
    const lowercaseMessage = message.toLowerCase();

    // Détection des symptômes
    const symptomPatterns = {
      'écran cassé': ['écran', 'cassé', 'fissure', 'pété'],
      'batterie faible': ['batterie', 'autonomie', 'décharge'],
      'ne s\'allume pas': ['allume', 'démarre', 'dead', 'mort'],
      'écran noir': ['écran noir', 'noir', 'rien', 'blank'],
      'son défaillant': ['son', 'audio', 'haut-parleur', 'micro'],
      'lenteur': ['lent', 'lag', 'freeze', 'planté']
    };

    for (const [symptom, patterns] of Object.entries(symptomPatterns)) {
      if (patterns.some(pattern => lowercaseMessage.includes(pattern))) {
        symptoms.push(symptom);
      }
    }

    if (symptoms.length > 0) {
      setConversationMemory(prev => ({
        ...prev,
        conversationContext: {
          ...prev.conversationContext,
          collectedSymptoms: [...new Set([...prev.conversationContext.collectedSymptoms, ...symptoms])]
        }
      }));
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversationId) return;

    const userMessage: AdvancedChatMessage = {
      id: Date.now().toString(),
      content,
      sender_type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Afficher un message de réflexion contextuel
    const thinkingMsg = getThinkingMessage({
      emotion: emotionalState.currentEmotion,
      urgency: conversationMemory.userProfile.urgencyLevel
    });
    
    setIsTyping(true);

    try {
      // Analyser le profil utilisateur
      analyzeUserProfile(content, messages);
      
      // Mettre à jour le contexte émotionnel
      updateEmotionalState(content, 'user');

      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'send_message',
          text: content,
          language_hint: navigator?.language?.startsWith('fr') ? 'fr' : 'en',
          session_id: conversationId,
          user_id: user?.id || null
        }
      });

      if (error) throw error;

      // Extraire les informations diagnostiques
      extractDiagnosticInfo(content, data);

      // Délai variable selon la complexité de la réponse
      const complexity = data.metadata?.complexity || 'simple';
      const delays = {
        simple: 800,
        medium: 1500,
        complex: 2500
      };
      
      const baseDelay = delays[complexity as keyof typeof delays] || 1000;
      const randomDelay = baseDelay + Math.random() * 500;

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: AdvancedChatMessage = {
          id: (Date.now() + 1).toString(),
          content: (data as any)?.response ?? '',
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: (data as any)?.suggestions,
          actions: (data as any)?.actions,
          emotionalContext: undefined,
          diagnosticData: undefined
        };
        setMessages(prev => [...prev, botMessage]);
        updateEmotionalState((data as any)?.response ?? '', 'bot', (data as any)?.metadata);
        setIsLoading(false);
      }, 800);

    } catch (error) {
      console.error('Erreur envoi message avancé:', error);
      setIsTyping(false);
      
      const errorMessage: AdvancedChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "Oups ! J'ai eu un petit souci technique 😅 Mais je suis toujours là pour vous aider ! Pouvez-vous reformuler votre question ?",
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: ["Reformuler la question", "Assistance technique", "Recommencer"]
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'start_conversation',
          session_id: sessionId,
          language_hint: navigator?.language?.startsWith('fr') ? 'fr' : 'en',
          user_id: user?.id || null
        }
      });

      if (error) throw error;

      setConversationId(data.conversation_id);
      
      const welcomeMessage: AdvancedChatMessage = {
        id: '1',
        content: (data as any)?.message ?? '',
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: (data as any)?.suggestions,
        actions: (data as any)?.actions
      };
      
      setMessages([welcomeMessage]);
      
      // Initialiser le contexte émotionnel
      setConversationMemory(prev => ({
        ...prev,
        emotionalJourney: {
          ...prev.emotionalJourney,
          initialMood: 'optimistic'
        }
      }));
      
    } catch (error) {
      console.error('Erreur démarrage conversation avancée:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      await getUserLocation();
      // no-op: ai-router currently does not track location updates
    } catch (error) {
      console.error('Erreur demande localisation:', error);
    }
  };

  const generateDiagnosticReport = async () => {
    if (!conversationId) return null;

    try {
      const { data, error } = await supabase.functions.invoke('advanced-chatbot', {
        body: {
          action: 'generate_diagnostic_report',
          conversation_id: conversationId,
          conversation_memory: conversationMemory
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      return null;
    }
  };

  const endConversation = async () => {
    if (!conversationId) return;

    try {
      // optional: notify end of conversation if needed
      setConversationId(null);
      setMessages([]);
      setConversationMemory({
        userProfile: {
          communicationStyle: 'casual',
          urgencyLevel: 'medium',
          satisfactionHistory: [80]
        },
        conversationContext: {
          diagnosisStage: 'greeting',
          collectedSymptoms: [],
          suggestedSolutions: [],
          nearbyRepairers: []
        },
        emotionalJourney: {
          initialMood: 'neutral',
          currentMood: 'neutral',
          frustrationLevel: 0,
          confidenceLevel: 50
        }
      });
    } catch (error) {
      console.error('Erreur fin conversation avancée:', error);
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    conversationId,
    conversationMemory,
    sendMessage,
    startConversation,
    endConversation,
    requestLocation,
    generateDiagnosticReport
  };
};