import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedToast } from '@/lib/utils/enhancedToast';

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message_text: string;
  attachments: any;
  read_at: string | null;
  created_at: string;
}

export const useMessages = (quoteId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    
    loadMessages();
    
    // Subscribe to real-time messages
    const subscription = supabase
      .channel(`quote_messages:${quoteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_messages',
          filter: `quote_id=eq.${quoteId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [quoteId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_messages')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      enhancedToast.error({
        title: 'Erreur',
        description: 'Impossible de charger les messages'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText: string, senderType: 'client' | 'repairer') => {
    setSending(true);
    try {
      const { error } = await supabase
        .from('quote_messages')
        .insert({
          quote_id: quoteId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          sender_type: senderType,
          message_text: messageText
        });

      if (error) throw error;
      
      enhancedToast.success({
        title: 'Message envoyé',
        description: 'Votre message a été envoyé avec succès'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      enhancedToast.error({
        title: 'Erreur',
        description: "Impossible d'envoyer le message"
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('quote_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead
  };
};
