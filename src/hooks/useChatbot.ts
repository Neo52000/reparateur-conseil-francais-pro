
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  // Proactivité: démarrage automatique de la conversation
  useEffect(() => {
    if (!conversationId && !isLoading) {
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isLoading]);

  const startConversation = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('chatbot-gpt5', {
        body: {
          action: 'start_conversation',
          session_id: sessionId,
          user_id: user?.id,
          owner_id: user?.id
        }
      });

      if (error) throw error;

      setConversationId(data.conversation_id);
      setMessages([{
        id: '1',
        content: data.message,
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: data.suggestions,
        actions: data.actions
      }]);
    } catch (error) {
      console.error('Erreur démarrage conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
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
      const { data, error } = await supabase.functions.invoke('chatbot-gpt5', {
        body: {
          action: 'send_message',
          user_id: user?.id,
          owner_id: user?.id,
          message: {
            conversation_id: conversationId,
            content
          }
        }
      });

      if (error) throw error;

      // Délai variable selon la confiance et le type de réponse
      const confidence = data.confidence || 0.7;
      const baseDelay = confidence > 0.8 ? 800 : confidence > 0.6 ? 1200 : 1800;
      const randomDelay = baseDelay + Math.random() * 500; // Ajouter de la variabilité

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions,
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        // Mettre à jour l'ID de conversation si renvoyé
        if (data.conversation_id) setConversationId(data.conversation_id);
      }, randomDelay);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setIsTyping(false);
      
      // Message d'erreur plus humain
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "Désolé, j'ai eu un petit problème technique 😅 Pouvez-vous répéter votre question ?",
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: ["Répéter la question", "Parler à un conseiller", "Recommencer"]
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

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
