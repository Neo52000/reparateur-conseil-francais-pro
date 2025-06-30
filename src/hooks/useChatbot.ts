
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

  const startConversation = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          action: 'start_conversation',
          session_id: sessionId,
          user_id: user?.id
        }
      });

      if (error) throw error;

      setConversationId(data.conversation_id);
      setMessages([{
        id: '1',
        content: data.message,
        sender_type: 'bot',
        timestamp: new Date()
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
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          action: 'send_message',
          message: {
            conversation_id: conversationId,
            content
          }
        }
      });

      if (error) throw error;

      // Simuler un délai de réflexion
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
      }, 1500);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setIsTyping(false);
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
