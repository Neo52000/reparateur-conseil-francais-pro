
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChatbotMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'bot' | 'system';
  message_type: 'text' | 'diagnostic' | 'quote' | 'appointment' | 'image' | 'voice';
  metadata?: any;
  confidence_score?: number;
  created_at: string;
}

export interface ChatbotConversation {
  id: string;
  session_id: string;
  status: 'active' | 'completed' | 'escalated';
  context: any;
  satisfaction_score?: number;
  created_at: string;
  messages: ChatbotMessage[];
}

export const useChatbot = () => {
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatbotConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les conversations existantes
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select(`
          *,
          chatbot_messages (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = data.map((conv: any) => ({
        ...conv,
        status: conv.status as 'active' | 'completed' | 'escalated',
        messages: conv.chatbot_messages || []
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  }, [user]);

  // Charger la conversation courante
  const loadCurrentConversation = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select(`
          *,
          chatbot_messages (*)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const conversation = {
          ...data,
          status: data.status as 'active' | 'completed' | 'escalated',
          messages: data.chatbot_messages || []
        };
        setCurrentConversation(conversation);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    }
  }, [sessionId]);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Ajouter le message utilisateur immédiatement à l'interface
      const userMessage: ChatbotMessage = {
        id: `temp_${Date.now()}`,
        content,
        sender_type: 'user',
        message_type: messageType as any,
        created_at: new Date().toISOString()
      };

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);

      // Envoyer à l'edge function
      const response = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          message: content,
          sessionId,
          userId: user?.id,
          conversationHistory: currentConversation?.messages || []
        }
      });

      if (response.error) throw response.error;

      const { data } = response;

      // Ajouter la réponse du bot
      const botMessage: ChatbotMessage = {
        id: data.messageId,
        content: data.response,
        sender_type: 'bot',
        message_type: data.type,
        metadata: data.metadata,
        confidence_score: data.confidence,
        created_at: new Date().toISOString()
      };

      setCurrentConversation(prev => {
        if (!prev) return null;
        
        // Remplacer le message temporaire par les vrais messages
        const messages = prev.messages.filter(msg => !msg.id.startsWith('temp_'));
        return {
          ...prev,
          messages: [...messages, userMessage, botMessage],
          context: data.context
        };
      });

      // Recharger pour avoir les vrais IDs
      setTimeout(loadCurrentConversation, 500);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [sessionId, user?.id, currentConversation, isLoading, loadCurrentConversation, toast]);

  // Envoyer un feedback
  const sendFeedback = useCallback(async (
    messageId: string, 
    feedbackType: 'helpful' | 'not_helpful' | 'incorrect' | 'suggestion',
    feedbackText?: string
  ) => {
    try {
      const { error } = await supabase
        .from('chatbot_feedback')
        .insert({
          conversation_id: currentConversation?.id,
          message_id: messageId,
          feedback_type: feedbackType,
          feedback_text: feedbackText,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Merci !",
        description: "Votre feedback nous aide à améliorer l'assistant."
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
    }
  }, [currentConversation?.id, user?.id, toast]);

  // Terminer la conversation avec satisfaction
  const endConversation = useCallback(async (satisfactionScore?: number) => {
    if (!currentConversation) return;

    try {
      await supabase
        .from('chatbot_conversations')
        .update({
          status: 'completed',
          satisfaction_score: satisfactionScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', currentConversation.id);

      setCurrentConversation(null);
      
      if (user) {
        loadConversations();
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture de la conversation:', error);
    }
  }, [currentConversation, user, loadConversations]);

  // Démarrer une nouvelle conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
    // Le sessionId reste le même, une nouvelle conversation sera créée au premier message
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
    loadCurrentConversation();
  }, [user, loadConversations, loadCurrentConversation]);

  return {
    conversations,
    currentConversation,
    isLoading,
    isTyping,
    sendMessage,
    sendFeedback,
    endConversation,
    startNewConversation,
    refreshConversations: loadConversations
  };
};
