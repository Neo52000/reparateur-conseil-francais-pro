
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
      // Utiliser ai-router qui gère plusieurs fournisseurs d'IA avec fallback
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'start_conversation',
          text: 'Bonjour, je cherche de l\'aide pour la réparation de mon smartphone',
          language_hint: 'fr',
          session_id: sessionId,
          user_id: user?.id
        }
      });

      if (error) throw error;

      setConversationId(sessionId);
      setMessages([{
        id: '1',
        content: data.response || "Bonjour ! Je suis là pour vous aider avec vos questions de réparation smartphone. Comment puis-je vous aider ?",
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: data.suggestions || ["Demander un devis", "Trouver un réparateur", "Questions générales"],
        actions: data.actions
      }]);
    } catch (error) {
      console.error('Erreur démarrage conversation:', error);
      // Fallback avec message par défaut
      setConversationId(sessionId);
      setMessages([{
        id: '1',
        content: "Bonjour ! Je rencontre des difficultés techniques mais je peux quand même vous aider. Souhaitez-vous consulter notre FAQ ou prendre rendez-vous directement ?",
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: ["Consulter la FAQ", "Prendre rendez-vous", "Trouver un réparateur"]
      }]);
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
      // Utiliser ai-router avec fallback automatique entre différents fournisseurs
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'send_message',
          text: content,
          language_hint: 'fr',
          session_id: conversationId,
          user_id: user?.id
        }
      });

      if (error) throw error;

      // Délai variable selon la confiance et le type de réponse
      const confidence = data.confidence || 0.7;
      const baseDelay = confidence > 0.8 ? 800 : confidence > 0.6 ? 1200 : 1800;
      const randomDelay = baseDelay + Math.random() * 500;

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response || "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?",
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions || ["Reformuler", "Consulter la FAQ", "Prendre rendez-vous"],
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, randomDelay);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setIsTyping(false);
      
      // Fallback intelligent avec options utiles
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "Je ne peux pas joindre l'IA pour le moment. Voulez-vous consulter notre FAQ ou prendre rendez-vous ?",
        sender_type: 'bot',
        timestamp: new Date(),
        suggestions: ["Consulter la FAQ", "Prendre rendez-vous", "Trouver un réparateur", "Recommencer"]
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
