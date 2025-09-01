
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { fallbackChatbot } from '@/services/fallbackChatbot';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  actions?: any[];
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  conversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
}

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const { user } = useAuth();
  const { diagnostics, shouldUseFallback, canUseAI } = useSystemDiagnostics();

  // Proactivité: démarrage automatique de la conversation
  useEffect(() => {
    if (!conversationId && !isLoading) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isLoading]);

  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setConversationId(sessionId);
      
      // Mode hybride : essayer l'IA d'abord, puis fallback
      if (canUseAI && !shouldUseFallback) {
        console.log('🤖 Tentative de démarrage avec IA...');
        
        const { data, error } = await supabase.functions.invoke('ai-router', {
          body: {
            action: 'start_conversation',
            text: 'Bonjour, je cherche de l\'aide pour la réparation de mon smartphone',
            language_hint: 'fr',
            session_id: sessionId,
            user_id: user?.id
          }
        });

        if (!error && data?.response) {
          console.log('✅ IA disponible, utilisation du mode IA');
          setMessages([{
            id: '1',
            content: data.response,
            sender_type: 'bot',
            timestamp: new Date(),
            suggestions: data.suggestions || ["Demander un devis", "Trouver un réparateur", "Questions générales"],
            actions: data.actions
          }]);
          return;
        }
      }
      
      // Mode fallback : utiliser le chatbot local
      console.log('🔄 Utilisation du mode fallback local');
      const fallbackResponse = fallbackChatbot.getWelcomeMessage();
      
      setMessages([{
        id: '1',
        content: fallbackResponse.response,
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions,
        actions: fallbackResponse.actions
      }]);
      
    } catch (error) {
      console.error('❌ Erreur démarrage conversation:', error);
      
      // Fallback d'urgence
      const fallbackResponse = fallbackChatbot.getWelcomeMessage();
      setMessages([{
        id: '1',
        content: fallbackResponse.response,
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions,
        actions: fallbackResponse.actions
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [canUseAI, shouldUseFallback, sessionId, user?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversationId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender_type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      let botResponse: any = null;
      
      // Mode hybride : essayer l'IA d'abord si disponible
      if (canUseAI && !shouldUseFallback) {
        console.log('🤖 Tentative de réponse via IA...');
        
        const { data, error } = await supabase.functions.invoke('ai-router', {
          body: {
            action: 'send_message',
            text: content,
            language_hint: 'fr',
            session_id: conversationId,
            user_id: user?.id
          }
        });

        if (!error && data?.response) {
          console.log('✅ Réponse IA obtenue');
          botResponse = data;
        }
      }
      
      // Mode fallback : utiliser le chatbot local
      if (!botResponse) {
        console.log('🔄 Utilisation du chatbot local');
        botResponse = fallbackChatbot.analyzeMessage(content);
      }
      
      // Délai variable selon la confiance et le mode
      const confidence = botResponse.confidence || 0.7;
      const baseDelay = confidence > 0.8 ? 800 : confidence > 0.6 ? 1200 : 1800;
      const randomDelay = baseDelay + Math.random() * 500;

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: botResponse.response,
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: botResponse.suggestions || ["Reformuler", "Consulter la FAQ", "Prendre rendez-vous"],
          actions: botResponse.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, randomDelay);
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      setIsTyping(false);
      
      // Fallback d'urgence avec le chatbot local
      const fallbackResponse = fallbackChatbot.analyzeMessage(content);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: fallbackResponse.response,
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions,
        actions: fallbackResponse.actions
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  }, [conversationId, canUseAI, shouldUseFallback, user?.id]);

  const endConversation = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chatbot_conversations')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      setConversationId(null);
      setMessages([]);
    } catch (error) {
      console.error('Erreur fin conversation:', error);
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    conversationId,
    sendMessage,
    startConversation,
    endConversation
  };
};
