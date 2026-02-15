import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  conversation_id: string;
}

interface IntegratedMessagingProps {
  conversationId: string;
  userType: 'client' | 'repairer';
  otherParticipant?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'client' | 'repairer';
  };
  quoteId?: string;
}

const IntegratedMessaging: React.FC<IntegratedMessagingProps> = ({
  conversationId,
  userType,
  otherParticipant,
  quoteId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [participantName, setParticipantName] = useState(otherParticipant?.name || 'Interlocuteur');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadConversationInfo();

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`conv_messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
          // Mark as read if not our own message
          if (msg.sender_id !== user?.id) {
            markConversationRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadConversationInfo = async () => {
    if (otherParticipant?.name) return;
    try {
      const { data } = await supabase
        .from('conversations')
        .select('client_id, repairer_id')
        .eq('id', conversationId)
        .single();

      if (data) {
        const otherId = userType === 'client' ? data.repairer_id : data.client_id;
        // Try to get the name from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', otherId)
          .single();

        if (profile) {
          setParticipantName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Interlocuteur');
        }
      }
    } catch {
      // Keep default name
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
      scrollToBottom();
      markConversationRead();
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const markConversationRead = async () => {
    if (!user) return;
    const updateField = userType === 'client' ? 'unread_count_client' : 'unread_count_repairer';
    await supabase
      .from('conversations')
      .update({ [updateField]: 0 })
      .eq('id', conversationId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update conversation last_message_at and unread count for the other party
      const unreadField = userType === 'client' ? 'unread_count_repairer' : 'unread_count_client';
      const { data: conv } = await supabase
        .from('conversations')
        .select(unreadField)
        .eq('id', conversationId)
        .single();

      const currentUnread = (conv as any)?.[unreadField] || 0;
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          [unreadField]: currentUnread + 1
        })
        .eq('id', conversationId);

      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const initials = participantName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{participantName}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {userType === 'client' ? 'Réparateur' : 'Client'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" aria-label="Appel téléphonique">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Appel vidéo">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Plus d'options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Aucun message. Envoyez le premier !
            </div>
          )}
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'opacity-70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" aria-label="Joindre un fichier">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              size="sm"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegratedMessaging;
